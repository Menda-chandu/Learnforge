"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Import, Sparkles, Save, Layers } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createDeck } from "@/server/actions/deck";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type FlashcardItem = {
  front: string;
  back: string;
};

export default function NewDeckPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState<FlashcardItem[]>([{ front: "", back: "" }]);
  
  // Notion Integration states
  const [isNotionDialogOpen, setIsNotionDialogOpen] = useState(false);
  const [notionUrl, setNotionUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addCard = () => {
    setCards([...cards, { front: "", back: "" }]);
  };

  const removeCard = (index: number) => {
    if (cards.length === 1) {
      toast.error("You must have at least one card in the deck.");
      return;
    }
    setCards(cards.filter((_, i) => i !== index));
  };

  const updateCard = (index: number, field: "front" | "back", value: string) => {
    const updated = [...cards];
    updated[index][field] = value;
    setCards(updated);
  };

  const parseNotionTextToCards = (text: string) => {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const parsedCards: FlashcardItem[] = [];
    
    let currentFront = "";
    for (const line of lines) {
      if (line.toLowerCase().startsWith("q:") || line.toLowerCase().startsWith("front:")) {
        currentFront = line.replace(/^(q:|front:)\s*/i, "");
      } else if (line.toLowerCase().startsWith("a:") || line.toLowerCase().startsWith("back:")) {
        const back = line.replace(/^(a:|back:)\s*/i, "");
        if (currentFront) {
          parsedCards.push({ front: currentFront, back });
          currentFront = "";
        }
      } else if (line.includes(" - ")) {
        const [front, back] = line.split(" - ");
        parsedCards.push({ front: front.trim(), back: back.trim() });
      } else if (line.includes(" : ")) {
        const [front, back] = line.split(" : ");
        parsedCards.push({ front: front.trim(), back: back.trim() });
      } else {
        if (!currentFront) {
          currentFront = line;
        } else {
          parsedCards.push({ front: currentFront, back: line });
          currentFront = "";
        }
      }
    }
    return parsedCards.length > 0 ? parsedCards : [{ front: "", back: "" }];
  };

  const handleNotionImport = async () => {
    if (!notionUrl.trim()) {
      toast.error("Please enter a Notion URL");
      return;
    }

    const matches = notionUrl.match(/[a-f0-9]{32}/i);
    let pageId = matches ? matches[0] : null;

    if (!pageId && notionUrl.length === 32) {
      pageId = notionUrl;
    }

    if (!pageId) {
      toast.error("Could not extract Page ID from the URL. Ensure it's a valid Notion page link.");
      return;
    }

    try {
      setIsImporting(true);
      const res = await fetch("/api/notion/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to import from Notion");
      }

      const parsed = parseNotionTextToCards(data.text);
      setCards(parsed);
      setIsNotionDialogOpen(false);
      setNotionUrl("");
      toast.success(`Successfully imported and parsed ${parsed.length} flashcards from Notion!`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSaveDeck = async () => {
    if (!title.trim()) {
      toast.error("Deck title is required.");
      return;
    }

    // Filter out blank cards
    const validCards = cards.filter(c => c.front.trim() && c.back.trim());
    if (validCards.length === 0) {
      toast.error("Please add at least one complete card (front and back).");
      return;
    }

    try {
      setIsSubmitting(true);
      const deckId = await createDeck({
        title,
        description,
        cards: validCards,
      });
      toast.success("Flashcard deck saved successfully!");
      router.push(`/decks/${deckId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to save flashcard deck.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <Link href="/decks">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Flashcard Deck</h1>
            <p className="text-muted-foreground mt-1">
              Add flashcards manually or import your notes from Notion.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Dialog open={isNotionDialogOpen} onOpenChange={setIsNotionDialogOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" className="gap-2">
                  <Import className="h-4 w-4" />
                  Import from Notion
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Import Decks from Notion</DialogTitle>
                <DialogDescription>
                  Paste the URL of your Notion Page. Ensure the page is shared with your integration.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2 py-4">
                <Input
                  id="link"
                  placeholder="https://www.notion.so/workspace/Page-Title-1234..."
                  value={notionUrl}
                  onChange={(e) => setNotionUrl(e.target.value)}
                />
              </div>
              <DialogFooter className="sm:justify-start">
                <Button type="button" onClick={handleNotionImport} disabled={isImporting}>
                  {isImporting ? "Importing..." : "Import & Parse"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSaveDeck} disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            Save Deck
          </Button>
        </div>
      </div>

      {/* Title & Description Card */}
      <Card>
        <CardHeader>
          <CardTitle>Deck Details</CardTitle>
          <CardDescription>Give your flashcard deck a title and description.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="title">Title</label>
            <Input
              id="title"
              placeholder="e.g. World History, Javascript Interview Prep"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="description">Description</label>
            <Textarea
              id="description"
              placeholder="Provide a brief summary of what this deck covers."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cards List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight">Flashcards ({cards.length})</h2>
          <Button variant="outline" size="sm" onClick={addCard} className="gap-1">
            <Plus className="h-4 w-4" />
            Add Card
          </Button>
        </div>

        <div className="space-y-4">
          {cards.map((card, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-6 pt-8 sm:pt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Front (Question/Term)</span>
                  <Textarea
                    placeholder="Enter the front side content..."
                    value={card.front}
                    onChange={(e) => updateCard(index, "front", e.target.value)}
                    className="min-h-[100px] resize-y"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Back (Answer/Definition)</span>
                  <Textarea
                    placeholder="Enter the back side content..."
                    value={card.back}
                    onChange={(e) => updateCard(index, "back", e.target.value)}
                    className="min-h-[100px] resize-y"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 rounded-full"
                  onClick={() => removeCard(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button size="lg" className="w-full sm:w-auto min-w-[200px]" onClick={addCard}>
            <Plus className="mr-2 h-5 w-5" />
            Add Another Card
          </Button>
        </div>
      </div>
    </div>
  );
}
