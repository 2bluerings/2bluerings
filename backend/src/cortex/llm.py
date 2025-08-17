from sqlalchemy.orm import Session
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from .tools import all_tools
from ..models.user import User as UserModel
from ..repositories.integration import Integration as IntegrationRepository
from ..config import SUPPORTED_LLM_MODELS

provider_classes = {
    "openai": ChatOpenAI,
    "anthropic": ChatAnthropic,
    "groq": ChatGroq,
    "google": ChatGoogleGenerativeAI 
}

def get_llm(
    db_session: Session,
    current_user: UserModel,
    callbacks=None,
):
    # Will need some optimizations later to avoid this call
    # current_user object can get updated but ws connection
    # keeps using the stale current_user
    db_session.refresh(current_user)

    provider = current_user.settings["llm_provider"]
    model = current_user.settings["llm_model"]

    if SUPPORTED_LLM_MODELS.get(provider) is None:
        raise ValueError(f"Unsupported provider: {provider}")
    if SUPPORTED_LLM_MODELS[provider][model] is None:
        raise ValueError(f"Unsupported model: {model} for provider {provider}")

    repo = IntegrationRepository(db_session)
    integrations = repo.where(user_id=current_user.id)

    integration = next(
        (i for i in integrations if i.name == provider),
        None
    )

    if not integration:
        raise ValueError(f"No integration setup for provider: {provider}")

    config = integration.config
    if not config:
        raise ValueError(f"No configuration found for {provider} integration")

    return provider_classes[provider](
        model=model,
        temperature=0,
        streaming=True,
        callbacks=callbacks or [],
        api_key=config["api_token"]
    ).bind_tools(all_tools)
