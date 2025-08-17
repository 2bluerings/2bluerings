import { useChatMessagesStore, type ChatMessage } from "@/hooks/use-chat-messages-store"
import "highlight.js/styles/tokyo-night-dark.min.css"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ChatOutput from "./chat-output"
import { useParams } from "react-router-dom"
import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTheme } from "./theme-provider"
import { useLlmsStore } from "@/hooks/use-llms-store"
import { Link } from "react-router-dom"
import { Brain, LoaderCircle, MessageCircle } from "lucide-react"
import EmptyState from "./ui/empty-state"

const ChatMessages = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { threadId } = useParams<{ threadId: string }>()
  const messages: ChatMessage[] = useChatMessagesStore((s) => s.items)
  const loadMessages = useChatMessagesStore((s) => s.load)
  const clearMessages = useChatMessagesStore((s) => s.clearItems)
  const unpublishedMessage = useChatMessagesStore((s) => s.unpublishedItem)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const { theme } = useTheme();
  const llms = useLlmsStore((s) => s.items);

  useEffect(() => {
    if (unpublishedMessage) return;

    clearMessages()
    if (threadId && projectId) loadMessages(threadId, projectId)
  }, [projectId, threadId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages])

  const getAssistantMessage = (content: string | Array<any>) => {
    if (typeof(content) === "object") {
      return content[0]?.text
    } else {
      return content
    }
  }

  if (!llms.filter((llm) => llm.active)[0]) {
    return (
      <EmptyState
        Icon={Brain}
        title="No AI models are currently active."
        description={
          <span>
          Add your API keys in the <Link to="/integrations" className="text-primary underline hover:text-primary">Integrations</Link> section to get started.
          </span>
        }
      ></EmptyState>
    )
  }

  if (unpublishedMessage) {
    return (
      <EmptyState
        Icon={LoaderCircle}
        iconClassName="animate-spin"
        title="Getting started..."
        description="Reading project documents..."
      ></EmptyState>
    )
  }

  if (!threadId) {
    return (
      <EmptyState
        Icon={MessageCircle}
        title="Start a new conversation."
        description="Ask your first question to kick things off — I'll keep up from there."
      ></EmptyState>
    )
  }

  return (
    <ScrollArea className="messages-scroll-area w-full h-full overflow-y-auto">
      <style>
        {/* Very hacky, see https://github.com/radix-ui/primitives/issues/2964 */}
        {`
          .messages-scroll-area > div > div {
            display: block !important;
          }
        `}
      </style>
      {messages.map((msg, idx) => (
        <div key={idx}>
          {msg.role === "user" && (
            <div className="flex justify-end items-start mb-4">
              <Alert className="border-none bg-primary/5 w-fit max-w-[80%] break-all">
                <AlertDescription className="whitespace-pre-wrap">{msg.content}</AlertDescription>
              </Alert>
            </div>
          )}

          {msg.role === "assistant" && (
            <div className="mb-4 max-w-none text-sm">
              <ChatOutput>
                {getAssistantMessage(msg.content)}
              </ChatOutput>
              {
                msg.metadata?.error && <Alert variant="destructive">
                  <AlertDescription>{msg.metadata?.detail}</AlertDescription>
                </Alert>
              }
            </div>
          )}

          {msg.role === "tool" && (
            <div className="mb-4 max-w-none text-sm">
              <span className={`shining-text-${theme}`}>{msg.content}</span>
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </ScrollArea>
  );
};

export default ChatMessages;
