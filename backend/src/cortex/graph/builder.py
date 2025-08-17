from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import tools_condition
from .nodes.tool_node import tool_node
from .state import State
from .nodes.chatbot_node import chatbot_node

builder = StateGraph(State)
builder.add_node("chatbot", chatbot_node)
builder.add_node("tools", tool_node)

builder.add_edge(START, "chatbot")
builder.add_conditional_edges(
    "chatbot",
    tools_condition,
    {"tools": "tools", "__end__": "__end__"}
)
builder.add_edge("tools", "chatbot")
builder.add_edge("chatbot", END)
