#!/usr/bin/env bash
# ==============================================================================
# vLLM Launcher: DeepSeek-R1-Distill-Llama-8B-AWQ (Reasoning Auditor Node)
# Target Hardware: NVIDIA GeForce RTX 4060 Mobile (8GB VRAM) / Linux / Windows WSL
# ==============================================================================

set -e

# Default Model Paths (Checks D:/model for RTX 4060 laptop, then Samsung 980)
if [ -z "$MODEL_PATH" ]; then
  if [ -d "D:/model/DeepSeek-R1-Distill-Llama-8B-AWQ" ]; then
    MODEL_PATH="D:/model/DeepSeek-R1-Distill-Llama-8B-AWQ"
  elif [ -d "/mnt/d/model/DeepSeek-R1-Distill-Llama-8B-AWQ" ]; then
    MODEL_PATH="/mnt/d/model/DeepSeek-R1-Distill-Llama-8B-AWQ"
  elif [ -d "/Volumes/980/USER/SIH_Agentic_Workbench/models/DeepSeek-R1-Distill-Llama-8B-AWQ" ]; then
    MODEL_PATH="/Volumes/980/USER/SIH_Agentic_Workbench/models/DeepSeek-R1-Distill-Llama-8B-AWQ"
  else
    MODEL_PATH="D:/model"
  fi
fi

PORT="${PORT:-8000}"
MAX_MODEL_LEN="${MAX_MODEL_LEN:-4096}"
GPU_UTIL="${GPU_UTIL:-0.90}"

echo "=================================================================="
echo " Starting vLLM Auditor Server: DeepSeek-R1-Distill-Llama-8B-AWQ"
echo " Port: $PORT | Max Context: $MAX_MODEL_LEN | GPU Util: $GPU_UTIL"
echo " Model: $MODEL_PATH"
echo "=================================================================="

vllm serve "$MODEL_PATH" \
  --quantization awq \
  --dtype float16 \
  --port "$PORT" \
  --host 0.0.0.0 \
  --max-model-len "$MAX_MODEL_LEN" \
  --gpu-memory-utilization "$GPU_UTIL" \
  --trust-remote-code
