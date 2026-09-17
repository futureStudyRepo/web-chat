from pathlib import Path

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .chat_manager import ConnectionManager

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="Web Chat Demo")
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

manager = ConnectionManager()


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        request,
        "index.clean.html",
        {
            "request": request,
        },
    )


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    nickname = websocket.query_params.get("nickname", "").strip() or "guest"
    await manager.connect(websocket, nickname)

    await manager.broadcast(
        {
            "type": "system",
            "message": f"{nickname} 님이 입장했습니다.",
            "users": list(manager.user_list()),
        }
    )

    try:
        while True:
            text = await websocket.receive_text()
            await manager.broadcast(
                {
                    "type": "chat",
                    "nickname": nickname,
                    "message": text,
                    "users": list(manager.user_list()),
                }
            )
    except WebSocketDisconnect:
        disconnected_name = manager.disconnect(websocket)
        if disconnected_name:
            await manager.broadcast(
                {
                    "type": "system",
                    "message": f"{disconnected_name} 님이 퇴장했습니다.",
                    "users": list(manager.user_list()),
                }
            )
