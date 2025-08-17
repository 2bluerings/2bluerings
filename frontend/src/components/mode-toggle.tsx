import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { SidebarMenuButton } from "@/components/ui/sidebar"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <SidebarMenuButton onClick={toggleTheme} className="cursor-pointer">
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      {theme === "dark" ? "Dark Mode" : "Light Mode"}
    </SidebarMenuButton>
  )
}
