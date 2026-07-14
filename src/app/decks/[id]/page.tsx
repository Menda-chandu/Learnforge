import { auth } from "@/auth";
import { getDeck } from "@/server/actions/deck";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import FlashcardStudyClient from "./flashcard-study-client";

export default async function DeckStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const deck = await getDeck(id);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-2xl min-h-[85vh] flex flex-col">
      {/* Top Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <Link href="/decks">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{deck.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
            {deck.description || "Study session"}
          </p>
        </div>
      </div>

      {/* Main Flashcard Study Area */}
      <div className="flex-1 flex flex-col justify-center py-4">
        <FlashcardStudyClient cards={deck.cards} />
      </div>
    </div>
  );
}
