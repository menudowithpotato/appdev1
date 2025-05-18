import { Briefcase } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background w-full">
        <div className="container flex h-16 items-center justify-start px-9 sm:px-6 lg:px-50">
          <div className="flex items-center gap-2">
            <Image src="/Logo.png" alt="SlipQR Logo" width={40} height={40} />
            <span className="text-2xl font-extrabold tracking-tight">SlipQR</span>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center w-full">
        <section className="w-full flex flex-col items-center justify-center">
          <div className="container px-4 md:px-6 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Welcome to <span className="text-primary">SlipQR</span>
                </h1>
              </div>
              <div className="flex gap-4 justify-center">
                <Link href="/login" passHref>
                  <Button size="lg" aria-label="Login">
                    Login
                  </Button>
                </Link>
                <Link href="/register" passHref>
                  <Button size="lg" variant="outline" aria-label="Register">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground w-full">
        &copy; {new Date().getFullYear()} APPLICATION DEVELOPMENT.
      </footer>
    </div>
  )
}
