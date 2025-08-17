import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from './card';
import { Badge } from "@/components/ui/badge";
import { useContextNodesStore, type ContextNode } from '@/hooks/use-context-nodes-store';
import { formatDistanceToNow } from 'date-fns';
import { TrashIcon, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DeleteContextNodeDialog } from '../delete-context-node-dialog';

interface CustomNodeProps {
  data: ContextNode;
}

const getStatusBadgeStyle = (status: string): string => {
  switch (status.toLowerCase()) {
    case "focus":
      return "bg-yellow-100 text-yellow-800";
    case "pending":
      return "bg-blue-100 text-blue-800";
    case "indexing":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const visibleNodeIds = useContextNodesStore((s) => s.visibleNodeIds)
  const createdAgo = formatDistanceToNow(new Date(data.created_at), {
    addSuffix: true,
  });

  return (
    <Card className={`w-full max-w-sm border-2 
        transition-all duration-200 
        ease-out shadow-none
        ${visibleNodeIds.includes(data.id)
          ? "border-primary/80 border-dashed"
          : "border-2"
        }`
      }
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold leading-tight break-all">
            <span className="inline-flex items-center gap-2 max-w-full break-all">
              {data.link ? (
                <a
                  href={data.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline break-all"
                >
                  {data.name}
                </a>
              ) : (
                data.name
              )}
            </span>
          </CardTitle>
        </div>

        {data.summary && (
          <CardDescription className="text-sm text-muted-foreground truncate break-all">
            {data.summary}
          </CardDescription>
        )}

        <div className="flex flex-wrap gap-2 text-xs lowercase">
          {
            visibleNodeIds.includes(data.id) &&
            <Badge className={getStatusBadgeStyle("focus")}>
              focused
            </Badge>
          }
          <Badge className={getStatusBadgeStyle(data.status)}>
            {data.status}
          </Badge>
          <Badge variant="secondary">{data.source}</Badge>
          <Badge variant="secondary">{data.type}</Badge>
        </div>

        {data.content && (
          <div className="text-sm mt-2 line-clamp-3 text-muted-foreground">
            {data.content}
          </div>
        )}
      </CardHeader>
      <CardFooter className="flex items-center">
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <DeleteContextNodeDialog
                data={data}
                trigger={
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-8 cursor-pointer"
                  >
                    <TrashIcon />
                  </Button>
                }
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Forget</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="size-8 cursor-pointer"
              >
                <RefreshCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <span className="ml-auto text-muted-foreground pt-1 text-xs lowercase">
          {createdAgo}
        </span>
      </CardFooter>

    </Card>
  );
};

export default CustomNode;
