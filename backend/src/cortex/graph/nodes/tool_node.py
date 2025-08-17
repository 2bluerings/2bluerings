import json
import logging
from langchain_core.runnables import RunnableConfig
from langchain_core.messages import ToolMessage
from ...tools import all_tools
from ...tools import init_memory, tools_config

class ToolNode:
    """A node that runs the tools requested in the last AIMessage."""

    def __init__(self, tools: list) -> None:
        self.tools_by_name = {tool.name: tool for tool in tools}

    async def __call__(self, inputs: dict, config: RunnableConfig):
        if messages := inputs.get("messages", []):
            message = messages[-1]
        else:
            raise ValueError("No message found in input")
        outputs = []

        websocket = config["configurable"]["websocket"]

        for tool_call in message.tool_calls:
            try:
                await websocket.send_text(json.dumps({
                    "message": {
                        "role": "tool",
                        "content": tools_config[tool_call['name']]["display_message"],
                        "metadata": {
                            "thread_id": config["configurable"]["thread_id"]
                        }
                    }
                }))
                tool_result = await self.tools_by_name[tool_call["name"]].ainvoke(
                    tool_call["args"],
                    config=config
                )
                memory = init_memory(tool_name=tool_call["name"], config=config)
                if memory:
                    await memory.store(
                        tool_output=tool_result
                    )

                outputs += [
                    ToolMessage(
                        content=tool_result.dict(),
                        name=tool_call["name"],
                        tool_call_id=tool_call["id"],
                        status="success"
                    )
                ]
            except Exception as e: # pylint: disable=broad-except
                logging.error("Error: %s", e, exc_info=True)
                outputs += [
                    ToolMessage(
                        content={},
                        name=tool_call["name"],
                        tool_call_id=tool_call["id"],
                        status="error"
                    )
                ]
        return {
            "messages": outputs
        }

tool_node = ToolNode(tools=all_tools)
