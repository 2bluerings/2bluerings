import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brain, ChevronUp } from "lucide-react";
import { useLlmsStore } from "@/hooks/use-llms-store";
import { useModesStore } from "@/hooks/use-modes-store";
import { useUsersStore } from "@/hooks/use-users-store";
import { Icon } from '@iconify/react';

export default function ChatInputMenu() {
  const llms = useLlmsStore((s) => s.items)
  const loadLllms = useLlmsStore((s) => s.load)
  const selectLlm = useLlmsStore((s) => s.selectLlm)
  const selectedLlm = useLlmsStore((s) => s.selectedLlm)

  const modes = useModesStore((s) => s.items)
  const loadModes = useModesStore((s) => s.load)
  const selectMode = useModesStore((s) => s.selectMode)
  const selectedMode = useModesStore((s) => s.selectedMode)

  const updateUserSettings = useUsersStore((s) => s.updateSettings);
  const currentUser = useUsersStore((s) => s.currentUser);

  useEffect(() => {
    loadLllms()
    loadModes()
  }, [])

  useEffect(() => {
    if (llms.length > 0) {
      const preSelected = currentUser?.settings?.llm_model
      if (!preSelected) {
        selectLlm(llms.filter((llm) => llm.active && llm.supported)[0]);
      } else {
        selectLlm(llms.filter((llm) => llm.model === preSelected)[0]);
      }
    }
  }, [llms]);

  useEffect(() => {
    if (!selectedMode) {
      selectMode(
        modes.filter((m) => m.name === "default")[0]
      );
    }
  }, [selectedMode]);

  useEffect(() => {
    if (!selectedLlm || !selectedLlm.active || !selectedLlm.supported) return

    const preSelected = currentUser?.settings?.llm_model
    if (preSelected === selectedLlm.model) return

    updateUserSettings({
      llm_model: selectedLlm.model,
      llm_provider: selectedLlm.provider
    })
  }, [selectedLlm])

  return (
    <div className="mb-2 flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className="border-none"
              size="sm"
              aria-label="Select LLM"
              title={selectedLlm?.model}
            >
              <Brain />
              <span className="mt-0.5">
                {
                  selectedLlm
                  ?
                  `${selectedLlm?.provider}-${selectedLlm?.model}`
                  :
                  `Choose Model`
                }
              </span>
              <ChevronUp />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Choose Model</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={selectedLlm?.model}
              onValueChange={(v) => {
                selectLlm(llms.find((llm) => llm.model === v)!)
              }}
            >
              {llms
                .sort((a, b) => a.provider.localeCompare(b.provider) || a.model.localeCompare(b.model))
                .reduce<{ provider: string; items: typeof llms }[]>((acc, llm) => {
                  const group = acc.find((g) => g.provider === llm.provider)
                  if (group) {
                    group.items.push(llm)
                  } else {
                    acc.push({ provider: llm.provider, items: [llm] })
                  }
                  return acc
                }, [])
                .map((group, groupIndex, arr) => (
                  <div key={group.provider}>
                    {group.items.map((l) => (
                      <DropdownMenuRadioItem
                        key={l.model}
                        value={l.model}
                        disabled={!(l.active && l.supported)}
                      >
                        {l.provider}-{l.model}
                      </DropdownMenuRadioItem>
                    ))}
                    {groupIndex < arr.length - 1 && <DropdownMenuSeparator />}
                  </div>
                ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="border-none"
              aria-label="Modes"
              title={selectedMode?.name}
            >
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <Icon
                  icon={`lucide:${selectedMode?.icon || "blend"}`}
                  className="w-4 h-4 inline-block"
                />
                <span className="mt-0.5">{selectedMode?.title ?? "Select Mode"}</span>
              </span>
              <ChevronUp />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Choose Mode</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={selectedMode?.name}
              onValueChange={(v) => {
                selectMode(modes.find((m) => m.name === v)!)
              }}
            >
              {modes.map((m) => (
                <DropdownMenuRadioItem
                  key={m.name}
                  value={m.name}
                  disabled={!m.supported}
                >
                  {m.title}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
