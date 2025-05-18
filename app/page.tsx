import { Briefcase } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className=" bg-background">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-primary" />
            <span className="text-2xl font-extrabold tracking-tight">SlipQR</span>
          </div>
          
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Welcome to <span className="text-primary">SlipQR</span>
                </h1>
              
              </div>
              <div className="flex gap-4 justify-center">
                <Link href="/login" passHref>
                  <Button size="lg" aria-label="Login">Login</Button>
                </Link>
                <Link href="/register" passHref>
                  <Button size="lg" variant="outline" aria-label="Register">Register</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} APPLICATION DEVELOPMENT.
      </footer>
    </div>
  )
}
