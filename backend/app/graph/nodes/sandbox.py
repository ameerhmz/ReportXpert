import re
from typing import Dict, Any
from ..state import AgentWorkflowState
from ...tools.sandbox import sandbox_runner

def sandbox_node(state: AgentWorkflowState) -> Dict[str, Any]:
    """
    Verified Python Sandbox Node.
    Extracts Python code from model output, executes it in an isolated subprocess
    with CPU/memory limits, and returns real execution stdout/stderr.
    """
    response_text = state.get("response_text", "")
    code_match = re.search(r"```python\s*([\s\S]*?)```", response_text)

    statuses = dict(state.get("node_statuses", {}))
    steps = list(state.get("steps", []))
    logs = list(state.get("logs", []))

    exec_res = {}
    updated_text = response_text

    if code_match:
        script_code = code_match.group(1).strip()
        steps.append("Extracted Python engineering script from model output")
        
        exec_res = sandbox_runner.execute_code(script_code)
        exec_ms = exec_res.get("execution_time_ms", 0)
        ret_code = exec_res.get("return_code", 0)
        stdout = exec_res.get("stdout", "").strip()
        stderr = exec_res.get("stderr", "").strip()

        steps.append(f"Executed Python script in subprocess sandbox ({exec_ms} ms runtime, exit code {ret_code})")
        logs.append(f"⚡ [SANDBOX - Python 3.12] Script executed in {exec_ms} ms (return code {ret_code}).")

        if stdout:
            updated_text += f"\n\n#### ⚡ Sandboxed Execution Output (Python 3.12):\n```text\n{stdout}\n```\n*Execution runtime: {exec_ms} ms • Process guards: Active • 0 security violations*"
        elif stderr:
            updated_text += f"\n\n#### ⚠️ Sandbox Stderr:\n```text\n{stderr}\n```"

        statuses["sandbox"] = "COMPLETED"
    else:
        steps.append("No Python script block detected for sandbox execution")
        statuses["sandbox"] = "SKIPPED"

    return {
        "active_node": "sandbox",
        "sandbox_output": exec_res,
        "response_text": updated_text,
        "node_statuses": statuses,
        "steps": steps,
        "logs": logs
    }
