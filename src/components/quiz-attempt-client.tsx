"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ChevronLeft, ChevronRight, Flag, X, Send } from "lucide-react";
import { saveAnswer, submitAttempt } from "@/server/actions/attempt";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type QuestionPayload = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  marks: number;
};

type QuizAttemptClientProps = {
  attemptId: string;
  quizTitle: string;
  questions: QuestionPayload[];
  initialAnswers: Record<string, string>;
  initialTimeLeft: number;
};

export function QuizAttemptClient({
  attemptId,
  quizTitle,
  questions,
  initialAnswers,
  initialTimeLeft,
}: QuizAttemptClientProps) {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [reviewStatus, setReviewStatus] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set([questions[0]?.id]));
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Autosave tracking
  const lastSavedAnswers = useRef<Record<string, string>>(initialAnswers);

  const currentQuestion = questions[currentIndex];

  // Prevent leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have an active quiz attempt. Are you sure you want to leave?";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (timeLeft > 0) {
      const confirm = window.confirm("Are you sure you want to submit your attempt?");
      if (!confirm) return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitAttempt(attemptId);
      if (res.redirect) {
        toast.success("Quiz submitted successfully!");
        router.push(res.redirect);
      }
    } catch {
      toast.error("Failed to submit quiz.");
      setIsSubmitting(false);
    }
  };

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      if (!isSubmitting) {
        toast.info("Time is up! Submitting automatically...");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        handleSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isSubmitting]);

  // Autosave
  useEffect(() => {
    const currentAns = answers[currentQuestion.id];
    const prevAns = lastSavedAnswers.current[currentQuestion.id];

    if (currentAns !== prevAns) {
      setIsSaving(true);
      
      const timeoutId = setTimeout(async () => {
        try {
          await saveAnswer(attemptId, currentQuestion.id, currentAns || null);
          lastSavedAnswers.current = { ...lastSavedAnswers.current, [currentQuestion.id]: currentAns };
        } catch {
          toast.error("Failed to save answer for Q" + (currentIndex + 1));
        } finally {
          setIsSaving(false);
        }
      }, 1000); // 1 second debounce

      return () => clearTimeout(timeoutId);
    }
  }, [answers, currentQuestion.id, attemptId, currentIndex]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleOptionSelect = (option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleClearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentQuestion.id];
    setAnswers(newAnswers);
  };

  const handleMarkForReview = () => {
    setReviewStatus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const jumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    setVisited((prev) => new Set(prev).add(questions[index].id));
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      jumpToQuestion(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      jumpToQuestion(currentIndex - 1);
    }
  };



  const getQuestionStatusColor = (index: number) => {
    const qId = questions[index].id;
    if (reviewStatus.has(qId)) return "bg-yellow-500 hover:bg-yellow-600 text-white"; // Yellow
    if (answers[qId]) return "bg-green-600 hover:bg-green-700 text-white"; // Green
    if (visited.has(qId)) return "bg-red-500 hover:bg-red-600 text-white"; // Red
    return "bg-muted hover:bg-muted/80 text-foreground"; // Gray
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
          <h1 className="font-semibold text-lg md:text-xl truncate max-w-[200px] md:max-w-md">
            {quizTitle}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm font-medium">
              {isSaving ? (
                <span className="text-muted-foreground mr-4 animate-pulse">Saving...</span>
              ) : (
                <span className="text-muted-foreground mr-4">Saved</span>
              )}
            </div>
            <div className={`flex items-center gap-2 font-mono text-xl ${timeLeft < 300 ? 'text-destructive font-bold' : ''}`}>
              <Clock className="h-5 w-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl flex flex-col lg:flex-row gap-6">
        
        {/* Question Area */}
        <div className="flex-1 flex flex-col gap-6">
          <Card className="flex-1 shadow-md border-t-4 border-t-primary">
            <CardContent className="p-6 md:p-8 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6 pb-6 border-b">
                <h2 className="text-2xl font-bold">Question {currentIndex + 1}</h2>
                <div className="text-sm font-medium bg-muted px-3 py-1 rounded-full">
                  Marks: {currentQuestion.marks}
                </div>
              </div>
              
              <div className="text-lg mb-8 whitespace-pre-wrap font-medium">
                {currentQuestion.question}
              </div>

              <div className="space-y-4 flex-1">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const val = currentQuestion[`option${opt}`];
                  const isSelected = answers[currentQuestion.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleOptionSelect(opt)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm" 
                          : "border-muted hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                          isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground text-muted-foreground"
                        }`}>
                          {opt}
                        </div>
                        <span className="text-base">{val}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="w-24"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                onClick={goNext}
                disabled={currentIndex === questions.length - 1}
                className="w-24"
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-900 dark:text-yellow-400"
                onClick={handleMarkForReview}
              >
                <Flag className={`mr-2 h-4 w-4 ${reviewStatus.has(currentQuestion.id) ? "fill-current" : ""}`} />
                {reviewStatus.has(currentQuestion.id) ? "Unmark Review" : "Mark for Review"}
              </Button>
              <Button
                variant="outline"
                onClick={handleClearResponse}
                disabled={!answers[currentQuestion.id]}
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Right Palette */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
          <Card className="shadow-md sticky top-24">
            <CardContent className="p-4 md:p-6">
              <h3 className="font-semibold text-lg mb-4 pb-2 border-b">Question Palette</h3>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2 mb-6">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(idx)}
                    className={`h-10 rounded-md text-sm font-bold flex items-center justify-center transition-colors ${
                      currentIndex === idx ? "ring-2 ring-primary ring-offset-2" : ""
                    } ${getQuestionStatusColor(idx)}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <div className="space-y-3 text-sm border-t pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-sm bg-green-600" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-sm bg-red-500" />
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-sm bg-yellow-500" />
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-sm bg-muted" />
                  <span>Not Visited</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg shadow-lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Send className="mr-2 h-5 w-5" />
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        </div>
      </main>
    </div>
  );
}
