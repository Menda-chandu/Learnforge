"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function startAttempt(quizId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Create a new attempt
  const attempt = await prisma.attempt.create({
    data: {
      userId: session.user.id,
      quizId,
    },
  });

  redirect(`/quizzes/${quizId}/attempt/${attempt.id}`);
}

export async function saveAnswer(attemptId: string, questionId: string, selected: string | null) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify attempt belongs to user and is not completed
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.userId !== session.user.id || attempt.completed) {
    throw new Error("Invalid attempt");
  }

  // Upsert the answer
  if (selected) {
    await prisma.attemptAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      create: {
        attemptId,
        questionId,
        selected,
      },
      update: {
        selected,
      },
    });
  } else {
    // Clear response if null
    await prisma.attemptAnswer.deleteMany({
      where: {
        attemptId,
        questionId,
      },
    });
  }

  return { success: true };
}

export async function submitAttempt(attemptId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

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

  if (!attempt || attempt.userId !== session.user.id) {
    throw new Error("Invalid attempt");
  }

  if (attempt.completed) {
    return { success: true, redirect: `/quizzes/${attempt.quizId}/results/${attempt.id}` };
  }

  // Calculate score
  let score = 0;
  for (const q of attempt.quiz.questions) {
    const userAnswer = attempt.answers.find((a) => a.questionId === q.id);
    if (userAnswer && userAnswer.selected === q.answer) {
      score += q.marks;
    }
  }

  await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      completed: true,
      score,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/quizzes");
  revalidatePath(`/quizzes/${attempt.quizId}`);

  return { success: true, redirect: `/quizzes/${attempt.quizId}/results/${attempt.id}` };
}
