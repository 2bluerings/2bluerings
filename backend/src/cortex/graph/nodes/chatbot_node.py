from datetime import datetime, timezone
from langchain_core.runnables import RunnableConfig
from langchain_core.messages import (
    SystemMessage,
    ToolMessage,
    HumanMessage
)
from ..state import State
from ...prompts import SYSTEM_PROMPT
from ...prompts import TOOL_OUTPUT_INTERPRETATION_PROMPT

async def chatbot_node(state: State, config: RunnableConfig):
    messages = state["messages"]
    llm = config["configurable"]["llm"]
    project = config["configurable"]["project"]

    config = {}

    system_prompt = []
    if not any(isinstance(msg, SystemMessage) for msg in messages):
        system_prompt = [
            SystemMessage(
                content=SYSTEM_PROMPT.format(
                    current_timestamp=datetime.now(timezone.utc).isoformat(),
                    current_project_id=project.id,
                    current_project_name=project.name
                )
            )
        ]

    tool_interpretation_prompt = []
    if isinstance(messages[-1], ToolMessage):
        tool_interpretation_prompt = [HumanMessage(content=TOOL_OUTPUT_INTERPRETATION_PROMPT)]

    response = await llm.ainvoke(
        system_prompt + messages + tool_interpretation_prompt,
        config=config
    )

    return {
        "messages": messages + [response]
    }
