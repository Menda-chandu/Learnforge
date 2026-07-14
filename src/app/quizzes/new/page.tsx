"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Send, Sparkles, FileEdit, Import } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { QuizEditor, QuestionData } from "@/components/quiz-editor";
import { createQuiz } from "@/server/actions/create-quiz";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CreateQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rawText, setRawText] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [isParsed, setIsParsed] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [isNotionDialogOpen, setIsNotionDialogOpen] = useState(false);
  const [notionUrl, setNotionUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleSaveDraft = (isAuto = false) => {
    // Mock save functionality for draft
    setLastSaved(new Date());
    if (!isAuto) {
      toast.success("Draft saved successfully.");
    }
  };

  // Autosave effect (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      handleSaveDraft(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error("Please add a title before publishing.");
      return;
    }

    if (!isParsed || questions.length === 0) {
      toast.error("Please parse some questions first.");
      return;
    }

    // Validate that questions have answers
    const hasEmptyQuestions = questions.some(q => !q.question.trim());
    if (hasEmptyQuestions) {
      toast.error("Some questions are missing their text.");
      return;
    }

    try {
      setIsPublishing(true);
      await createQuiz({
        title,
        description,
        questions: questions.map(q => ({
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          marks: q.marks,
          answer: q.answer,
        })),
      });
      
      toast.success("Quiz published successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to publish quiz.");
      console.error(error);
      setIsPublishing(false);
    }
  };

  const handleParseQuiz = (textToParse?: string) => {
    const text = typeof textToParse === 'string' ? textToParse : rawText;
    if (!text.trim()) {
      toast.error("Please paste some quiz text to parse.");
      return;
    }

    // Split text by "Question \d+" or just "Question"
    const questionBlocks = text.split(/Question\s*\d+/i).filter(block => block.trim().length > 0);
    const parsedQuestions: QuestionData[] = [];

    for (const block of questionBlocks) {
      // Regex to split by options: a., b., c., d.
      // We look for patterns like "a." or "a)" at the start of a line or after spaces
      const optionARegex = /[aA][\.\)]\s*([\s\S]*?)(?=[bB][\.\)]\s*|[cC][\.\)]\s*|[dD][\.\)]\s*|$)/i;
      const optionBRegex = /[bB][\.\)]\s*([\s\S]*?)(?=[cC][\.\)]\s*|[dD][\.\)]\s*|$)/i;
      const optionCRegex = /[cC][\.\)]\s*([\s\S]*?)(?=[dD][\.\)]\s*|$)/i;
      const optionDRegex = /[dD][\.\)]\s*([\s\S]*?)$/i;

      const aMatch = block.match(optionARegex);
      const bMatch = block.match(optionBRegex);
      const cMatch = block.match(optionCRegex);
      const dMatch = block.match(optionDRegex);

      // The question text is everything before "a."
      const questionTextMatch = block.split(/[aA][\.\)]/)[0];
      const questionText = questionTextMatch ? questionTextMatch.trim() : "";

      parsedQuestions.push({
        id: crypto.randomUUID(),
        question: questionText,
        optionA: aMatch ? aMatch[1].trim() : "",
        optionB: bMatch ? bMatch[1].trim() : "",
        optionC: cMatch ? cMatch[1].trim() : "",
        optionD: dMatch ? dMatch[1].trim() : "",
        answer: null,
        marks: 10,
      });
    }

    if (parsedQuestions.length === 0) {
      toast.error("Could not parse any questions. Please check the format.");
      return;
    }

    setQuestions(parsedQuestions);
    setIsParsed(true);
    toast.success(`Successfully parsed ${parsedQuestions.length} questions.`);
  };

  const handleNotionImport = async () => {
    if (!notionUrl.trim()) {
      toast.error("Please enter a Notion URL");
      return;
    }

    // Extract page ID from URL (usually the last 32 characters or part of it)
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

      setRawText(data.text);
      setIsNotionDialogOpen(false);
      setNotionUrl("");
      toast.success("Successfully imported text from Notion! Parsing now...");
      handleParseQuiz(data.text);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <div className="text-sm text-muted-foreground">
              {lastSaved ? `Last saved at ${lastSaved.toLocaleTimeString()}` : "Not saved yet"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isParsed && (
              <Button variant="ghost" size="sm" onClick={() => setIsParsed(false)}>
                <FileEdit className="mr-2 h-4 w-4" />
                Edit Raw
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => handleSaveDraft(false)}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button size="sm" onClick={handlePublish} disabled={isPublishing}>
              <Send className="mr-2 h-4 w-4" />
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="space-y-6">
          {/* Title Input */}
          <div className="group relative">
            <Input
              type="text"
              placeholder="Quiz Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-4xl md:text-5xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto rounded-none bg-transparent placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Description Input */}
          <div className="group relative">
            <Input
              type="text"
              placeholder="Add a description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-lg md:text-xl text-muted-foreground border-none shadow-none focus-visible:ring-0 px-0 h-auto rounded-none bg-transparent placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="h-px bg-border/50 my-8 w-full" />

          {/* Content Area */}
          {!isParsed ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Raw Content
                </h2>
              </div>
              <Textarea
                placeholder="Paste quiz here...&#10;&#10;Question 1&#10;What is the capital of France?&#10;a. London&#10;b. Paris&#10;c. Rome&#10;d. Berlin"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="min-h-[300px] md:min-h-[400px] resize-y text-base p-6 bg-muted/30 border-muted focus-visible:ring-1 focus-visible:border-primary/50 shadow-inner rounded-xl font-mono leading-relaxed"
              />
              
              <div className="pt-4 flex flex-col md:flex-row items-center justify-center gap-4">
                <Button size="lg" className="w-full md:w-auto h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all" onClick={() => handleParseQuiz()}>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Parse Quiz
                </Button>
                
                <Dialog open={isNotionDialogOpen} onOpenChange={setIsNotionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="w-full md:w-auto h-14 px-8 text-lg rounded-full shadow-sm hover:shadow-md transition-all">
                      <Import className="mr-2 h-5 w-5" />
                      Import from Notion
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Import from Notion</DialogTitle>
                      <DialogDescription>
                        Paste the link to your Notion page. Make sure the page is shared with your internal integration.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 py-4">
                      <div className="grid flex-1 gap-2">
                        <Input
                          id="link"
                          placeholder="https://www.notion.so/workspace/Page-Title-1234..."
                          value={notionUrl}
                          onChange={(e) => setNotionUrl(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                      <Button type="button" onClick={handleNotionImport} disabled={isImporting}>
                        {isImporting ? "Importing..." : "Import"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Question Editor
                </h2>
                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  {questions.length} {questions.length === 1 ? "Question" : "Questions"}
                </span>
              </div>
              <QuizEditor questions={questions} onChange={setQuestions} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
