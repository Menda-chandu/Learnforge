import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create a sample user
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const user = await prisma.user.upsert({
    where: { email: "admin@learnforge.com" },
    update: {},
    create: {
      email: "admin@learnforge.com",
      name: "Admin User",
      password: hashedPassword,
    },
  });

  // Create a sample quiz
  const quiz = await prisma.quiz.create({
    data: {
      title: "General Knowledge Quiz",
      description: "Test your general knowledge with these basic questions.",
      published: true,
      createdBy: user.id,
      questions: {
        create: [
          {
            question: "What is the capital of France?",
            optionA: "London",
            optionB: "Berlin",
            optionC: "Paris",
            optionD: "Madrid",
            marks: 10,
            answer: "C",
          },
          {
            question: "Which planet is known as the Red Planet?",
            optionA: "Mars",
            optionB: "Venus",
            optionC: "Jupiter",
            optionD: "Saturn",
            marks: 10,
            answer: "A",
          },
          {
            question: "Who wrote 'Romeo and Juliet'?",
            optionA: "Charles Dickens",
            optionB: "William Shakespeare",
            optionC: "Jane Austen",
            optionD: "Mark Twain",
            marks: 10,
            answer: "B",
          }
        ]
      }
    }
  });

  console.log({ user, quiz });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
