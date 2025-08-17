from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableConfig
from chonkie import RecursiveChunker, RecursiveRules
from ..protocols import ToolOutput, Chunker, Cleaner
from ...models.context_node import ContextNode as ContextNodeModel, ContextNodeStatus
from ...models.chunk import Chunk as ChunkModel
from ...schemas.context_node import ContextNodeRead
from ...repositories.context_node import ContextNode as ContextNodeRepository
from ...repositories.chunk import Chunk as ChunkRepository
from ...services.websockets.connection_manager import connection_manager
from ..embeddor import create_embedding
from ..prompts import CONTEXTUAL_RETRIEVAL_PROMPT

class Memory:
    def __init__(
        self,
        config: RunnableConfig,
        chunker: Chunker = RecursiveChunker(
            "gpt2",
            256,
            RecursiveRules(),
            24,
        ),
        cleaner: Cleaner = None,
        contextualized_chunking: bool = True
    ):
        self.chunker = chunker
        self.cleaner = cleaner
        self.config = config
        self.contextualized_chunking = contextualized_chunking

        self.configurable = self.config["configurable"]
        self.llm = self.configurable["llm"]
        self.db_session = self.configurable["db_session"]

    async def store(self, tool_output: ToolOutput) -> list[str]:
        if tool_output.context_node:
            node = ContextNodeModel(**tool_output.context_node.model_dump())
            node.status = ContextNodeStatus.INDEXING
            repo = ContextNodeRepository(self.db_session)
            repo.create(node)
            await self.broadcast(node)

        content = tool_output.raw_output["content"]

        if self.cleaner:
            content = self.cleaner(content)

        chunks = [chunk.text for chunk in self.chunker(content)]
        episode_uuids = []

        for _i, chunk in enumerate(chunks):
            if self.contextualized_chunking:
                ctx_chunk = await self.contextualized_chunk(
                    content=content,
                    chunk=chunk
                )
            else:
                ctx_chunk = chunk

            ChunkRepository(self.db_session).create(
                ChunkModel(
                    embedding_ctx=await create_embedding(content=ctx_chunk),
                    vectorable_id=node.id,
                    vectorable_type="ContextNode",
                    content=chunk,
                    project_id=node.project_id,
                    content_ctx=ctx_chunk
                )
            )

        if node:
            node.status = ContextNodeStatus.COMPLETED
            node.episode_uuids = episode_uuids
            repo.update(node)
            await self.broadcast(node)

        return tool_output

    async def broadcast(self, context_node: ContextNodeModel):
        await connection_manager.send_to_project(
            namespace="context_nodes",
            project_id=context_node.project_id,
            message=ContextNodeRead(**context_node.model_dump()).model_dump(mode="json")
        )

    async def contextualized_chunk(self, content: str, chunk: str) -> str:
        response = await self.llm.ainvoke(
            [
                HumanMessage(
                    content=CONTEXTUAL_RETRIEVAL_PROMPT.format(
                        content=content,
                        chunk=chunk
                    )
                )
            ],
            config={
                "tags": ["internal"]
            },
            max_tokens=255
        )
        return f"<context>\n{response.content.strip()}\n</context>\n<chunk>\n{chunk}\n</chunk>\n"
