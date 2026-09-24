import os
from pathlib import Path
from pydantic import BaseModel

def get_default_model_dir() -> str:
    """
    Auto-detects model path:
    1. Explicit MODEL_BASE_PATH environment variable
    2. Windows RTX 4060 Laptop: D:\\model or D:/model
    3. WSL mapping: /mnt/d/model
    4. macOS External SSD: /Volumes/980/USER/SIH_Agentic_Workbench/models
    """
    env_dir = os.getenv("MODEL_BASE_PATH")
    if env_dir:
        return env_dir

    # Windows RTX 4060 Laptop direct paths
    for candidate in ["D:/model", "D:\\model", "D:/models", "D:\\models", "C:/model"]:
        try:
            if Path(candidate).exists():
                return candidate
        except Exception:
            pass

    # WSL path mapping for Windows D: drive
    if Path("/mnt/d/model").exists():
        return "/mnt/d/model"

    # macOS External SSD check
    if Path("/Volumes/980/USER/SIH_Agentic_Workbench/models").exists():
        return "/Volumes/980/USER/SIH_Agentic_Workbench/models"

    # Default based on OS
    return "D:/model" if os.name == "nt" else "/Volumes/980/USER/SIH_Agentic_Workbench/models"

class Settings(BaseModel):
    PROJECT_NAME: str = "ReportXpert AI Workbench"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Base workspace paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    BLUEPRINTS_DIR: Path = DATA_DIR / "blueprints"
    SOPS_DIR: Path = DATA_DIR / "sops"
    DELIVERABLES_DIR: Path = DATA_DIR / "deliverables"

    # Default model path
    SSD_MODEL_DIR: str = get_default_model_dir()
    MODEL_BASE_PATH: str = SSD_MODEL_DIR

    # vLLM GPU Server Endpoint (RTX 4060 PC on local LAN - port 8001 or 8000)
    VLLM_API_BASE: str = os.getenv("VLLM_API_BASE", "http://127.0.0.1:8001/v1")
    VLLM_API_KEY: str = os.getenv("VLLM_API_KEY", "EMPTY")

    # Local Ollama / llama.cpp Endpoint (Port 11434)
    OLLAMA_API_BASE: str = os.getenv("OLLAMA_API_BASE", "http://127.0.0.1:11434")

    # Model IDs / Folder names inside D:\model
    VISION_MODEL: str = os.getenv("VISION_MODEL", "Qwen2.5-VL-7B-Instruct-AWQ")
    AUDITOR_MODEL: str = os.getenv("AUDITOR_MODEL", "DeepSeek-R1-Distill-Llama-8B-AWQ")
    SUPERVISOR_MODEL: str = os.getenv("SUPERVISOR_MODEL", "Meta-Llama-3.1-8B-Instruct-AWQ-INT4")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "bge-m3")

    # Mock mode toggle: Strictly FALSE to ensure 100% real model inference only
    ALLOW_FALLBACK_SIMULATION: bool = False

settings = Settings()

# Ensure directories exist
settings.DELIVERABLES_DIR.mkdir(parents=True, exist_ok=True)
settings.BLUEPRINTS_DIR.mkdir(parents=True, exist_ok=True)
settings.SOPS_DIR.mkdir(parents=True, exist_ok=True)

