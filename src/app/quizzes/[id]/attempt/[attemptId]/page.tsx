import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { QuizAttemptClient } from "@/components/quiz-attempt-client";

type QuizAttemptPageProps = {
  params: Promise<{ id: string; attemptId: string }>;
};

export default async function QuizAttemptPage({ params }: QuizAttemptPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id, attemptId } = await params;

  // Fetch the attempt and ensure it belongs to the user and is not completed
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: true,
      quiz: {
        include: {
          questions: {
            select: {
              id: true,
              question: true,
              optionA: true,
              optionB: true,
              optionC: true,
              optionD: true,
              marks: true,
              // Intentionally NOT selecting `answer` so it's not sent to the client
            },
          },
        },
      },
    },
  });

  if (!attempt || attempt.userId !== session.user.id || attempt.quizId !== id) {
    notFound();
  }

  if (attempt.completed) {
    // If they somehow navigate back to a completed attempt, just redirect to dashboard for now
    // Later we can redirect to a results page
    redirect("/dashboard");
  }

  // Format initial answers from DB
  const initialAnswers: Record<string, string> = {};
  attempt.answers.forEach((ans) => {
    if (ans.selected) {
      initialAnswers[ans.questionId] = ans.selected;
    }
  });

  // Default timer duration (30 mins = 1800 seconds)
  // Calculate remaining time based on when the attempt was created
  const DURATION_SECONDS = 30 * 60;
  const elapsedSeconds = Math.floor((Date.now() - attempt.createdAt.getTime()) / 1000);
  const remainingSeconds = Math.max(0, DURATION_SECONDS - elapsedSeconds);

  if (remainingSeconds === 0) {
    // Timer expired while they were away, but not marked completed yet
    // The client will handle auto-submitting if we render with 0, or we could submit here
  }

  return (
    <QuizAttemptClient
      attemptId={attempt.id}
      quizTitle={attempt.quiz.title}
      questions={attempt.quiz.questions}
      initialAnswers={initialAnswers}
      initialTimeLeft={remainingSeconds}
    />
  );
}
