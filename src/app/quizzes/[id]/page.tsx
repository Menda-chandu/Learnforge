import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { startAttempt } from "@/server/actions/attempt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, FileQuestion, Play } from "lucide-react";
import Link from "next/link";

type QuizInstructionsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuizInstructionsPage({ params }: QuizInstructionsPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      _count: {
        select: { questions: true },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  // Handle the start action
  const handleStart = async () => {
    "use server";
    await startAttempt(id);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <div className="w-full mb-6">
        <Link href="/dashboard" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 h-8 gap-1.5 px-2.5 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <Card className="w-full max-w-2xl shadow-lg border-2">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-2">
            <FileQuestion className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">
            {quiz.title}
          </CardTitle>
          {quiz.description && (
            <CardDescription className="text-lg">
              {quiz.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-4 bg-muted/50 rounded-lg border">
              <FileQuestion className="h-6 w-6 text-muted-foreground mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Questions</p>
                <p className="text-2xl font-bold">{quiz._count.questions}</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-muted/50 rounded-lg border">
              <Clock className="h-6 w-6 text-muted-foreground mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Limit</p>
                <p className="text-2xl font-bold">30 Minutes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
            <h4 className="font-semibold mb-1">Instructions:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Once you start, the timer will begin automatically.</li>
              <li>You can navigate freely between questions.</li>
              <li>Your answers are saved automatically.</li>
              <li>Do not refresh or close the tab, or you may lose your progress.</li>
              <li>The quiz will automatically submit when the timer expires.</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-6 pb-8">
          <form action={handleStart} className="w-full max-w-sm">
            <Button size="lg" className="w-full text-lg h-14 rounded-full" type="submit">
              <Play className="mr-2 h-5 w-5" />
              Start Quiz
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
