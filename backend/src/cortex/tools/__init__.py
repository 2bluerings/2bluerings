from chonkie import RecursiveChunker, RecursiveRules
from langchain_core.runnables import RunnableConfig
from langchain_community.agent_toolkits.github.toolkit import GitHubToolkit
from langchain_community.utilities.github import GitHubAPIWrapper
from ..memory.memory import Memory

from .confluence.fetch_link import fetch_link as confluence_fetch_link
from .memory.search import search as memory_search
from .memory.ingest import ingest as memory_ingest
from .web.search import search as web_search
from .web.fetch_link import fetch_link as web_fetch_link
from .github.fetch_link import fetch_link as github_fetch_link

all_tools = [
    confluence_fetch_link,
    memory_search,
    memory_ingest,
    web_search,
    web_fetch_link,
    github_fetch_link
]

tools_config = {
    "confluence_fetch_link": {
        "memory": {
            "chunker": RecursiveChunker(
                tokenizer_or_token_counter="gpt2",
                chunk_size=512,
                rules=RecursiveRules(),
                min_characters_per_chunk=5
            ),
            "cleaner": None,
            "contextualized_chunking": True
        },
        "display_message": "Fetching and reading link (Confluence)..."
    },
    "memory_search": {
        "memory": None,
        "display_message": "Searching project data..."
    },
    "web_search": {
        "memory": None,
        "display_message": "Searching the web..."
    },
    "web_fetch_link": {
        "memory": {
            "chunker": RecursiveChunker(
                tokenizer_or_token_counter="gpt2",
                chunk_size=512,
                rules=RecursiveRules(),
                min_characters_per_chunk=5
            ),
            "cleaner": None,
            "contextualized_chunking": False
        },
        "display_message": "Fetching and reading link..."
    },
    "memory_ingest": {
        "memory": {
            "chunker": RecursiveChunker(
                tokenizer_or_token_counter="gpt2",
                chunk_size=512,
                rules=RecursiveRules(),
                min_characters_per_chunk=5
            ),
            "cleaner": None,
            "contextualized_chunking": True
        },
        "display_message": "Analyzing..."
    },
    "github_fetch_link": {
        "display_message": "Fetching and reading link (Github)...",
        "memory": {
            "chunker": RecursiveChunker(
                tokenizer_or_token_counter="gpt2",
                chunk_size=512,
                rules=RecursiveRules(),
                min_characters_per_chunk=5
            ),
            "cleaner": None,
            "contextualized_chunking": True
        }
    }
}

def init_memory(tool_name: str, config: RunnableConfig) -> Memory:
    memory = tools_config[tool_name]["memory"]

    if not memory:
        return None

    return Memory(
        config=config,
        chunker=memory["chunker"],
        cleaner=memory["cleaner"],
        contextualized_chunking=memory["contextualized_chunking"]
    )
