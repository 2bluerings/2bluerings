from langchain_core.messages import HumanMessage
from .prompts import THREAD_TITLE_GENERATION_PROMPT

class TitleGenerator():
    def __init__(
        self,
        content: str,
        llm
    ):
        self.content = content
        self.llm = llm

    def call(self) -> str:
        prompt = f"""
        {THREAD_TITLE_GENERATION_PROMPT}

        User message:
        {self.content}
        """

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            title = response.content.strip()
            if title:
                return title
        except Exception:
            pass

        return self.content[:50] + ("..." if len(self.content) > 50 else "")
