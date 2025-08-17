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
import { useNavigate, useParams } from 'react-router-dom';
import { useProjectsStore, type Project } from "@/hooks/use-projects-store"
import { useState } from "react"

type DeleteProjectDialogProps = {
  data: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteProjectDialog({ data, open, onOpenChange }: DeleteProjectDialogProps) {
  const deleteProject = useProjectsStore((s) => s.delete)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const { projectId } = useParams<{ projectId: string }>()

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    if (!data) { return }

    setLoading(true)
    try {
      await deleteProject(data.id);
      onOpenChange(false);

      toast(`Project "${data.name}" was deleted.`)
      if (projectId === data.id) navigate("/")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete “{data?.name}”?</DialogTitle>
          <DialogDescription>
            This will permanently remove the project and all conversations. <span className="font-bold">This action can't be undone.</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">Cancel</Button>
          </DialogClose>
          <Button
            disabled={loading}
            onClick={(e) => handleSubmit(e)}
            className="cursor-pointer"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
