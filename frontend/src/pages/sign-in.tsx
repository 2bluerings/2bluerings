import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useUsersStore } from "@/hooks/use-users-store"
import { toast } from "sonner"
import { Link, useNavigate } from "react-router-dom"

function SignIn() {
  const navigate = useNavigate();
  const signInUser = useUsersStore((s) => s.signIn)
  const errorResponse = useUsersStore((s) => s.errorResponse)
  const loading = useUsersStore((s) => s.loading)
  const [payload, setPayload] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e: any) => {
    setPayload({
      ...payload,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const user = await signInUser(payload)
    if (user.id) {
      const name = ` ${user?.full_name?.split(" ")[0] || ""}`
      toast(
        `Welcome back${name}!`
      )
      navigate("/")
    }
  }

  return (
    <Card className="w-full max-w-md border-1 shadow-none">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email"
              value={payload.email}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={payload.password}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          {errorResponse?.detail && (
            <div className="text-sm text-red-500">
              {errorResponse.detail}
            </div>
          )}

          <div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <span className="mt-4 text-xs text-gray-500 w-full text-center">
            <span>
              Don't have an account? <Link to={"/sign_up"} className="font-bold">Sign up</Link>
            </span>
          </span>
        </CardFooter>
      </form>
    </Card>
  )
}

export default SignIn
