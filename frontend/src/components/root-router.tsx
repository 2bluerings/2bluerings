import { useNavigate } from "react-router-dom";
import { useUsersStore } from "@/hooks/use-users-store";
import { useEffect } from "react";

function RootRouter() {
  const currentUser = useUsersStore((s) => s.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.id) {
      navigate("/projects")
    } else {
      navigate("/sign_in")
    }
  }, [currentUser])

  return (
    <></>
  )
}

export default RootRouter
