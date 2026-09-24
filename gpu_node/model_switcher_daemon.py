import os
import sys
import signal
import subprocess
import time
import requests
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request, Response
import uvicorn

app = FastAPI(title="GPU Node Model Switcher Daemon (ReportXpert)")

CURRENT_PROCESS = None
CURRENT_MODEL = None

IS_WINDOWS = sys.platform == "win32"

MODEL_MAP = {
    "vision": {
        "name": "Qwen2.5-VL-7B-Instruct-AWQ",
        "script": "run_vision_vllm.bat" if IS_WINDOWS else "run_vision_vllm.sh"
    },
    "auditor": {
        "name": "DeepSeek-R1-Distill-Llama-8B-AWQ",
        "script": "run_auditor_vllm.bat" if IS_WINDOWS else "run_auditor_vllm.sh"
    }
}

SCRIPT_DIR = Path(__file__).resolve().parent

@app.get("/status")
def get_status():
    is_running = CURRENT_PROCESS is not None and CURRENT_PROCESS.poll() is None
    vllm_online = False
    try:
        r = requests.get("http://127.0.0.1:8000/v1/models", timeout=1.0)
        vllm_online = r.status_code == 200
    except Exception:
        vllm_online = False

    return {
        "current_model": CURRENT_MODEL,
        "is_process_running": is_running,
        "vllm_endpoint_ready": vllm_online,
        "gpu_target": "NVIDIA GeForce RTX 4060 (8GB VRAM)",
        "platform": sys.platform
    }

@app.post("/switch")
def switch_model(target: str):
    """
    Kills currently running model in VRAM and hot-loads target model.
    target: 'vision' or 'auditor'
    """
    global CURRENT_PROCESS, CURRENT_MODEL
    target = target.lower().strip()
    if target not in MODEL_MAP:
        raise HTTPException(status_code=400, detail=f"Unknown target model. Choose from: {list(MODEL_MAP.keys())}")

    if CURRENT_MODEL == target and CURRENT_PROCESS and CURRENT_PROCESS.poll() is None:
        return {"status": "ALREADY_ACTIVE", "model": target}

    # 1. Terminate running process if any
    if CURRENT_PROCESS and CURRENT_PROCESS.poll() is None:
        print(f"Stopping current model {CURRENT_MODEL}...")
        try:
            if IS_WINDOWS:
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(CURRENT_PROCESS.pid)], capture_output=True)
            else:
                os.killpg(os.getpgid(CURRENT_PROCESS.pid), signal.SIGTERM)
        except Exception as e:
            print(f"Error stopping process: {e}")
        time.sleep(1.5)

    # 2. Launch new vLLM server
    script_path = SCRIPT_DIR / MODEL_MAP[target]["script"]
    if not script_path.exists():
        raise HTTPException(status_code=500, detail=f"Launcher script not found: {script_path}")

    print(f"Launching {target} ({MODEL_MAP[target]['name']})...")
    
    # Log file for vLLM output to avoid Windows PIPE deadlock
    log_file = open(SCRIPT_DIR / "vllm_node.log", "w", encoding="utf-8")
    
    popen_kwargs = {
        "cwd": str(SCRIPT_DIR),
        "stdout": log_file,
        "stderr": subprocess.STDOUT
    }
    
    if IS_WINDOWS:
        cmd = ["cmd.exe", "/c", str(script_path)]
        popen_kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        cmd = ["bash", str(script_path)]
        popen_kwargs["preexec_fn"] = os.setsid

    CURRENT_PROCESS = subprocess.Popen(cmd, **popen_kwargs)
    CURRENT_MODEL = target

    # 3. Poll for readiness (up to 20 seconds)
    start_time = time.time()
    vllm_ready = False
    while time.time() - start_time < 20:
        try:
            r = requests.get("http://127.0.0.1:8000/v1/models", timeout=1.0)
            if r.status_code == 200:
                vllm_ready = True
                break
        except Exception:
            pass
        time.sleep(1.0)

    return {
        "status": "LOADED" if vllm_ready else "STARTING_IN_BACKGROUND",
        "model": target,
        "model_name": MODEL_MAP[target]["name"],
        "elapsed_seconds": round(time.time() - start_time, 2),
        "vllm_ready": vllm_ready
    }

# Transparent reverse proxy to internal vLLM on port 8000
@app.api_route("/v1/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_v1(request: Request, path: str):
    target_url = f"http://127.0.0.1:8000/v1/{path}"
    headers = {key: value for key, value in request.headers.items() if key.lower() not in ("host", "content-length")}
    body = await request.body()
    try:
        resp = requests.request(
            method=request.method,
            url=target_url,
            headers=headers,
            data=body,
            params=dict(request.query_params),
            timeout=120.0
        )
        return Response(content=resp.content, status_code=resp.status_code, headers=dict(resp.headers))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to reach internal vLLM on port 8000: {exc}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
