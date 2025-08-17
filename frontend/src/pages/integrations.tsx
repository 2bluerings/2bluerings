import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { BadgeCheckIcon, BadgeAlert } from "lucide-react";
import { useIntegrationsStore } from "@/hooks/use-integrations-store";
import { useEffect } from "react"
import { NewIntegrationDialog } from "@/components/new-integration-dialogue";
import TypographyLarge from "@/components/ui/typography-large";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function Integrations() {
  const integrations = useIntegrationsStore((s) => s.items)
  const load = useIntegrationsStore((s) => s.load)

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="mx-auto p-4">
      <TypographyLarge>
        AI Assistants
      </TypographyLarge>
      <div className="mb-2" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {integrations.filter((integration) => integration.type == "llm").map((integration) => (
          <Card
            key={integration.name}
            className="cursor-pointer items-center border-1 shadow-none"
          >
            <CardContent className="items-center">
              {integration.logo ? (
                <Icon
                  icon={`simple-icons:${integration.logo}`}
                  width={36}
                  height={36}
                />
              ) : (
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-muted font-medium">
                    {integration.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </CardContent>
            <CardContent className="text-center flex flex-col gap-4">
              <CardTitle>{integration.display_name}</CardTitle>
              <CardDescription className="break-all">{integration.description}</CardDescription>
            </CardContent>
            <CardFooter className="">
              <NewIntegrationDialog
                trigger={
                  integration.active && integration.supported ? (
                    <Button variant="outline" size="sm" className="cursor-pointer">
                      <BadgeCheckIcon color="green"/> Connected
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="cursor-pointer" disabled={!integration.supported}>
                      <BadgeAlert color="orange"/> {
                        integration.supported ? "Connect" : "Coming soon"
                      }
                    </Button>
                  )
                }
                data={integration}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-4" />
      <TypographyLarge>
        Productivity Tools
      </TypographyLarge>
      <div className="mb-2" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {integrations.filter((integration) => integration.type == "tool").map((integration) => (
          <Card
            key={integration.name}
            className="cursor-pointer items-center border-1 shadow-none"
          >
            <CardContent className="items-center">
              <Icon icon={`simple-icons:${integration.logo}`} width={36} height={36} />            
            </CardContent>
            <CardContent className="text-center flex flex-col gap-4">
              <CardTitle>{integration.display_name}</CardTitle>
              <CardDescription className="break-all">{integration.description}</CardDescription>
            </CardContent>
            <CardFooter className="">
              <NewIntegrationDialog
                trigger={
                  integration.active && integration.supported ? (
                    <Button variant="outline" size="sm" className="cursor-pointer">
                      <BadgeCheckIcon color="green"/> Connected
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="cursor-pointer" disabled={!integration.supported}>
                      <BadgeAlert color="orange"/> {
                        integration.supported ? "Connect" : "Coming soon"
                      }
                    </Button>
                  )
                }
                data={integration}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Integrations;
