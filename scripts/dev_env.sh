#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

export PYTHONPATH="${ROOT_DIR}/apps/api:${ROOT_DIR}/packages/common/src:${ROOT_DIR}/packages/ml/src:${ROOT_DIR}/packages/quality/src:${ROOT_DIR}/packages/lineage/src:${ROOT_DIR}/packages/lakehouse/src${PYTHONPATH:+:${PYTHONPATH}}"

PYTHON_BIN="${PYTHON:-python3}"
PYTHON_VERSION="$(${PYTHON_BIN} -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")' 2>/dev/null || true)"

if [[ -z "${PYTHON_VERSION}" ]]; then
  echo "Warning: could not determine Python version using ${PYTHON_BIN}." >&2
else
  echo "Python version: ${PYTHON_VERSION}"
  MAJOR="${PYTHON_VERSION%%.*}"
  REST="${PYTHON_VERSION#*.}"
  MINOR="${REST%%.*}"
  if (( MAJOR < 3 || (MAJOR == 3 && MINOR < 10) )); then
    echo "Warning: Python ${PYTHON_VERSION} detected. Python 3.10+ is recommended for development." >&2
  fi
fi

echo "PYTHONPATH set to: ${PYTHONPATH}"
