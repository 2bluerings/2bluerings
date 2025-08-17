import { ThemeProvider } from "@/components/theme-provider"
import { Suspense, useEffect, useState } from "react";
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import { Loader2 } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"
import { useAppBootstrap } from "./hooks/use-app-bootstrap";

function App() {
  const element = useRoutes(routes);
  const runLoader = useAppBootstrap((state) => state.run)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    await runLoader()
    setCompleted(true)
  }

  return (
    completed &&
    <ThemeProvider defaultTheme="dark" storageKey="cm.uiTheme">
      <Toaster position="top-center"/>
      <div>
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
          </div>
        }>
          {element}
        </Suspense>
      </div>
    </ThemeProvider>
  )
}

export default App;
