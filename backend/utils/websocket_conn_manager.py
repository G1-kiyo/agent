from fastapi import WebSocket, FastAPI


class WebSocketConnManager:
    def __init__(self):
        self.user_connection_map = {}

    def connect(self, user_id: int, ws: WebSocket):
        self.user_connection_map[user_id] = ws

    def disconnect(self, user_id: int):
        target_ws = self.user_connection_map.get(user_id, None)
        if target_ws:
            del self.user_connection_map[user_id]

    def send_to_user(self, user_id_list: list[int], content: str):
        for user_id, ws in self.user_connection_map.items():
            if user_id in user_id_list:
                ws.send_text(content)

    def broadcast(self, content):
        for ws in self.user_connection_map.values():
            ws.send_text(content)


def init_websocket_conn_manager(app: FastAPI):
    app.state.websocket_conn_manager = WebSocketConnManager()
