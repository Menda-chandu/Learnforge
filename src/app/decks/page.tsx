import { auth } from "@/auth";
import { getDecks } from "@/server/actions/deck";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Layers, BookOpen, Trash2, ArrowRight, GraduationCap } from "lucide-react";
import { deleteDeck } from "@/server/actions/deck";

export default async function DecksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const decks = await getDecks();

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flashcard Decks</h1>
          <p className="text-muted-foreground mt-1">
            Create, manage, and study your custom learning decks.
          </p>
        </div>
        <Link href="/decks/new">
          <Button size="lg" className="shadow-sm">
            <Plus className="mr-2 h-5 w-5" />
            Create New Deck
          </Button>
        </Link>
      </div>

      {decks.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 min-h-[350px]">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No flashcard decks yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Unlock quick memory learning! Create your first deck manually or import directly from Notion.
          </p>
          <Link href="/decks/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create your first deck
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Card key={deck.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 flex-1">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-1">{deck.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {deck.description || "No description provided."}
                    </CardDescription>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {deck.cards.length} cards
                  </span>
                </div>
              </CardHeader>
              <CardFooter className="pt-3 border-t bg-muted/20 flex justify-between items-center">
                <form action={async () => {
                  "use server";
                  await deleteDeck(deck.id);
                }}>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" type="submit">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
                <Link href={`/decks/${deck.id}`}>
                  <Button size="sm" className="gap-1">
                    Study Deck <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
