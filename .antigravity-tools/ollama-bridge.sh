#!/bin/bash
# Ollama Hybrid Bridge - Agentic Tool (External)
# Purpose: Pipes tasks to local Ollama to save cloud quota.

if ! command -v ollama &> /dev/null; then
    echo "❌ OLLAMA NOT INSTALLED. Please visit ollama.com"
    exit 1
fi

PROMPT=$1
MODEL=${2:-llama3}

if [ -z "$PROMPT" ]; then
    echo "Usage: ./ollama-bridge.sh \"your prompt here\" [model_name]"
    exit 1
fi

echo "🛰️ OFFLOADING TO LOCAL AI ($MODEL)..."
ollama run $MODEL "$PROMPT"
