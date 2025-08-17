
import {
	Sidebar,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarFooter,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
  SidebarRail,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuAction
} from "@/components/ui/sidebar"
import {
  Avatar,
  AvatarFallback
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
  Folder,
  Blocks,
  FolderOpenDot,
  Blend,
  ChevronUp,
  LogOut,
  Moon,
  Sun,
  EllipsisVertical
} from "lucide-react"
import { NewProjectDialog } from "./new-project-dialog"
import { useProjectsStore, type Project } from "@/hooks/use-projects-store"
import { useThreadsStore, type Thread } from "@/hooks/use-threads-store"
import { Link, useParams } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { useUsersStore } from "@/hooks/use-users-store"
import { useTheme } from "@/components/theme-provider"
import { DeleteProjectDialog } from "@/components/delete-project-dialogue"
import { DeleteThreadDialog } from "@/components/delete-thread-dialogue"

export function AppSidebar() {
  const { items: projects } = useProjectsStore()
  const currentUser = useUsersStore((s) => s.currentUser)
  const signOut = useUsersStore((s) => s.signOut)
  const { load: loadProjects } = useProjectsStore()
  const { setCurrent: setCurrentThread, items: allThreads } = useThreadsStore()
  const { projectId, threadId } = useParams<{ projectId: string, threadId: string }>()
  const { setTheme, theme } = useTheme()
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const [toDeleteTh, setToDeleteTh] = useState<Thread | null>(null);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  useEffect(() => {
    init()
  }, [loadProjects])

  const init = async () => {
    await loadProjects()
    if (threadId) {
      setCurrentThread(threadId)
    } else {
      setCurrentThread(null)
    }
  }

  useEffect(() => {
    if (threadId) {
      setCurrentThread(threadId)
    } else {
      setCurrentThread(null)
    }
  }, [threadId])

  return (
		<Sidebar side="left" variant="sidebar">
      <DeleteProjectDialog
        data={toDelete as Project}
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
      />
      <DeleteThreadDialog
        data={toDeleteTh as Thread}
        open={!!toDeleteTh}
        onOpenChange={(open) => !open && setToDeleteTh(null)}
      />
			<SidebarHeader className="flex items-center">
        <Blend className="h-8 w-8 text-blue-500" />
      </SidebarHeader>
      <Separator className="" />
      <SidebarContent>
        <style>
          {/* Very hacky, see https://github.com/radix-ui/primitives/issues/2964 */}
          {`
            .messages-scroll-area > div > div {
              display: block !important;
            }
          `}
        </style>
        <ScrollArea className="h-full w-full overflow-y-auto messages-scroll-area">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <NewProjectDialog trigger={
                  <SidebarMenuItem key={"new"}>
                    <SidebarMenuButton asChild>
                      <a href={"#"}>
                        <FolderOpenDot />
                        <span>New Project</span>
                      </a>
                    </SidebarMenuButton>  
                  </SidebarMenuItem>
                }/>
                <SidebarMenuItem key={"integrations"}>
                  <SidebarMenuButton asChild>
                    <Link to={"/integrations"}>
                      <Blocks />
                      <span>Integrations</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {
                  (projects || []).map((project) => (
                    <Collapsible className="group/collapsible" key={project.id} open={projectId === project.id}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton asChild isActive={projectId === project.id && !threadId}>
                            <Link to={`/projects/${project.id}`}>
                              <Folder />
                              <span>{project.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {
                              (
                                allThreads
                                  .filter((th) => th.project_id === project.id)
                                  .sort((a, b) => {
                                    return (
                                      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                                    );
                                  })
                              ).map((th) => (
                                <SidebarMenuSubItem key={th.id}>
                                  <SidebarMenuSubButton asChild isActive={threadId === th.id}>
                                    <Link to={`/projects/${project.id}/threads/${th.id}`}>
                                      <span>{th.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild className="cursor-pointer">
                                      <SidebarMenuAction>
                                        <EllipsisVertical />
                                      </SidebarMenuAction>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="right" align="start">
                                      <DropdownMenuItem className="cursor-pointer" onClick={() => setToDeleteTh(th)}>
                                        <span>Delete</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </SidebarMenuSubItem>
                              ))
                            }
                          </SidebarMenuSub>
                        </CollapsibleContent>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild className="cursor-pointer">
                            <SidebarMenuAction>
                              <EllipsisVertical />
                            </SidebarMenuAction>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => setToDelete(project)}>
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    </Collapsible>
                  ))
                }
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
      <Separator className="" />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="cursor-pointer w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {currentUser?.full_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{currentUser?.full_name}</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="min-w-[var(--radix-popper-anchor-width)] w-[var(--radix-popper-anchor-width)]"
              >
                <DropdownMenuItem className="cursor-pointer" onClick={toggleTheme}>
                  <Sun className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                  <LogOut className="" />Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
		</Sidebar>
	)
}
