import ChatInput from '@/components/chat-input'
import { motion } from "framer-motion"
import ChatMessages from '@/components/chat-messages'
import ContextUi from '@/components/context-ui'
import { Button } from "@/components/ui/button"
import { Folder, Blend, Link2, Info } from "lucide-react"
import { NewProjectDialog } from "@/components/new-project-dialog"
import { useEffect, useRef, useState } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useParams } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'

export function EmptyProjectState() {
  return (
    <div className="h-full min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md p-8">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex justify-center mb-4"
        >
          <Blend className="text-blue-500"/>
        </motion.div>

        <h2 className="text-xl font-semibold tracking-tight">Get started</h2>
        <p className="mt-2 text-muted-foreground">
          Kick things off with a new project.
        </p>
        <div className="mt-6">
          <NewProjectDialog trigger={
            <Button key={"new"} className="cursor-pointer" size="lg">
              <Folder /> New Project
            </Button>
          }/>
        </div>
      </div>
    </div>
  )
}

export function Project() {
  const { projectId } = useParams<{ projectId: string }>()
  const inputRef = useRef<HTMLDivElement | null>(null)
  const [pad, setPad] = useState(80) // fallback padding

  useEffect(() => {
    if (!inputRef.current) return
    const el = inputRef.current
    const ro = new ResizeObserver(() => setPad(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (!projectId) return <EmptyProjectState />

  return (
    <ResizablePanelGroup direction="horizontal" autoSaveId="persistence">
      <ResizablePanel defaultSize={50} className="relative h-full overflow-y-auto">
        <ReactFlowProvider>
          <ContextUi />
        </ReactFlowProvider>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50} className="relative h-full">
        <div className="flex h-full flex-col">
          <div
            className="absolute top-0 w-full h-full overflow-y-auto bg-sidebar p-4 space-y-4"
            style={{ paddingBottom: pad }}
          >
            <ChatMessages />
          </div>
          <div
            ref={inputRef}
            className="absolute bottom-0 w-full border-t bg-sidebar p-4 pt-2"
          >
            <ChatInput />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}


export default Project
