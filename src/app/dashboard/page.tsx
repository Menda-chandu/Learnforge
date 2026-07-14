import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Users, Trophy, Activity, ArrowRight, Layers, GraduationCap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch quizzes
  const quizzes = await prisma.quiz.findMany({
    where: {
      createdBy: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const totalQuizzes = await prisma.quiz.count({
    where: {
      createdBy: session.user.id,
    },
  });

  // Fetch decks
  const decks = await prisma.deck.findMany({
    where: {
      createdBy: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      cards: true,
    },
    take: 5,
  });

  const totalDecks = await prisma.deck.count({
    where: {
      createdBy: session.user.id,
    },
  });

  // Calculate total flashcards across decks
  const totalCardsCount = decks.reduce((acc, deck) => acc + deck.cards.length, 0);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session.user.name?.split(" ")[0] || "User"}! Here&apos;s an overview of your Learnforge workspace.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/quizzes/new">
            <Button size="lg" className="shadow-sm">
              <Plus className="mr-2 h-5 w-5" />
              Create Quiz
            </Button>
          </Link>
          <Link href="/decks/new">
            <Button size="lg" variant="outline" className="shadow-sm">
              <Plus className="mr-2 h-5 w-5" />
              Create Deck
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuizzes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Interactive assessments created
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Decks</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDecks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Flashcard study sets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flashcards</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCardsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Questions prepared for study
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quizzes.length > 0 || decks.length > 0 ? "Active" : "None"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {quizzes.length > 0
                ? `Last quiz ${formatDistanceToNow(quizzes[0].updatedAt, { addSuffix: true })}`
                : decks.length > 0
                ? `Last deck ${formatDistanceToNow(decks[0].updatedAt, { addSuffix: true })}`
                : "No recent activity"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout for Lists */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quizzes Column */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold tracking-tight">Recent Quizzes</h2>
            <Link href="/quizzes" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          {quizzes.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed border-2 min-h-[250px]">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-1">No quizzes yet</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-xs">
                Create structured quizzes to test your knowledge or export directly from Notion.
              </p>
              <Link href="/quizzes/new">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create first quiz
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium max-w-[150px] truncate">{quiz.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(quiz.createdAt, { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/quizzes/${quiz.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            View <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Flashcards Column */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold tracking-tight">Recent Decks</h2>
            <Link href="/decks" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          {decks.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed border-2 min-h-[250px]">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-1">No decks yet</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-xs">
                Create flashcard decks for quick review. You can also import from Notion!
              </p>
              <Link href="/decks/new">
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create first deck
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Cards</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {decks.map((deck) => (
                    <TableRow key={deck.id}>
                      <TableCell className="font-medium max-w-[150px] truncate">{deck.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {deck.cards.length} cards
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/decks/${deck.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            Study <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
