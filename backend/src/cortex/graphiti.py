import os
import asyncio
import logging
from graphiti_core import Graphiti
from graphiti_core.embedder.gemini import GeminiEmbedder, GeminiEmbedderConfig
from graphiti_core.embedder.openai import OpenAIEmbedder, OpenAIEmbedderConfig
from graphiti_core.llm_client.gemini_client import GeminiClient
from graphiti_core.llm_client.openai_client import OpenAIClient
from graphiti_core.llm_client.config import LLMConfig
from graphiti_core.cross_encoder.gemini_reranker_client import GeminiRerankerClient
from graphiti_core.driver.neo4j_driver import Neo4jDriver
from graphiti_core.llm_client.groq_client import GroqClient
from graphiti_core.cross_encoder.openai_reranker_client import OpenAIRerankerClient

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
logger = logging.getLogger(__name__)


# Gemini LLM configuration
llm_config = LLMConfig(
    api_key=os.environ["GEMINI_API_KEY"],
    model="gemini-2.5-flash",
    small_model=False
)
llm_client = GeminiClient(config=llm_config)
embedder = GeminiEmbedder(
    config=GeminiEmbedderConfig(
        embedding_model="gemini-embedding-001",
        api_key=os.environ["GEMINI_API_KEY"]
    )
)
cross_encoder = GeminiRerankerClient(
    client=llm_client, config=llm_config
)

# DeepSeek with Groq
llm_config = LLMConfig(
    api_key=os.environ["GROQ_API_KEY"],
    model="deepseek-r1-distill-llama-70b",
)
llm_client = GroqClient(config=llm_config)
embedder = OpenAIEmbedder(
    config=OpenAIEmbedderConfig(
        embedding_model="nomic-embed-text",
        embedding_dim=768,
        base_url="http://localhost:11434/api",
    )
)
cross_encoder = OpenAIRerankerClient(
    client=llm_client, config=llm_config
)

# OpenAI LLM configuration
llm_config = LLMConfig(
    api_key=os.environ["OPENAI_API_KEY"],
    small_model="gpt-4.1-nano",
    model="gpt-4.1-mini"
)
llm_client = OpenAIClient(config=llm_config)
cross_encoder = OpenAIRerankerClient(
    client=llm_client, config=llm_config
)

graph_driver = Neo4jDriver(
    uri=os.environ["NEO4J_URI"],
    user=os.environ["NEO4J_USER"],
    password=os.environ["NEO4J_PASSWORD"]
)

graphiti = Graphiti(
    graph_driver=graph_driver,
    llm_client=llm_client,
    cross_encoder=cross_encoder,
    # embedder=embedder
)

async def init():
    try:
        await graphiti.build_indices_and_constraints()
    finally:
        await graphiti.close()
        print('\nConnection closed')

if __name__ == "__main__":
    asyncio.run(init())
