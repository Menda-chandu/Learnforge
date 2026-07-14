"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLinks() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/quizzes", label: "Quizzes" },
    { href: "/decks", label: "Flashcards" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === link.href ? "text-foreground" : "text-foreground/60"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
