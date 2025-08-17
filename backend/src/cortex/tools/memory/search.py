from sqlalchemy import text
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from ...protocols import ToolOutput
from ...prompts import MEMORY_SEARCH_PROMPT
from ...embeddor import create_embedding

@tool(
    "memory_search",
    description=(
        MEMORY_SEARCH_PROMPT
    )
)
async def search(query: str, config: RunnableConfig) -> ToolOutput:
    project = config["configurable"]["project"]
    context_node_ids = config["configurable"]["context_node_ids"] or []
    db_session = config["configurable"]["db_session"]

    project_id = project.id
    query_embedding = await create_embedding(query)

    embedding_str = f"[{', '.join([str(x) for x in query_embedding])}]"

    sql = f"""
        SELECT ch.*, (ch.embedding_ctx <-> '{embedding_str}') AS score
        FROM chunks ch
        WHERE ch.project_id = :project_id
    """

    params = {"project_id": str(project_id), "top_k": 20}

    if context_node_ids:
        sql += """
            AND ch.vectorable_type = 'ContextNode'
            AND ch.vectorable_id::text = ANY(:context_node_ids)
        """
        params["context_node_ids"] = [str(i) for i in context_node_ids]

    sql += """
        ORDER BY score ASC, ch.created_at DESC
        LIMIT :top_k
    """

    stmt = text(sql)

    result = db_session.execute(stmt, params)
    chunks = result.mappings().all()

    formatted = {
        "results": [
            {
                "chunk_id": chunk["id"],
                "content": chunk["content_ctx"],
                "score": chunk["score"],
                "created_at": chunk["created_at"],
            }
            for chunk in chunks
        ]
    }

    return ToolOutput(
        name="memory_search",
        raw_output=formatted,
        summary=None
    )
