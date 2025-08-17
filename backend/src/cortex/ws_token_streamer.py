import json
from uuid import UUID
from langchain.callbacks.base import AsyncCallbackHandler

class WsTokenStreamer(AsyncCallbackHandler):
    def __init__(
        self,
        websocket,
        thread_id: UUID
    ):
        self.websocket = websocket
        self.thread_id = thread_id

    async def on_llm_new_token(self, token: str, **kwargs):
        tags = kwargs.get("tags") or []
        if "internal" in tags:
            return

        await self.websocket.send_text(json.dumps({
            "message": {
                "role": "token",
                "content": token,
                "metadata": {
                    "thread_id": str(self.thread_id)
                }
            }
        }))
