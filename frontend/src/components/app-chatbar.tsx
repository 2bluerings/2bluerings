import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import ChatInput from "./chat-input"
import ChatMessages from "./chat-messages"

export function AppChatbar() {
  return (
    <Sidebar
      side="right"
      variant="floating"
      style={{
        // @ts-ignore
        "--sidebar-width": "32rem"
      }}
    >
      <SidebarHeader />
      <SidebarContent className="flex flex-col overflow-hidden">
        <SidebarGroup className="flex-1 overflow-hidden">
          <SidebarGroupContent className="flex-1 overflow-y-auto">
            <ChatMessages />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ChatInput />
      </SidebarFooter>
    </Sidebar>
  )
}
