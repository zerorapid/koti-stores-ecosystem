# 🧠 Local AI Guide (Zero Quota Mode)

Follow these steps to enable local AI in your VS Code environment for the Koti project.

## 1. Install Ollama
1. Download **Ollama** from [ollama.com](https://ollama.com).
2. Install and launch it. You will see a small sheep icon in your Mac menu bar.

## 2. Pull your AI Brain
Open your terminal and run:
```bash
ollama run llama3:8b
```
*(This will download a powerful local model. It may take a few minutes depending on your internet speed.)*

## 3. Setup VS Code Extension
1. Open VS Code.
2. Go to **Extensions** (Cmd+Shift+X) and search for **"Continue"**.
3. Install the **Continue** extension (by continue.dev).

## 4. Connect Continue to Ollama
1. Open the Continue sidebar in VS Code.
2. Click the **Gear icon (Settings)** at the bottom of the sidebar.
3. Replace the `models` section in the config file with this:
```json
{
  "models": [
    {
      "title": "Ollama Llama3",
      "provider": "ollama",
      "model": "llama3:8b"
    }
  ]
}
```
4. Save the file.

## 🚀 How to use it:
- **Cmd+L**: Ask the AI about your code (similar to Antigravity).
- **Cmd+I**: Edit code in place.
- **Cost**: ₹0.00 (Offline and Private).

**You are now a Local AI Powered Developer!** 🛰️🚀🏁
