"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CreateDeckInput = {
  title: string;
  description?: string;
  cards: {
    front: string;
    back: string;
  }[];
};

export async function createDeck(data: CreateDeckInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { title, description, cards } = data;

  if (!title) {
    throw new Error("Deck title is required");
  }

  if (!cards || cards.length === 0) {
    throw new Error("At least one flashcard is required");
  }

  const deck = await prisma.deck.create({
    data: {
      title,
      description,
      createdBy: session.user.id,
      cards: {
        create: cards.map((c) => ({
          front: c.front,
          back: c.back,
        })),
      },
    },
  });

  revalidatePath("/decks");
  revalidatePath("/dashboard");

  return deck.id;
}

export async function getDecks() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return prisma.deck.findMany({
    where: {
      createdBy: session.user.id,
    },
    include: {
      cards: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getDeck(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const deck = await prisma.deck.findUnique({
    where: {
      id,
    },
    include: {
      cards: true,
    },
  });

  if (!deck) {
    throw new Error("Deck not found");
  }

  if (deck.createdBy !== session.user.id) {
    throw new Error("Unauthorized access to deck");
  }

  return deck;
}

export async function deleteDeck(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const deck = await prisma.deck.findUnique({
    where: { id },
  });

  if (!deck) {
    throw new Error("Deck not found");
  }

  if (deck.createdBy !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.deck.delete({
    where: { id },
  });

  revalidatePath("/decks");
  revalidatePath("/dashboard");

  return true;
}
