import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { AchievementsList } from "@/components/profile/achievements-list";
import { ModeToggle } from "@/components/mode-toggle";
import { BookOpen, Target, Activity } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user data alongside aggregated stats
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      quizzes: true,
      attempts: {
        where: { completed: true },
        include: {
          quiz: {
            include: {
              questions: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Calculate stats
  const totalQuizzes = user.quizzes.length;
  const totalAttempts = user.attempts.length;
  
  let totalScore = 0;
  let totalMaxScore = 0;
  let hasPerfectScore = false;

  user.attempts.forEach((attempt) => {
    totalScore += attempt.score;
    let attemptMax = 0;
    attempt.quiz.questions.forEach((q) => { attemptMax += q.marks; });
    totalMaxScore += attemptMax;

    if (attempt.score === attemptMax && attemptMax > 0) {
      hasPerfectScore = true;
    }
  });

  const averageScore = totalAttempts > 0 && totalMaxScore > 0
    ? ((totalScore / totalMaxScore) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground font-medium">Appearance:</span>
          <ModeToggle />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: User Info */}
        <Card className="md:col-span-1 shadow-md h-fit border-t-4 border-t-primary">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4 pt-8">
            <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1 w-full">
              <h2 className="text-2xl font-bold truncate">{user.name}</h2>
              <p className="text-muted-foreground truncate">{user.email}</p>
            </div>

            <div className="w-full pt-4 border-t flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Joined</span>
                <span className="font-medium text-foreground">
                  {format(user.createdAt, "MMMM d, yyyy")}
                </span>
              </div>
            </div>

            <div className="w-full pt-4 border-t flex justify-center">
              <EditProfileForm currentName={user.name || ""} />
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Stats & Achievements */}
        <div className="md:col-span-2 space-y-8">
          {/* Stats Row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="shadow-sm">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold">{totalQuizzes}</h3>
                  <p className="text-sm text-muted-foreground font-medium">Quizzes Created</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-full dark:bg-orange-900/20 dark:text-orange-400">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold">{totalAttempts}</h3>
                  <p className="text-sm text-muted-foreground font-medium">Total Attempts</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-3 bg-green-50 text-green-600 rounded-full dark:bg-green-900/20 dark:text-green-400">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold">{averageScore}%</h3>
                  <p className="text-sm text-muted-foreground font-medium">Average Score</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card className="shadow-md">
            <CardContent className="p-6">
              <AchievementsList 
                totalQuizzes={totalQuizzes}
                totalAttempts={totalAttempts}
                hasPerfectScore={hasPerfectScore}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
