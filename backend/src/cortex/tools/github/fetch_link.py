from __future__ import annotations
import base64
import re
from typing import Optional, Tuple, Dict, Any
import requests
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig

from ....repositories.integration import Integration as IntegrationRepository
from ...protocols import ToolOutput, ContextNodeOutput

GITHUB_URL_RE = re.compile(
    r"""
    ^https://github\.com/
    (?P<owner>[^/]+)/(?P<repo>[^/#?]+)
    (?:
        /
        (?:
            blob/(?P<ref>[^/]+)/(?P<path>[^#]+)      # file view
          | tree/(?P<tree_ref>[^/]+)(?:/(?P<dirpath>[^#]+))?  # dir view
          | commit/(?P<commit>[0-9a-f]{7,40})        # commit
          | issues/(?P<issue_number>\d+)             # issue
          | pull/(?P<pull_number>\d+)                # pull request
        )
    )?
    (?:\#(?P<anchor>.+))?
    $
    """,
    re.VERBOSE | re.IGNORECASE,
)

def _gh_headers(token: str, etag: Optional[str] = None) -> Dict[str, str]:
    h = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "contextmatters/1.0",
    }
    if etag:
        h["If-None-Match"] = etag
    return h

def _parse_github_url(url: str) -> Optional[Dict[str, Any]]:
    m = GITHUB_URL_RE.match(url)
    if not m:
        return None
    d = m.groupdict()
    d["kind"] = (
        "file" if d.get("ref") and d.get("path") else
        "dir" if d.get("tree_ref") else
        "commit" if d.get("commit") else
        "issue" if d.get("issue_number") else
        "pr" if d.get("pull_number") else
        "repo"
    )
    # parse optional line anchors like L12-L34
    line_from = line_to = None
    if d.get("anchor"):
        m2 = re.match(r"L(?P<from>\d+)(?:-L(?P<to>\d+))?$", d["anchor"])
        if m2:
            line_from = int(m2.group("from"))
            line_to = int(m2.group("to")) if m2.group("to") else line_from
    d["line_from"], d["line_to"] = line_from, line_to
    return d

def _resolve_sha_for_path(owner: str, repo: str, ref: str, path: Optional[str], token: str, timeout: int) -> str:
    # If already a 40-char SHA, keep it
    if re.fullmatch(r"[0-9a-f]{40}", ref or ""):
        return ref
    params = {"sha": ref}
    if path:
        params["path"] = path
    r = requests.get(
        f"https://api.github.com/repos/{owner}/{repo}/commits",
        params=params,
        headers=_gh_headers(token),
        timeout=timeout,
    )
    r.raise_for_status()
    commits = r.json()
    if not commits:
        raise ValueError("Could not resolve commit SHA for ref/path")
    return commits[0]["sha"]

def _fetch_file_content(owner: str, repo: str, path: str, sha: str, token: str, timeout: int) -> Tuple[str, Dict[str, Any]]:
    r = requests.get(
        f"https://api.github.com/repos/{owner}/{repo}/contents/{path}",
        params={"ref": sha},
        headers=_gh_headers(token),
        timeout=timeout,
    )
    r.raise_for_status()
    j = r.json()
    if j.get("type") != "file":
        raise ValueError("Target path is not a file")
    if j.get("encoding") != "base64" or "content" not in j:
        raise ValueError("Unsupported file encoding or empty content")
    raw = base64.b64decode(j["content"]).decode("utf-8", errors="ignore")
    meta = {
        "owner": owner,
        "repo": repo,
        "path": path,
        "sha": sha,
        "size": j.get("size"),
        "name": j.get("name"),
    }
    return raw, meta

def _fetch_issue(owner: str, repo: str, number: int, token: str, timeout: int) -> Dict[str, Any]:
    r = requests.get(
        f"https://api.github.com/repos/{owner}/{repo}/issues/{number}",
        headers=_gh_headers(token),
        timeout=timeout,
    )
    r.raise_for_status()
    return r.json()

