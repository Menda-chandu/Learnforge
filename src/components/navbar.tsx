import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { BookOpen } from "lucide-react";
import { auth } from "@/auth";
import { UserNav } from "./user-nav";
import { NavLinks } from "./nav-links";
import { Button } from "./ui/button";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>QuizForge</span>
          </Link>
          {session?.user && <NavLinks />}
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {session?.user ? (
            <UserNav user={session.user} />
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
