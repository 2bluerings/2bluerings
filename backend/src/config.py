# pylint: disable=line-too-long
SUPPORTED_INTEGRATIONS = {
    # tools
    "slack": {
        "name": "Slack",
        "description": "Add our Slack App to your workspace.",
        "type": "tool",
        "logo": "slack",
        "supported": False,
        "placeholder": {
            "api_token": "****"
        }
    },
    "atlassian": {
        "name": "Atlassian",
        "description": "https://id.atlassian.com/manage-profile/security/api-tokens",
        "type": "tool",
        "logo": "atlassian",
        "supported": True,
        "placeholder": {
            "api_token": "****",
            "domain": "your-domain.atlassian.net",
            "username": "username@example.org"
        }
    },
    "github": {
        "name": "GitHub",
        "description": "https://github.com/settings/personal-access-tokens",
        "type": "tool",
        "logo": "github",
        "supported": True,
        "placeholder": {
            "api_token": "****"
        }
    },
    "tavily": {
        "name": "Tavily",
        "description": "https://app.tavily.com/home",
        "type": "llm",
        "logo": None,
        "supported": True,
        "placeholder": {
            "api_token": "****"
        }
    },

    # LLMs
    "openai": {
        "name": "ChatGPT",
        "description": "https://platform.openai.com/api-keys",
        "type": "llm",
        "logo": "openai",
        "supported": True,
        "placeholder": {
            "api_token": "****"
        }
    },
    "groq": {
        "name": "Groq",
        "description": "https://console.groq.com/keys.",
        "type": "llm",
        "logo": None,
        "supported": True,
        "placeholder": {
            "api_token": "****"
        }
    },
    "anthropic": {
        "name": "Anthropic",
        "description": "https://console.anthropic.com/settings/keys",
        "type": "llm",
        "logo": "anthropic",
        "supported": False,
        "placeholder": {
            "api_token": "****"
        }
    }
}

SUPPORTED_LLM_MODELS = {
    "openai": {
        "gpt-5": {
            "supported": True
        },
        "gpt-5-mini": {
            "supported": True
        },
        "gpt-5-nano": {
            "supported": True
        },
        "gpt-4.1": {
            "supported": True
        },
        "gpt-4.1-mini": {
            "supported": True
        },
        "gpt-4.1-nano": {
            "supported": True
        },
        "gpt-4o": {
            "supported": True
        },
        "gpt-4o-mini": {
            "supported": True
        },
        "gpt-4": {
            "supported": True
        }
    },
    "anthropic": {
        "claude-opus-4-1": {
            "supported": False
        },
        "claude-opus-4-0": {
            "supported": False
        },
        "claude-sonnet-4-0": {
            "supported": False
        },
        "claude-3-7-sonnet-latest": {
            "supported": False
        },
        "claude-3-5-sonnet-latest": {
            "supported": False
        },
        "claude-3-5-haiku-latest": {
            "supported": False
        },
    },
    "groq": {
        "qwen/qwen3-32b": {
            "supported": True
        },
        "llama-3.1-8b-instant": {
            "supported": True
        },
        "llama-3.3-70b-versatile": {
            "supported": True
        },
        "meta-llama/llama-4-maverick-17b-128e-instruct": {
            "supported": True
        },
        "meta-llama/llama-4-scout-17b-16e-instruct": {
            "supported": True
        },
        "meta-llama/llama-guard-4-12b": {
            "supported": True
        },
        "meta-llama/llama-prompt-guard-2-22m": {
            "supported": True
        },
        "meta-llama/llama-prompt-guard-2-86m": {
            "supported": True
        },
        "deepseek-r1-distill-llama-70b": {
            "supported": True
        },
        "openai/gpt-oss-120b": {
            "supported": True
        },
        "openai/gpt-oss-20b": {
            "supported": True
        }
    },
}
