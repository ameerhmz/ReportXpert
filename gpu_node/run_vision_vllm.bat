@echo off
REM ==============================================================================
REM vLLM Launcher: Qwen2.5-VL-7B-Instruct-AWQ (Vision Specialist Node)
REM Hardware: NVIDIA GeForce RTX 4060 Laptop (8GB VRAM) / Windows
REM Models Folder: D:\model
REM ==============================================================================

set MODEL_PATH=D:\model\Qwen2.5-VL-7B-Instruct-AWQ
if not exist "%MODEL_PATH%" (
    set MODEL_PATH=D:\model
)

set PORT=8000
set MAX_MODEL_LEN=4096
set GPU_UTIL=0.88

echo ==================================================================
echo  Starting vLLM Vision Server: Qwen2.5-VL-7B-Instruct-AWQ
echo  Hardware: NVIDIA GeForce RTX 4060 (8GB VRAM)
echo  Port: %PORT% ^| Max Context: %MAX_MODEL_LEN% ^| GPU Util: %GPU_UTIL%
echo  Model Path: %MODEL_PATH%
echo ==================================================================

python -m vllm.entrypoints.openai.api_server ^
  --model "%MODEL_PATH%" ^
  --quantization awq ^
  --dtype float16 ^
  --port %PORT% ^
  --host 0.0.0.0 ^
  --max-model-len %MAX_MODEL_LEN% ^
  --gpu-memory-utilization %GPU_UTIL% ^
  --limit-mm-per-prompt image=2 ^
  --trust-remote-code
