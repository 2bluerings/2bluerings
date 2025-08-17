import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProjectsStore } from "@/hooks/use-projects-store";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type NewProjectDialogProps = {
  trigger: React.ReactNode;
};

export function NewProjectDialog({ trigger }: NewProjectDialogProps) {
  const create = useProjectsStore((s) => s.create);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const project = await create(name.trim())
      navigate(`/projects/${project.id}`)
      setOpen(false)
    } finally {
      setLoading(false)
      setName("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            Organize your work efficiently into projects.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="new-project-form">
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                form="new-project-form"
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={loading}
              form="new-project-form"
              className="cursor-pointer"
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
