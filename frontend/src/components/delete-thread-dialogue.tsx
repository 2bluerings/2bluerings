import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useNavigate, useParams } from 'react-router-dom'
import { useThreadsStore, type Thread } from "@/hooks/use-threads-store"
import { useState } from "react"

type DeleteThreadDialogProps = {
  data: Thread | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteThreadDialog({ data, open, onOpenChange }: DeleteThreadDialogProps) {
  const deleteThread = useThreadsStore((s) => s.delete)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { threadId, projectId } = useParams<{ threadId: string, projectId: string }>()

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    if (!data) return

    setLoading(true)
    try {
      await deleteThread(data.id)
      onOpenChange(false)
      toast(`Thread "${data.title}" was deleted.`)
      if (threadId === data.id) navigate(`/projects/${projectId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete “{data?.title}”?</DialogTitle>
          <DialogDescription>
            This will permanently remove the thread and all its messages. <span className="font-bold">This action can't be undone.</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">Cancel</Button>
          </DialogClose>
          <Button
            disabled={loading}
            onClick={handleSubmit}
            className="cursor-pointer"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}