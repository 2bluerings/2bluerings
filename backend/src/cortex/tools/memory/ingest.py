from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from ...protocols import ToolOutput, ContextNodeOutput
from ...prompts import MEMORY_INGEST_PROMPT

@tool(
    "memory_ingest",
    description=MEMORY_INGEST_PROMPT
)
async def ingest(
    title: str,
    content: str,
    summary: str,
    config: RunnableConfig
) -> ToolOutput:
    project = config["configurable"]["project"]

    return ToolOutput(
        name=title,
        raw_output={
            "title": title,
            "summary": summary,
            "content": content
        },
        context_node=ContextNodeOutput(
            name=title,
            summary=summary,
            type="auto",
            source="system",
            project_id=project.id
        )
    )
