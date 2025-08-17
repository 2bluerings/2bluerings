import aiohttp

class HttpSession:
    _session: aiohttp.ClientSession | None = None

    @classmethod
    async def get(cls) -> aiohttp.ClientSession:
        s = cls._session
        if s is None or s.closed:
            cls._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=20),
                headers={"User-Agent": "contextmatters-web-fetch/1.0"},
            )
        return cls._session

    @classmethod
    async def close(cls) -> None:
        s = cls._session
        if s and not s.closed:
            await s.close()
        cls._session = None
