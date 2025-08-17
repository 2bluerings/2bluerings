import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { useChatMessagesStore, type ChatMessage } from "@/hooks/use-chat-messages-store"
import { useThreadsStore } from "@/hooks/use-threads-store"
import { useContextNodesStore } from "@/hooks/use-context-nodes-store"
import { X } from "lucide-react"
import type { ContextNode } from "@/hooks/use-context-nodes-store";
import { useApiStore } from "@/hooks/use-api-store";
import ChatInputMenu from "./chat-input-menu";
import { useLlmsStore } from "@/hooks/use-llms-store";

const ChatInput = () => {
  const navigate = useNavigate()
  const [input, setInput] = useState("")
  const { projectId } = useParams<{ projectId: string }>()
  const { threadId } = useParams<{ threadId: string }>()
  const socketRef = useRef<WebSocket | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const createMessage = useChatMessagesStore((s) => s.create)
  const clearUnpublishedMessage = useChatMessagesStore((s) => s.clearUnpublishedItem)
  const setUnpublishedMessage = useChatMessagesStore((s) => s.setUnpublishedItem)
  const unpublishedMessage = useChatMessagesStore((s) => s.unpublishedItem)
  const updateToken = useChatMessagesStore((s) => s.updateToken)
  const createThread = useThreadsStore((s) => s.create)
  const allThreads = useThreadsStore((s) => s.items)
  const [contextNodes, setContextNodes] = useState<ContextNode[]>([]);
  const { removeContextNodeFromCurrent } = useThreadsStore();
  const addThread = useThreadsStore((s) => s.add)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const createSocket = useApiStore((s) => s.createSocket)
  const selectedLlm = useLlmsStore((s) => s.selectedLlm)
  const visibleNodeIds = useContextNodesStore((s) => s.visibleNodeIds)

  useEffect(() => {
    if (!projectId) return

    socketRef.current = createSocket(`/api/v1/projects/${projectId}/messages/chat`)

    if (!socketRef.current) return

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)

      const message = data.message
      const role = message.role
      const metadata = message.metadata

      if (role) {
        if (role === "token") {
          updateToken(message.content)
        } else {
          createMessage(message)
          createMessage({ role: "assistant", content: "" })
        }
      }

      if (metadata?.exit || metadata?.error) {
        setIsStreaming(false)
        return;
      }
    };

    socketRef.current.onopen = () => {
      sendUnpublishedMessage(socketRef.current)
    };

    return () => {
      socketRef.current?.close();
    };
  }, [projectId, threadId]);

  useEffect(() => {
    if (!isStreaming) {
      textareaRef.current?.focus();
    }
  }, [isStreaming])

  useEffect(() => {
    const currentThread = allThreads.find(
      (th) => th.id === threadId
    )
    if (currentThread) {
      setContextNodes(currentThread?.contextNodes || [])
    } else {
      setContextNodes([])
    }
  }, [allThreads])

  const sendUnpublishedMessage = (socket: WebSocket | null) => {
    if (!unpublishedMessage || !socket) return;

    createMessage(unpublishedMessage)
    createMessage({ role: "assistant", content: "" })
    clearUnpublishedMessage()
    setIsStreaming(true)

    socket.send(
      JSON.stringify({
        message: {
          content: unpublishedMessage.content,
          metadata: {
            thread_id: threadId,
            context_node_ids: visibleNodeIds
          }
        }
      })
    )
  }

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!projectId) return;

    if (!threadId) {
      setInput("")
      setUnpublishedMessage({ role: "user", content: input })

      let thread = await createThread(projectId, input)
      addThread([thread])

      navigate(`/projects/${projectId}/threads/${thread.id}`)
      return;
    }

    if (!socketRef.current) return;

    const updatedMessages: ChatMessage[] = [
      {
        role: "user",
        content: input
      },
      {
        role: "assistant",
        content: ""
      },
    ];
    updatedMessages.forEach((message) => {
      createMessage(message)
    })
    setIsStreaming(true);

    socketRef.current.send(
      JSON.stringify({
        message: {
          content: input,
          metadata: {
            thread_id: threadId,
            context_node_ids: visibleNodeIds
          }
        }
      })
    );
    setInput("");
  };

  return (
    <div>
      <ChatInputMenu />
      <Textarea
        ref={textareaRef}
        placeholder="Ask anything"
        disabled={isStreaming || !selectedLlm}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus={true}
        className="border-2"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
      />
      {!!contextNodes?.length && (
        <div className="flex w-full flex-wrap gap-2 mt-2">
          {contextNodes!.map((node: ContextNode) => (
            <Badge key={node.id} className="overflow-hidden max-w-50">
              <span className="truncate">{node.name}</span>
              <button
                type="button"
                aria-label={`Remove ${node.name}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  removeContextNodeFromCurrent(node.id)
                }}
                className="ml-1 -mr-0.5 grid h-4 w-4 place-items-center cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatInput;
