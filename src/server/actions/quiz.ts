"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteQuiz(quizId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Ensure user owns the quiz
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { createdBy: true },
  });

  if (!quiz || quiz.createdBy !== session.user.id) {
    throw new Error("Quiz not found or unauthorized");
  }

  await prisma.quiz.delete({
    where: { id: quizId },
  });

  revalidatePath("/quizzes");
  revalidatePath("/dashboard");
}

export async function duplicateQuiz(quizId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Fetch the original quiz with its questions
  const originalQuiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!originalQuiz || originalQuiz.createdBy !== session.user.id) {
    throw new Error("Quiz not found or unauthorized");
  }

  // Create a new quiz with copied data
  await prisma.quiz.create({
    data: {
      title: `${originalQuiz.title} (Copy)`,
      description: originalQuiz.description,
      published: false,
      createdBy: session.user.id,
      questions: {
        create: originalQuiz.questions.map((q) => ({
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          marks: q.marks,
          answer: q.answer,
        })),
      },
    },
  });

  revalidatePath("/quizzes");
  revalidatePath("/dashboard");
}
