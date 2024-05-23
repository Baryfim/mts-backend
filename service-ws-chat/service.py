import asyncio
from fastapi import FastAPI, Body, HTTPException
import json
import ollama

app = FastAPI()

@app.post("/api/chat")
async def chat_api(message: str = Body(..., embed=True)):
    try:
        print("Start generating response")
        response = ollama.chat(
            model='llama3', messages=[{'role': 'user', 'content': message + " (на русском до 300 слов)"}]
        )
        return {"status": 200, "response": response['message']['content']}
    except Exception as e:
        print(f"Error generating response: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during generation")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=9999)
