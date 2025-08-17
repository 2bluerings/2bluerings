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
import { toast } from "sonner"
import { useContextNodesStore, type ContextNode } from "@/hooks/use-context-nodes-store"
import { useState } from "react"

type deletedContextNodeDialog = {
  trigger: React.ReactNode;
  data: ContextNode
};

export function DeleteContextNodeDialog({ trigger, data }: deletedContextNodeDialog) {
  const deleteNode = useContextNodesStore((s) => s.delete)
  const deleting = useContextNodesStore((s) => s.deleting)
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    await deleteNode(data.id);
    toast(`Context Node "${data.name}" was deleted.`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete “{data?.name}”?</DialogTitle>
          <DialogDescription>
            This will permanently remove the node and all it's contents. <span className="font-bold">This action can't be undone.</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">Cancel</Button>
          </DialogClose>
          <Button
            disabled={deleting}
            onClick={handleSubmit}
            className="cursor-pointer"
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