def _fetch_pr(owner: str, repo: str, number: int, token: str, timeout: int) -> Dict[str, Any]:
    r = requests.get(
        f"https://api.github.com/repos/{owner}/{repo}/pulls/{number}",
        headers=_gh_headers(token),
        timeout=timeout,
    )
    r.raise_for_status()
    return r.json()

def _fetch_repo(owner: str, repo: str, token: str, timeout: int) -> Dict[str, Any]:
    r = requests.get(
        f"https://api.github.com/repos/{owner}/{repo}",
        headers=_gh_headers(token),
        timeout=timeout,
    )
    r.raise_for_status()
    return r.json()

def _trim_lines(text: str, lfrom: Optional[int], lto: Optional[int]) -> str:
    if not lfrom:
        return text
    lines = text.splitlines()
    n = len(lines)
    start = max(1, lfrom)
    end = min(n, lto if lto else lfrom)
    return "\n".join(lines[start-1:end])

@tool(
    "github_fetch_link",
    description=(
        """
        Use this tool ONLY when the user provides a valid GitHub link
        (repo, file, commit, issue, or pull request). Token (PAT) is read
        from the integration config. This tool fetches the required data needed
        to create a ContextNode and returns raw content when applicable.
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
    config = repo.find_config(name="github", user_id=current_user.id)
    token = config.get("api_token")
    if not token:
        raise ValueError("Integration(github) not setup.")

    parsed = _parse_github_url(url)
    if not parsed:
        raise ValueError("Not a valid GitHub URL")

    owner, gh_repo = parsed["owner"], parsed["repo"]
    timeout = 10

    kind = parsed["kind"]
    title = None
    content = None
    metadata: Dict[str, Any] = {
        "owner": owner,
        "repo": gh_repo,
        "kind": kind,
    }
    permalink = url

    if kind == "file":
        ref, path = parsed["ref"], parsed["path"]
        sha = _resolve_sha_for_path(owner, gh_repo, ref, path, token, timeout)
        raw, meta = _fetch_file_content(owner, gh_repo, path, sha, token, timeout)
        sliced = _trim_lines(raw, parsed["line_from"], parsed["line_to"])

        title = path
        content = sliced if sliced else raw
        metadata.update(meta)
        permalink = f"https://github.com/{owner}/{gh_repo}/blob/{sha}/{path}"
    elif kind == "issue":
        num = int(parsed["issue_number"])
        j = _fetch_issue(owner, gh_repo, num, token, timeout)
        title = j.get("title") or f"Issue #{num}"
        content = (j.get("body") or "").strip()
        metadata.update({
            "number": num,
            "state": j.get("state"),
            "author": j.get("user", {}).get("login"),
        })
        permalink = j.get("html_url") or url
    elif kind == "pr":
        num = int(parsed["pull_number"])
        j = _fetch_pr(owner, gh_repo, num, token, timeout)
        title = j.get("title") or f"PR #{num}"
        content = (j.get("body") or "").strip()
        metadata.update({
            "number": num,
            "state": j.get("state"),
            "author": j.get("user", {}).get("login"),
            "merged": j.get("merged"),
        })
        permalink = j.get("html_url") or url
    elif kind == "commit":
        title = f"Commit {parsed['commit'][:12]}"
        content = ""
        metadata.update({"sha": parsed["commit"]})
        permalink = url
    elif kind in ("repo", "dir"):
        j = _fetch_repo(owner, gh_repo, token, timeout)
        title = j.get("full_name") or f"{owner}/{gh_repo}"
        content = (j.get("description") or "").strip()
        metadata.update({
            "default_branch": j.get("default_branch"),
            "visibility": j.get("visibility"),
            "archived": j.get("archived"),
        })
        permalink = j.get("html_url") or url
    else:
        raise ValueError("Unsupported GitHub URL type")

    return ToolOutput(
        name=title or "github",
        raw_output={
            "title": title,
            "content": content,
            "metadata": metadata,
            "permalink": permalink,
        },
        context_node=ContextNodeOutput(
            name=title or metadata.get("path") or f"{owner}/{gh_repo}",
            link=permalink,
            type="link",
            source="github",
            project_id=project_id,
        ),
    )
