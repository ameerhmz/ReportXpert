import sys
import requests
import json
import logging
import threading
from typing import Dict, Any, List, Optional
from enum import Enum
from .config import settings
from .org_config import org_config

logger = logging.getLogger("model_registry")

class TaskType(str, Enum):
    VISION_INSPECTION = "VISION_INSPECTION"
    AUDIT_REASONING = "AUDIT_REASONING"
    SUPERVISOR_PLANNING = "SUPERVISOR_PLANNING"
    ENGINEERING_CODE = "ENGINEERING_CODE"
    DOCUMENT_SUMMARY = "DOCUMENT_SUMMARY"

class ModelRegistry:
    """
    Pluggable Model Registry and Dynamic Auto-Router for ReportXpert.
    Routes tasks to the optimal open-weight model based on task intent and input modalities.
    """

    def __init__(self):
        self._cancel_flags: Dict[str, threading.Event] = {}
        self._active_sockets: Dict[str, Any] = {}
        self._token_callbacks: Dict[str, Any] = {}
        self._lock = threading.Lock()

        self.registered_models = {
            TaskType.VISION_INSPECTION: {
                "name": settings.VISION_MODEL,
                "role": "Visual Document & Blueprint Extractor",
                "target_device": "RTX 4060 GPU Node (vLLM)",
                "context_window": 4096,
                "quantization": "4-bit AWQ"
            },
            TaskType.AUDIT_REASONING: {
                "name": settings.AUDITOR_MODEL,
                "role": "SOP & Statutory Compliance Auditor",
                "target_device": "RTX 4060 GPU Node (vLLM)",
                "context_window": 4096,
                "quantization": "4-bit AWQ"
            },
            TaskType.SUPERVISOR_PLANNING: {
                "name": settings.SUPERVISOR_MODEL,
                "role": "Orchestrator & Task Decomposition Agent",
                "target_device": "MacBook Air M4 (Localhost)",
                "context_window": 4096,
                "quantization": "4-bit AWQ / GGUF"
            },
            TaskType.ENGINEERING_CODE: {
                "name": "Qwen2.5-Coder-7B-Instruct",
                "role": "Sandboxed Python & Engineering Math Coder",
                "target_device": "Local / GPU Node",
                "context_window": 8192,
                "quantization": "4-bit AWQ"
            }
        }

    def register_task(self, task_id: str) -> threading.Event:
        """Registers a task ID to enable instant user-directed cancellation."""
        with self._lock:
            evt = threading.Event()
            self._cancel_flags[task_id] = evt
            return evt

    def register_token_callback(self, task_id: str, callback: Any):
        """Registers a thread-safe streaming callback for token deltas."""
        with self._lock:
            self._token_callbacks[task_id] = callback

    def unregister_token_callback(self, task_id: str):
        """Unregisters streaming callback for a task."""
        with self._lock:
            self._token_callbacks.pop(task_id, None)

    def cancel_task(self, task_id: Optional[str] = None):
        """
        Immediately signals cancellation to a specific task or all active tasks,
        severing any active streaming socket to Ollama/vLLM to release GPU compute.
        """
        with self._lock:
            if task_id and task_id in self._cancel_flags:
                self._cancel_flags[task_id].set()
                sock = self._active_sockets.get(task_id)
                if sock:
                    try:
                        sock.close()
                    except Exception:
                        pass
            else:
                for tid, evt in list(self._cancel_flags.items()):
                    evt.set()
                for tid, sock in list(self._active_sockets.items()):
                    try:
                        sock.close()
                    except Exception:
                        pass

    def is_vllm_online(self) -> bool:
        """Checks if local LAN NVIDIA CUDA vLLM node is actively responding."""
        try:
            r = requests.get(f"{settings.VLLM_API_BASE}/models", timeout=0.25)
            return r.status_code == 200
        except Exception:
            return False

    def get_available_ollama_models(self) -> List[str]:
        """Fetches active local models from Ollama."""
        try:
            r = requests.get(f"{settings.OLLAMA_API_BASE}/api/tags", timeout=1.0)
            if r.status_code == 200:
                return [m["name"] for m in r.json().get("models", [])]
        except Exception:
            pass
        return []

    def get_best_vision_model(self) -> str:
        """Finds best available vision model on Ollama or vLLM."""
        if self.is_vllm_online():
            return settings.VISION_MODEL
        tags = self.get_available_ollama_models()
        for t in tags:
            if any(k in t.lower() for k in ["qwen2.5vl", "vl", "vision", "moondream", "minicpm", "llava"]):
                return t
        return "qwen2.5vl:3b"

    def get_best_reasoning_model(self) -> str:
        """Finds best available reasoning model on Ollama or vLLM."""
        if self.is_vllm_online():
            return settings.AUDITOR_MODEL
        tags = self.get_available_ollama_models()
        for t in tags:
            if any(k in t.lower() for k in ["deepseek", "r1"]):
                return t
        return "deepseek-r1:7b"

    def get_best_supervisor_model(self) -> str:
        """Finds best available supervisor/orchestrator model on Ollama or vLLM."""
        if self.is_vllm_online():
            return settings.SUPERVISOR_MODEL
        tags = self.get_available_ollama_models()
        for t in tags:
            if any(k in t.lower() for k in ["llama3.2", "llama3.1", "llama3", "llama"]):
                return t
        if tags:
            return tags[0]
        return "llama3.2:3b"

    def get_best_coder_model(self) -> str:
        """Finds best available coding model on Ollama or vLLM."""
        if self.is_vllm_online():
            return "Qwen2.5-Coder-7B-Instruct"
        tags = self.get_available_ollama_models()
        for t in tags:
            if any(k in t.lower() for k in ["coder", "codellama", "starcoder", "deepseek-coder"]):
                return t
        return self.get_best_supervisor_model()

    def get_active_models(self) -> Dict[str, Any]:
        """Returns dynamic active models mapping reflecting live system state."""
        vllm_up = self.is_vllm_online()
        vis_model = settings.VISION_MODEL if vllm_up else self.get_best_vision_model()
        aud_model = settings.AUDITOR_MODEL if vllm_up else self.get_best_reasoning_model()
        sup_model = settings.SUPERVISOR_MODEL if vllm_up else self.get_best_supervisor_model()
        cod_model = "Qwen2.5-Coder-7B-Instruct" if vllm_up else self.get_best_coder_model()
        dev = "RTX 4060 GPU Node (vLLM AWQ)" if vllm_up else "Apple Silicon M4 (Metal GPU)"
        quant = "4-bit AWQ" if vllm_up else "4-bit GGUF"

        return {
            TaskType.VISION_INSPECTION.value: {
                "name": vis_model,
                "role": "Visual Document & Blueprint Extractor",
                "target_device": dev,
                "context_window": 4096,
                "quantization": quant
            },
            TaskType.AUDIT_REASONING.value: {
                "name": aud_model,
                "role": "SOP & Statutory Compliance Auditor",
                "target_device": dev,
                "context_window": 4096,
                "quantization": quant
            },
            TaskType.SUPERVISOR_PLANNING.value: {
                "name": sup_model,
                "role": "Orchestrator & Task Decomposition Agent",
                "target_device": dev,
                "context_window": 4096,
                "quantization": quant
            },
            TaskType.ENGINEERING_CODE.value: {
                "name": cod_model,
                "role": "Sandboxed Python & Engineering Math Coder",
                "target_device": dev,
                "context_window": 8192,
                "quantization": quant
            }
        }

    def route_task(self, prompt: str, has_image: bool = False, file_extension: Optional[str] = None) -> Dict[str, Any]:
        """
        Dynamically selects the appropriate model for a given task.
        Seamlessly offloads to RTX 4060 CUDA node when available, or executes 100% locally
        on Apple Silicon M4 Metal GPU.
        """
        prompt_lower = prompt.lower()
        vllm_up = self.is_vllm_online()

        if has_image or (file_extension and file_extension.lower() in [".png", ".jpg", ".jpeg", ".bmp", ".pdf"]):
            selected_type = TaskType.VISION_INSPECTION
            selected_model = settings.VISION_MODEL if vllm_up else self.get_best_vision_model()
            target_device = "RTX 4060 GPU Node (vLLM AWQ)" if vllm_up else "Apple Silicon M4 (Metal GPU)"
            quantization = "4-bit AWQ" if vllm_up else "4-bit GGUF"
            role = "Visual Document & Blueprint Extractor"
        elif any(k in prompt_lower for k in org_config.calc_keywords):
            selected_type = TaskType.ENGINEERING_CODE
            selected_model = "Qwen2.5-Coder-7B-Instruct" if vllm_up else self.get_best_coder_model()
            target_device = "RTX 4060 GPU Node (vLLM AWQ)" if vllm_up else "Apple Silicon M4 (Metal GPU)"
            quantization = "4-bit AWQ" if vllm_up else "4-bit GGUF"
            role = "Sandboxed Python & Engineering Math Coder"
        elif any(k in prompt_lower for k in org_config.audit_keywords):
            selected_type = TaskType.AUDIT_REASONING
            selected_model = settings.AUDITOR_MODEL if vllm_up else self.get_best_reasoning_model()
            target_device = "RTX 4060 GPU Node (vLLM AWQ)" if vllm_up else "Apple Silicon M4 (Metal GPU)"
            quantization = "4-bit AWQ" if vllm_up else "4-bit GGUF"
            role = "SOP & Statutory Compliance Auditor"
        else:
            selected_type = TaskType.SUPERVISOR_PLANNING
            selected_model = settings.SUPERVISOR_MODEL if vllm_up else self.get_best_supervisor_model()
            target_device = "RTX 4060 GPU Node (vLLM AWQ)" if vllm_up else "Apple Silicon M4 (Metal GPU)"
            quantization = "4-bit AWQ" if vllm_up else "4-bit GGUF"
            role = "Orchestrator & Task Decomposition Agent"

        return {
            "task_type": selected_type.value,
            "selected_model": selected_model,
            "model_role": role,
            "target_device": target_device,
            "quantization": quantization
        }

    def query_llm_with_trace(
        self,
        model_name: str,
        messages: List[Dict[str, Any]],
        temperature: float = 0.2,
        max_tokens: int = 1500,
        task_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes query against local vLLM endpoint, Ollama, or raises error (strictly NO fake simulations).
        Returns exact execution trace: model name, hardware device, latency, tokens generated, and tokens/sec.
        Supports instant user-initiated cancellation via task_id.
        """
        import time

        start_time = time.time()

        # Attempt 1: vLLM Server on LAN / Localhost (NVIDIA GPU Node)
        try:
            probe = requests.get(f"{settings.VLLM_API_BASE}/models", timeout=0.3)
            if probe.status_code == 200:
                url = f"{settings.VLLM_API_BASE}/chat/completions"
                payload = {
                    "model": model_name,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }
                res = requests.post(url, json=payload, timeout=60.0)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    latency_ms = round((time.time() - start_time) * 1000)
                    usage = data.get("usage", {})
                    eval_count = usage.get("completion_tokens", 0)
                    prompt_eval_count = usage.get("prompt_tokens", 0)
                    tok_per_sec = round(eval_count / (latency_ms / 1000), 1) if latency_ms > 0 and eval_count > 0 else 0

                    return {
                        "content": content,
                        "model": model_name,
                        "role": "Compliance & Safety Auditor (vLLM)",
                        "device": "NVIDIA RTX 4060 8GB (CUDA Node)",
                        "latency_ms": latency_ms,
                        "eval_count": eval_count,
                        "prompt_eval_count": prompt_eval_count,
                        "tokens_per_sec": tok_per_sec,
                        "airgap_egress_kb": 0.0
                    }
        except Exception:
            pass

        # Attempt 2: Local Ollama on Mac M4 (Metal GPU Accelerated)
        try:
            available_tags = self.get_available_ollama_models()

            has_images = any(
                isinstance(m.get("content"), list) and any(p.get("type") == "image_url" for p in m.get("content"))
                for m in messages
            )

            target_ollama = None
            if has_images:
                # If caller specifically asked for an active vision model, use it
                if model_name and model_name in available_tags:
                    target_ollama = model_name
                else:
                    target_ollama = self.get_best_vision_model()

            if not target_ollama:
                # 1. Exact match with available tags
                if model_name in available_tags:
                    target_ollama = model_name
                elif any(k in model_name.lower() for k in ["r1", "deepseek", "auditor", "reasoning"]):
                    target_ollama = self.get_best_reasoning_model()
                elif any(k in model_name.lower() for k in ["vl", "vision", "qwen"]):
                    target_ollama = self.get_best_vision_model()
                elif any(k in model_name.lower() for k in ["llama", "supervisor", "orchestrator"]):
                    target_ollama = self.get_best_supervisor_model()
                elif model_name:
                    # Prefix matching (e.g. "llama3.1" -> "llama3.2:3b")
                    base_req = model_name.lower().split(":")[0]
                    matched = [t for t in available_tags if base_req in t.lower() or t.lower().startswith(base_req[:5])]
                    if matched:
                        target_ollama = matched[0]

            if not target_ollama:
                # 2. Check user messages specifically for deep compliance/audit keywords
                user_msgs = [m for m in messages if m.get("role") == "user"]
                user_text = " ".join([m.get("content", "") for m in user_msgs if isinstance(m.get("content"), str)]).lower()
                is_reasoning = any(k in user_text for k in org_config.audit_keywords + org_config.standards_keywords + ["root cause", "step-by-step reasoning"])
                if is_reasoning:
                    target_ollama = self.get_best_reasoning_model()

            if not target_ollama:
                target_ollama = self.get_best_supervisor_model()

            if target_ollama:
                # Format messages for Ollama (handles both text and multimodal Base64 images)
                ollama_messages = []
                for m in messages:
                    content = m.get("content")
                    if isinstance(content, list):
                        text_parts = []
                        images_b64 = []
                        for part in content:
                            if part.get("type") == "text":
                                text_parts.append(part.get("text", ""))
                            elif part.get("type") == "image_url":
                                url = part.get("image_url", {}).get("url", "")
                                if "base64," in url:
                                    images_b64.append(url.split("base64,")[1])
                        msg_obj = {"role": m.get("role", "user"), "content": "\n".join(text_parts)}
                        if images_b64:
                            msg_obj["images"] = images_b64
                        ollama_messages.append(msg_obj)
                    else:
                        ollama_messages.append(m)

                url = f"{settings.OLLAMA_API_BASE}/api/chat"
                payload = {
                    "model": target_ollama,
                    "messages": ollama_messages,
                    "stream": True,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens
                    }
                }
                res = requests.post(url, json=payload, stream=True, timeout=300.0)
                if task_id:
                    with self._lock:
                        self._active_sockets[task_id] = res

                if res.status_code == 200:
                    content_parts = []
                    thinking_parts = []
                    eval_count = 0
                    prompt_eval_count = 0
                    eval_duration_ns = 0

                    cancel_evt = None
                    if task_id:
                        with self._lock:
                            cancel_evt = self._cancel_flags.get(task_id)

                    try:
                        for line in res.iter_lines():
                            if cancel_evt and cancel_evt.is_set():
                                res.close()
                                raise RuntimeError("Generation halted by user.")
                            if not line:
                                continue
                            try:
                                chunk = json.loads(line.decode("utf-8"))
                                msg_obj = chunk.get("message", {})
                                th = msg_obj.get("thinking", "")
                                if th:
                                    thinking_parts.append(th)
                                c = msg_obj.get("content", "")
                                if c:
                                    content_parts.append(c)

                                if task_id and (c or th):
                                    cb = None
                                    with self._lock:
                                        cb = self._token_callbacks.get(task_id)
                                    if cb:
                                        try:
                                            cb(c, th)
                                        except Exception:
                                            pass

                                if chunk.get("done"):
                                    eval_count = chunk.get("eval_count", 0)
                                    prompt_eval_count = chunk.get("prompt_eval_count", 0)
                                    eval_duration_ns = chunk.get("eval_duration", 0)
                            except json.JSONDecodeError:
                                pass
                    finally:
                        if task_id:
                            with self._lock:
                                self._active_sockets.pop(task_id, None)

                    content = "".join(content_parts)
                    thinking = "".join(thinking_parts)
                    if thinking and not content:
                        content = f"<think>\n{thinking.strip()}\n</think>"
                    elif thinking and content:
                        content = f"<think>\n{thinking.strip()}\n</think>\n\n{content.strip()}"
                    elif not content:
                        content = ""

                    latency_ms = round((time.time() - start_time) * 1000)
                    tok_per_sec = round(eval_count / (eval_duration_ns / 1e9), 1) if eval_duration_ns > 0 else (
                        round(eval_count / (latency_ms / 1000), 1) if latency_ms > 0 and eval_count > 0 else 0
                    )

                    device_name = "Apple Silicon Metal GPU (Accelerated)" if "mac" in sys.platform.lower() or "darwin" in sys.platform.lower() else "Local Host GPU/CPU"
                    if has_images:
                        role_desc = f"Multimodal Vision Inspector ({target_ollama})"
                    elif "r1" in target_ollama.lower() or "deepseek" in target_ollama.lower():
                        role_desc = f"Statutory & Safety Auditor ({target_ollama})"
                    else:
                        role_desc = f"Supervisor & Process Engineering Engine ({target_ollama})"

                    return {
                        "content": content,
                        "model": target_ollama,
                        "role": role_desc,
                        "device": device_name,
                        "latency_ms": latency_ms,
                        "eval_count": eval_count,
                        "prompt_eval_count": prompt_eval_count,
                        "tokens_per_sec": tok_per_sec,
                        "airgap_egress_kb": 0.0
                    }
                else:
                    logger.warning(f"Ollama returned status {res.status_code}: {res.text}")
        except RuntimeError as e:
            if "halted by user" in str(e).lower():
                raise e
            logger.warning(f"Ollama inference error: {e}")
        except Exception as e:
            logger.warning(f"Ollama inference error: {e}")

        # Fallback ONLY if explicitly enabled
        if settings.ALLOW_FALLBACK_SIMULATION:
            simulated_text = self._generate_domain_simulation(model_name, messages)
            return {
                "content": simulated_text,
                "model": f"{model_name} (Simulated Fallback)",
                "role": "Offline Simulator",
                "device": "Offline CPU Fallback",
                "latency_ms": round((time.time() - start_time) * 1000),
                "eval_count": 0,
                "prompt_eval_count": 0,
                "tokens_per_sec": 0,
                "airgap_egress_kb": 0.0
            }

        raise RuntimeError(f"100% Real Model Enforcement: Unable to connect to live model weights for {model_name} on vLLM ({settings.VLLM_API_BASE}) or Ollama ({settings.OLLAMA_API_BASE}). Simulation fallback is disabled.")

    def query_llm(
        self,
        model_name: str,
        messages: List[Dict[str, Any]],
        temperature: float = 0.2,
        max_tokens: int = 1500,
        task_id: Optional[str] = None
    ) -> str:
        """Standard query returning the content string."""
        trace_res = self.query_llm_with_trace(model_name, messages, temperature, max_tokens, task_id=task_id)
        return trace_res["content"]

    def query_llm_multimodal(
        self,
        model_name: str,
        prompt: str,
        image_path: str,
        temperature: float = 0.1,
        max_tokens: int = 2000,
        task_id: Optional[str] = None
    ) -> str:
        """Standard multimodal query returning content string."""
        trace_res = self.query_llm_multimodal_with_trace(model_name, prompt, image_path, temperature, max_tokens, task_id=task_id)
        return trace_res["content"]

    def query_llm_multimodal_with_trace(
        self,
        model_name: str,
        prompt: str,
        image_path: str,
        temperature: float = 0.1,
        max_tokens: int = 2000,
        task_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Encodes an image to Base64 and executes a multimodal vision request via local vision model.
        Returns execution trace with model, device, and timings.
        """
        import base64
        from pathlib import Path

        img_file = Path(image_path)
        if not img_file.exists():
            return self.query_llm_with_trace(model_name, [{"role": "user", "content": prompt}], temperature, max_tokens, task_id=task_id)

        try:
            import io
            from PIL import Image

            # Smart Resolution Optimization:
            # High-resolution mobile/desktop screenshots (e.g. 1179x2556 or 2880x1800) create 4,000+ visual tokens,
            # bloating prompt-evaluation (prefill) time on Apple Silicon Metal GPU to 40+ seconds.
            # Scaling down max dimension to 1280px preserves sharp text readability while reducing
            # visual token count by ~75%, cutting vision latency from ~60s down to ~12-15s!
            with Image.open(img_file) as img:
                max_dim = 1280
                w, h = img.size
                if max(w, h) > max_dim:
                    ratio = max_dim / float(max(w, h))
                    new_size = (int(w * ratio), int(h * ratio))
                    img_resized = img.resize(new_size, Image.Resampling.LANCZOS)
                else:
                    img_resized = img.copy()

                if img_resized.mode in ("RGBA", "P"):
                    img_resized = img_resized.convert("RGB")

                buffer = io.BytesIO()
                img_resized.save(buffer, format="JPEG", quality=88, optimize=True)
                b64_data = base64.b64encode(buffer.getvalue()).decode("utf-8")
                mime = "image/jpeg"

            multimodal_messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime};base64,{b64_data}"}
                        }
                    ]
                }
            ]
            return self.query_llm_with_trace(model_name, multimodal_messages, temperature, max_tokens, task_id=task_id)
        except Exception as e:
            logger.error(f"Multimodal vision query error: {e}")
            raise

    def _generate_domain_simulation(self, model_name: str, messages: List[Dict[str, Any]]) -> str:
        """Domain-expert simulated responses for offline testing."""
        last_prompt = ""
        if messages:
            content = messages[-1].get("content", "")
            if isinstance(content, str):
                last_prompt = content.lower()
            elif isinstance(content, list):
                # Multimodal content list: [{"type": "text", "text": "..."}, ...]
                for block in content:
                    if isinstance(block, dict) and block.get("type") == "text":
                        last_prompt += block.get("text", "").lower() + " "

        if "supervisor" in model_name.lower() or "plan" in last_prompt:
            return json.dumps({
                "plan_id": f"{org_config.project_code}-PLAN-2026-081",
                "steps": [
                    "Inspect high-resolution document for structural components",
                    "Query sovereign vector database for applicable rules",
                    "Cross-reference components against organizational standards",
                    f"Compile formal {org_config.org_name} Approval Note (.docx) with executive sign-offs"
                ]
            }, indent=2)

        elif "vl" in model_name.lower() or "vision" in last_prompt or "blueprint" in last_prompt or "document" in last_prompt:
            return json.dumps({
                "document_identifier": "DOC-2026-04-102",
                "document_type": "Confidential Policy Draft",
                "detected_components": [
                    {"tag": "SEC-1", "type": "Header Signature block", "status": "Missing"},
                    {"tag": "CLAUSE-4", "type": "Confidentiality Clause", "status": "Present"}
                ],
                "anomalies_detected": [
                    "Missing authorizing signature in Section 1",
                    "Confidentiality clause contradicts recent policy update"
                ]
            }, indent=2)

        elif "r1" in model_name.lower() or "audit" in last_prompt:
            return (
                "<think>\n"
                "1. Analyzing extracted document components for DOC-2026-04-102.\n"
                "2. Document type is Confidential Policy Draft.\n"
                "3. Checking organizational policies regarding signature authorizations.\n"
                "4. Anomaly confirmed: Missing authorizing signature in Section 1.\n"
                "5. Failure mode: Unauthorized document circulation.\n"
                "6. Regulatory mandate: Standard Admin Policy 5.7 requires dual signatures on confidential drafts.\n"
                "</think>\n"
                "**COMPLIANCE AUDIT VERDICT: CATEGORY 1 ANOMALY DETECTED**\n\n"
                "- **Violation:** Admin Policy Section 3.1 & Clause 5.7\n"
                "- **Risk Level:** CRITICAL (Unauthorized Access / Policy Breach)\n"
                "- **Corrective Action Required:** Obtain Director level signature before internal circulation.\n"
                "- **Residual Integrity Score:** 62% (NON-COMPLIANT FOR RELEASE)"
            )

        return "Task processed successfully through sovereign local model engine."

model_registry = ModelRegistry()
