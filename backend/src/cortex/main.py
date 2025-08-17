import asyncio
from langchain_core.messages import AIMessage
from .graph.builder import builder

graph = builder.compile()

async def stream_graph_updates(user_input: str):
    async for event in graph.astream({
        "messages": [{"role": "user", "content": user_input}],
        "user_session": {
            "user_id": "uuid-12345"
        }
    }):
        for value in event.values():
            message = value["messages"][-1]
            if isinstance(message, AIMessage):
                print("Assistant:", value["messages"][-1].content)

if __name__ == "__main__":
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            break
        asyncio.run(stream_graph_updates(user_input))
