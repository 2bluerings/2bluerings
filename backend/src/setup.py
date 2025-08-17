import asyncio
import os
from langgraph.checkpoint.postgres import PostgresSaver
from src.cortex.graphiti import init as init_graphiti

if __name__ == "__main__":
    asyncio.run(init_graphiti())

with PostgresSaver.from_conn_string(
    conn_string=os.getenv("DATABASE_URL_CHECKPOINTER")
) as checkpointer:
    checkpointer.setup()
