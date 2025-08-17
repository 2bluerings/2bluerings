from langchain_tavily import TavilySearch
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from ...protocols import ToolOutput
from ....repositories.integration import Integration as IntegrationRepository

@tool(
    "web_search",
    description=(
        """
        Use this tool to search the web for information when the user asks questions about\n
        general knowledge, library usage, recent events, or anything not covered by internal\n
        project documents.
        """
    )
)
async def search(query: str, config: RunnableConfig) -> ToolOutput:
    configurable = config["configurable"]

    db_session = configurable["db_session"]
    current_user = configurable["current_user"]

    repo = IntegrationRepository(db_session)
    config = repo.find_config(name="tavily", user_id=current_user.id)

    api_token = config.get("api_token")
    if not api_token:
        raise ValueError("Integration(tavily) not setup.")

    results = await TavilySearch(
        max_results=5, tavily_api_key=api_token
    ).ainvoke(query)

    return ToolOutput(
        name="web_search",
        raw_output=results,
        summary=None
    )
