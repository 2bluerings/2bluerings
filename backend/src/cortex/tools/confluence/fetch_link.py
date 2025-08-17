from urllib.parse import urlparse
import requests
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from ....repositories.integration import (
    Integration as IntegrationRepository
)
from ...protocols import ToolOutput, ContextNodeOutput

@tool(
    "confluence_fetch_link",
    description=(
        """
        Use this tool ONLY when the user provides a valid Confluence page link.
        Do NOT use for any non-confluence urls.
        """
    )
)
def fetch_link(url: str, config: RunnableConfig) -> ToolOutput:
    configurable = config["configurable"]

    db_session = configurable["db_session"]
    project = configurable["project"]
    current_user = configurable["current_user"]
    project_id = project.id

    repo = IntegrationRepository(db_session)
    config = repo.find_config(name="atlassian", user_id=current_user.id)

    api_token = config.get("api_token")
    username = config.get("username")
    domain = config.get("domain")

    if not api_token or not username or not domain:
        raise ValueError("Integration(atlassian) not setup.")

    timeout = 5
    api_url = f"https://{domain}/wiki/rest/api/content/{page_id(url)}?expand=body.storage"

    resp = requests.get(
        api_url,
        headers={
            "Accept": "application/json"
        },
        timeout=timeout,
        auth=(username, api_token)
    )

    json = resp.json()
    title = json.get("title")
    content = json.get("body").get("storage").get("value")

    return ToolOutput(
        name=title,
        raw_output={
            "title": title,
            "content": content
        },
        context_node=ContextNodeOutput(
            name=title,
            link=url,
            type="link",
            source="confluence",
            project_id=project_id
        )
    )

def page_id(url) -> str | None:
    """
    Extract the page ID given a Confluence URL.
    """
    try:
        parts = urlparse(url).path.split("/")
        return parts[parts.index("pages") + 1]
    except (ValueError, IndexError):
        return None
