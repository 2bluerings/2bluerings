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
import { Label } from "@/components/ui/label"
import { useIntegrationsStore, type Integration } from "@/hooks/use-integrations-store"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"

type NewIntegrationDialogProps = {
  trigger: React.ReactNode;
  data: Integration
};

export function NewIntegrationDialog({ trigger, data }: NewIntegrationDialogProps) {
  const create = useIntegrationsStore((s) => s.create);
  const update = useIntegrationsStore((s) => s.update);
  const [config, setConfig] = useState(
    Object.keys(data.config).length !== 0 ? JSON.stringify(data.config, null, 4) : ""
  );
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setLoading(true)
    try {
      if (data.id) {
        await update(data.id, data.name, JSON.parse(config || "{}"));  
      } else {
        await create(data.name, JSON.parse(config || "{}"));
      }
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} id="new-integration-form" />
        <DialogHeader>
          <DialogTitle>Setup {data.display_name}</DialogTitle>
          <DialogDescription>
            Configure the integration to connect with {data.display_name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="config">Configuration</Label>
            <Textarea
              name="config"
              id="config"
              value={config}
              form="new-integration-form"
              onChange={(e) => setConfig(e.target.value)}
              rows={8}
              placeholder={JSON.stringify(data.placeholder, null, 2)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={loading}
            form="new-integration-form"
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
