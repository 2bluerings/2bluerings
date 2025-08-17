import { Blend } from "lucide-react"
import { Outlet, useNavigate } from "react-router-dom";
import { useUsersStore } from "@/hooks/use-users-store";
import { useEffect } from "react";

function Guest() {
  const currentUser = useUsersStore((s) => s.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.id) navigate("/")
  }, [currentUser])

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center">
      <div className="mb-6 text-center flex items-center justify-center space-x-2">
        <Blend className="w-6 h-6 text-blue-500" />
        <h1 className="text-lg font-semibold tracking-wide">2 Blue Rings</h1>
      </div>
      <Outlet />
      <div className="mt-4 text-xs text-gray-500 text-center space-y-2">
        <div>version: 2-blue-rings-oss-v0.1.0</div>
        <div className="space-x-2">
          <a
            href="https://github.com/2BlueRings/2BlueRings"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-500"
          >
            ⭐ Star on GitHub
          </a>
          <span>•</span>
          <a
            href="https://github.com/2bluerings/2bluerings/blob/main/LICENSE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-500"
          >
            BUSL-1.1 Licensed
          </a>
        </div>
      </div>
    </main>
  )
}

export default Guest
