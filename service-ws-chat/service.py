import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import ollama

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            response = await get_response(data)
            await websocket.send_json({"status": 204, "response": response})
    except WebSocketDisconnect:
        print("Client disconnected")

async def get_response(message: str):
    print("start generate")
    response = ollama.chat(model='llama3', messages=[{'role': 'user', 'content': message}])
    return response['message']['content']

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=9999)