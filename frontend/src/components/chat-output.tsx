import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import TypographyH1 from "./ui/typography-h1";
import TypographyH2 from "./ui/typography-h2";
import TypographyH3 from "./ui/typography-h3";
import TypographyH4 from "./ui/typography-h4";
import TypographyP from "./ui/typography-p";
import { useTheme } from "@/components/theme-provider"
import TypographySmall from "./ui/typography-small"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ChatOutputProps = {
  children: string;
};

const ChatOutput: React.FC<ChatOutputProps> = ({ children }) => {
  const { theme } = useTheme()
  useEffect(() => {
    if (theme === "light") {
      import("highlight.js/styles/github.min.css");
    } else {
      import("highlight.js/styles/github-dark.min.css");
    }
  }, [theme]);

  return (
    <div>
      <ReactMarkdown
        key={`rmd-${theme}`}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        
        components={{
          pre: ({ node, ...props }) => (
            <ScrollArea>
              <style>{
                theme === "dark" && `
                  .hljs {
                    color: #c9d1d9;
                    background: #111;
                  }
              `}
              </style>
              <pre className="rounded-lg overflow-x-auto mb-2 mt-2 bg-primary/10" {...props} />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            
          ),
          code: ({ node, ...props }) => (
            <code className="rounded-lg bg-primary/10 px-2 py-0" {...props} />
          ),
          h1: ({ node, ...props }) => (
            <TypographyH1>{props.children}</TypographyH1>
          ),
          h2: ({ node, ...props }) => (
            <TypographyH2>{props.children}</TypographyH2>
          ),
          h3: ({ node, ...props }) => (
            <TypographyH3>{props.children}</TypographyH3>
          ),
          h4: ({ node, ...props }) => (
            <TypographyH4>{props.children}</TypographyH4>
          ),
          p: ({ node, ...props }) => (
            <TypographyP>{props.children}</TypographyP>
          ),
          small: ({ node, ...props }) => (
            <TypographySmall>{props.children}</TypographySmall>
          ),
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" className="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors">{props.children}</a>
          ),
          table: ({ node, ...props }) => <Table>{props.children}</Table>,
          thead: ({ node, ...props }) => <TableHeader>{props.children}</TableHeader>,
          tbody: ({ node, ...props }) => <TableBody>{props.children}</TableBody>,
          tr: ({ node, ...props }) => <TableRow>{props.children}</TableRow>,
          th: ({ node, ...props }) => <TableHead>{props.children}</TableHead>,
          td: ({ node, ...props }) => <TableCell>{props.children}</TableCell>,
          tfoot: ({ node, ...props }) => <TableFooter>{props.children}</TableFooter>,
          caption: ({ node, ...props }) => <TableCaption>{props.children}</TableCaption>,
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-2 space-y-1 pb-2 pt-2">{props.children}</ul>
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-2 space-y-1 pb-2 pt-2">{props.children}</ol>
          ),
          li: ({ node, ...props }) => (
            <li className="ml-2">{props.children}</li>
          )
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

export default ChatOutput;
