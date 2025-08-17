import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Link, useNavigate } from "react-router-dom"
import { useUsersStore } from "@/hooks/use-users-store"
import { toast } from "sonner"

function SignUp() {
  const navigate = useNavigate();
  const signUpUser = useUsersStore((s) => s.signUp)
  const errorResponse = useUsersStore((s) => s.errorResponse)
  const loading = useUsersStore((s) => s.loading)
  const [payload, setPayload] = useState({
    full_name: "",
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
    const user = await signUpUser(payload)
    if (user.id) {
      toast(
        "Welcome aboard! Sign in to get started."
      )
      navigate("/sign_in")
    }
  }


  return (
    <Card className="w-full max-w-md border-1 shadow-none">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="Full Name"
              value={payload.full_name}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <div>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email"
              value={payload.email}
              autoComplete="off"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password (min 8 chars.)"
              autoComplete="off"
              minLength={8}
              value={payload.password}
              onChange={handleChange}
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
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <span className="mt-4 text-xs text-gray-500 w-full text-center">
            <span>
              Already have an account? <Link to={"/sign_in"} className="font-bold">Sign in</Link>
            </span>
          </span>
        </CardFooter>
      </form>
    </Card>
  )
}

export default SignUp
