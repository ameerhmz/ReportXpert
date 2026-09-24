@echo off
REM ==============================================================================
REM Ollama D-Drive Model Configuration
REM Points Ollama to store and load all models directly from D:\model
REM ==============================================================================

echo Setting OLLAMA_MODELS environment variable to D:\model...
setx OLLAMA_MODELS "D:\model"
set OLLAMA_MODELS=D:\model

echo.
echo ==================================================================
echo  OLLAMA_MODELS is now configured to D:\model
echo  Any models downloaded or imported will live on your D: drive.
echo ==================================================================
echo.
echo Restarting Ollama if running...
taskkill /IM "ollama.exe" /F 2>nul
taskkill /IM "ollama app.exe" /F 2>nul
timeout /t 2 /nobreak >nul

echo Starting Ollama with D:\model...
start "" ollama serve
echo Ollama server is running at http://127.0.0.1:11434 with models in D:\model!
pause
