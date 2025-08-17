import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react"
import { useUsersStore } from "@/hooks/use-users-store";

function User() {
  const currentUser = useUsersStore((s) => s.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.id) navigate("/")
  }, [currentUser])

  return currentUser && (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full relative">
          <Outlet />
        </main>
      </SidebarProvider>
    </>
  )
}

export default User;
