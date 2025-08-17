import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Home } from "lucide-react"
import TypographyLarge from "@/components/ui/typography-large"
import TypographyP from "@/components/ui/typography-p"

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="container relative mx-auto flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-xl shadow-none">
          <CardContent>
            <div className="flex flex-col items-center text-center">
              <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground mb-4">
                <ArrowLeft className="mr-1 h-3 w-3" />
                Lost in context
              </span>
              <TypographyLarge>
                404
              </TypographyLarge>

              <TypographyP className="mt-2 max-w-md text-balance text-muted-foreground">
                The page you're looking for doesn't exist — or it moved. Let's get you back on track.
              </TypographyP>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button asChild size="lg">
                  <Link to="/">
                    <Home/> Go Home
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
