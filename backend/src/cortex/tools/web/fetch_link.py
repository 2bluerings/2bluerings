import re
import asyncio
import base64
import json
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from ...protocols import ToolOutput, ContextNodeOutput
from ...aiohttp import HttpSession
from ...cleaners.xml_cleaner import XmlCleaner

_MAX_BYTES = 5 * 1024 * 1024

@tool(
    "web_fetch_link",
    description=(
        "Fetch a public URL **only when the user explicitly asks to read a link**."
        # pylint: disable=line-too-long
        "Handles HTML/text/JSON and small binaries. Returns {content, content_type, status, final_url, size_bytes}."
    )
)
async def fetch_link(url: str, config: RunnableConfig) -> ToolOutput:
    if not url.startswith("https://"):
        return ToolOutput(
            name="web_fetch_link",
            raw_output={"error": "Only https URLs are allowed.", "url": url},
            summary="Fetch failed: invalid scheme",
        )

    project = config["configurable"]["project"]
    project_id = project.id

    try:
        content, title, _meta = await _afetch(url)
        content = XmlCleaner()(content)
        return ToolOutput(
            name="web_fetch_link",
            raw_output={
                "title": title,
                "content": content
            },
            context_node=ContextNodeOutput(
                name=title,
                link=url,
                type="link",
                source="web",
                project_id=project_id
            ),
            summary=None,
        )
    except asyncio.TimeoutError:
        return ToolOutput(
            name="web_fetch_link",
            raw_output={"error": "Timeout", "url": url},
            summary="Fetch timed out",
        )
    # pylint: disable=broad-exception-caught
    except Exception as e:
        return ToolOutput(
            name="web_fetch_link",
            raw_output={"error": str(e), "url": url},
            summary="Fetch failed with unexpected error",
        )

async def _afetch(url: str):
    session = await HttpSession.get()
    async with session.get(url, allow_redirects=True) as resp:
        cl = resp.headers.get("Content-Length")
        if cl and int(cl) > _MAX_BYTES:
            raise ValueError(f"Response exceeds {_MAX_BYTES} bytes (Content-Length)")

        resp.raise_for_status()
        ctype = (resp.headers.get("Content-Type") or "").lower()

        total = 0
        chunks = []
        async for chunk in resp.content.iter_chunked(64 * 1024):
            total += len(chunk)
            if total > _MAX_BYTES:
                raise ValueError(f"Response exceeds {_MAX_BYTES} bytes")
            chunks.append(chunk)
        body = b"".join(chunks)
        title = None

        if "application/json" in ctype:
            try:
                text = body.decode(resp.charset or "utf-8", errors="replace")
                content_out = json.loads(text)
            # pylint: disable=broad-exception-caught
            except Exception:
                content_out = text
        elif ctype.startswith("text/") or "xml" in ctype or "html" in ctype:
            content_out = body.decode(resp.charset or "utf-8", errors="replace")
            title = re.search(
                r"<title[^>]*>(.*?)</title>", content_out, re.IGNORECASE | re.DOTALL
            ).group(1)
        else:
            content_out = {"b64": base64.b64encode(body).decode("ascii")}

        return content_out, title, {
            "content_type": ctype or "application/octet-stream",
            "status": resp.status,
            "final_url": str(resp.real_url),
            "size_bytes": total,
        }
