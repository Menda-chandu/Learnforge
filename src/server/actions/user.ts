"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string }) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!data.name || data.name.trim().length === 0) {
    throw new Error("Name is required");
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: data.name.trim() },
    });

    revalidatePath("/profile");
    return { success: true, user };
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw new Error("Failed to update profile");
  }
}
