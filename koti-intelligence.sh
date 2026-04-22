#!/bin/bash

# Koti Intelligence: Local AI Business Analyst
echo "🧠 Waking up Koti Intelligence (Powered by Ollama)..."

# 1. Fetch sales summary (Simulated for this demo - in production, this pulls from Firestore)
SALES_DATA="Mangoes: 45 sold, 2 remaining. Oranges: 10 sold, 50 remaining. Delivery speed: 24 mins avg."

echo "📊 Analyzing live ecosystem data..."

# 2. Pipe data to local Llama3
OLLAMA_RESPONSE=$(curl -s http://localhost:11434/api/generate -d "{
  \"model\": \"llama3\",
  \"prompt\": \"As a Koti Stores business analyst, look at this data: $SALES_DATA. Give me 3 bullet points of smart business advice in 20 words or less.\",
  \"stream\": false
}" | jq -r '.response')

echo "------------------------------------------------"
echo "🤖 KOTI AI ADVICE:"
echo "$OLLAMA_RESPONSE"
echo "------------------------------------------------"
echo "✅ Analysis complete. Zero tokens consumed."
