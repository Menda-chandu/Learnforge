"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CreateQuizInput = {
  title: string;
  description: string;
  questions: {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    marks: number;
    answer: string | null;
  }[];
};

export async function createQuiz(data: CreateQuizInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { title, description, questions } = data;

  if (!title) {
    throw new Error("Quiz title is required");
  }

  const quiz = await prisma.quiz.create({
    data: {
      title,
      description,
      published: true, // We'll assume publish sets it to true, we can adjust if needed
      createdBy: session.user.id,
      questions: {
        create: questions.map((q) => ({
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

  return quiz.id;
}
