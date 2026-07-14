import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ResultsAnalytics } from "@/components/results-analytics";
import { QuestionReviewCard } from "@/components/question-review-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type QuizResultsPageProps = {
  params: Promise<{ id: string; attemptId: string }>;
};

export default async function QuizResultsPage({ params }: QuizResultsPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id, attemptId } = await params;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: true,
      quiz: {
        include: {
          questions: true,
        },
      },
    },
  });

  if (!attempt || attempt.userId !== session.user.id || attempt.quizId !== id) {
    notFound();
  }

  if (!attempt.completed) {
    // If not completed, redirect them back to the active attempt
    redirect(`/quizzes/${id}/attempt/${attempt.id}`);
  }

  const totalQuestions = attempt.quiz.questions.length;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  let totalMarks = 0;

  attempt.quiz.questions.forEach((q) => {
    totalMarks += q.marks;
    const userAnswer = attempt.answers.find((a) => a.questionId === q.id);
    
    if (!userAnswer || !userAnswer.selected) {
      skipped++;
    } else if (userAnswer.selected === q.answer) {
      correct++;
    } else {
      wrong++;
    }
  });

  const accuracy = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
  
  // Approximate time taken based on when the attempt was updated (submitted) vs created
  // In a real app with strict timers, you might save the exact duration.
  const timeTakenSeconds = Math.floor((attempt.updatedAt.getTime() - attempt.createdAt.getTime()) / 1000);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Results</h1>
          <p className="text-muted-foreground mt-1 text-lg">{attempt.quiz.title}</p>
        </div>
        <Link href="/dashboard" className="inline-flex shrink-0 items-center justify-center rounded-lg border text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-9 gap-1.5 px-2.5">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <ResultsAnalytics
        score={attempt.score}
        totalMarks={totalMarks}
        correct={correct}
        wrong={wrong}
        skipped={skipped}
        accuracy={accuracy}
        timeTaken={timeTakenSeconds}
      />

      <div className="space-y-6 pt-4">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Detailed Review</h2>
        {attempt.quiz.questions.map((q, index) => {
          const userAnswer = attempt.answers.find((a) => a.questionId === q.id)?.selected || null;
          
          return (
            <QuestionReviewCard
              key={q.id}
              index={index}
              question={q.question}
              options={{
                A: q.optionA,
                B: q.optionB,
                C: q.optionC,
                D: q.optionD,
              }}
              correctAnswer={q.answer}
              userAnswer={userAnswer}
              marks={q.marks}
            />
          );
        })}
      </div>
    </div>
  );
}
