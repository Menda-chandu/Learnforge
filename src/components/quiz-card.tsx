"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Eye, MoreVertical, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteQuiz, duplicateQuiz } from "@/server/actions/quiz";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

type QuizCardProps = {
  quiz: {
    id: string;
    title: string;
    published: boolean;
    createdAt: Date;
    _count: {
      questions: number;
      attempts: number;
    };
  };
};

export function QuizCard({ quiz }: QuizCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteQuiz(quiz.id);
      toast.success("Quiz deleted successfully");
    } catch (error) {
      toast.error("Failed to delete quiz");
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setIsDuplicating(true);
      await duplicateQuiz(quiz.id);
      toast.success("Quiz duplicated successfully");
    } catch (error) {
      toast.error("Failed to duplicate quiz");
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold line-clamp-1" title={quiz.title}>
            {quiz.title}
          </CardTitle>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{formatDistanceToNow(new Date(quiz.createdAt), { addSuffix: true })}</span>
            <span>•</span>
            <span
              className={
                quiz.published
                  ? "text-green-600 dark:text-green-400 font-medium"
                  : "text-yellow-600 dark:text-yellow-400 font-medium"
              }
            >
              {quiz.published ? "Published" : "Draft"}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 -mr-2">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push(`/quizzes/${quiz.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/quizzes/${quiz.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{quiz._count.questions}</span>
            <span>Questions</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{quiz._count.attempts}</span>
            <span>Attempts</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 border-t pt-4">
        <Link href={`/quizzes/${quiz.id}`} className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-8 gap-1.5 px-2.5 w-full">
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Link>
        <Link href={`/quizzes/${quiz.id}/edit`} className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-primary text-primary-foreground hover:bg-primary/80 h-8 gap-1.5 px-2.5 w-full">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </CardFooter>
    </Card>
  );
}
