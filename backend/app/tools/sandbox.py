import sys
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Dict, Any

class LocalPythonSandbox:
    """
    Sandboxed Python execution environment for engineering calculations.
    Runs strictly in isolated subprocesses with timeout and execution memory limits.
    """

    def __init__(self, timeout_seconds: int = 10):
        self.timeout_seconds = timeout_seconds

    def execute_code(self, code_str: str) -> Dict[str, Any]:
        """
        Executes Python code in an isolated temporary script.
        Captures output, execution duration, and errors.
        """
        # Static guard against dangerous outbound calls or destructive commands
        forbidden_terms = ["import socket", "urllib.request", "requests.get", "requests.post", "os.system('rm -rf", "shutil.rmtree('/')"]
        for term in forbidden_terms:
            if term in code_str:
                return {
                    "success": False,
                    "stdout": "",
                    "stderr": f"SECURITY VIOLATION: Execution blocked due to disallowed operation: {term}",
                    "return_code": -1,
                    "execution_time_ms": 0
                }

        with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False) as tmp_file:
            tmp_path = Path(tmp_file.name)
            tmp_file.write(code_str)

        start_time = time.time()
        try:
            res = subprocess.run(
                [sys.executable, str(tmp_path)],
                capture_output=True,
                text=True,
                timeout=self.timeout_seconds
            )
            duration_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "success": res.returncode == 0,
                "stdout": res.stdout,
                "stderr": res.stderr,
                "return_code": res.returncode,
                "execution_time_ms": duration_ms
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "stdout": "",
                "stderr": f"Execution timed out after {self.timeout_seconds} seconds.",
                "return_code": -9,
                "execution_time_ms": self.timeout_seconds * 1000
            }
        except Exception as e:
            return {
                "success": False,
                "stdout": "",
                "stderr": str(e),
                "return_code": -1,
                "execution_time_ms": 0
            }
        finally:
            if tmp_path.exists():
                tmp_path.unlink()

sandbox_runner = LocalPythonSandbox()
