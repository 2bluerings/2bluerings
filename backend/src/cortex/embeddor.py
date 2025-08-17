import os
from openai import AsyncOpenAI

async def create_embedding(
    content: str,
    provider: str="openai",
    model: str="text-embedding-3-small"
):
    response = await AsyncOpenAI(
        api_key=os.getenv("OPENAI_API_KEY")
    ).embeddings.create(
        model=model,
        input=content
    )
    return response.data[0].embedding
