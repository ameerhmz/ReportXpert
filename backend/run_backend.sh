#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=================================================================="
echo " Starting ReportXpert Sovereign On-Premise University Administration AI"
echo " Air-Gapped University Gateway (Zero-Cloud-Egress Mode)"
echo "=================================================================="

# Run Uvicorn server on localhost:8000
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
