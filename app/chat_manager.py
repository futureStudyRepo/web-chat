from collections.abc import Iterable

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: list[tuple[WebSocket, str]] = []

    async def connect(self, websocket: WebSocket, nickname: str) -> None:
        await websocket.accept()
        self.active_connections.append((websocket, nickname))

    def disconnect(self, websocket: WebSocket) -> str | None:
        disconnected_name = None
        remaining: list[tuple[WebSocket, str]] = []

        for connection, nickname in self.active_connections:
            if connection is websocket:
                disconnected_name = nickname
                continue
            remaining.append((connection, nickname))

        self.active_connections = remaining
        return disconnected_name

    async def broadcast(self, payload: dict) -> None:
        for websocket, _ in self.active_connections:
            await websocket.send_json(payload)

    def user_list(self) -> Iterable[str]:
        return [nickname for _, nickname in self.active_connections]
