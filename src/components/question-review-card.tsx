import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";

type QuestionReviewCardProps = {
  index: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: string | null;
  userAnswer: string | null;
  marks: number;
};

export function QuestionReviewCard({
  index,
  question,
  options,
  correctAnswer,
  userAnswer,
  marks,
}: QuestionReviewCardProps) {
  const isCorrect = userAnswer === correctAnswer;
  const isSkipped = !userAnswer;
  const isWrong = !isSkipped && !isCorrect;

  return (
    <Card className={`overflow-hidden border-l-4 ${
      isCorrect ? "border-l-green-500" : isSkipped ? "border-l-gray-400" : "border-l-red-500"
    }`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4 pb-4 border-b">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold">Question {index + 1}</h3>
            {isCorrect && (
              <div className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" /> Correct
              </div>
            )}
            {isWrong && (
              <div className="flex items-center gap-1 text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md dark:bg-red-900/20 dark:text-red-400">
                <XCircle className="w-4 h-4" /> Incorrect
              </div>
            )}
            {isSkipped && (
              <div className="flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md dark:bg-gray-800 dark:text-gray-400">
                <MinusCircle className="w-4 h-4" /> Skipped
              </div>
            )}
          </div>
          <div className="text-sm font-medium bg-muted px-3 py-1 rounded-full">
            {isCorrect ? marks : 0} / {marks} Marks
          </div>
        </div>
        
        <div className="text-lg mb-6 whitespace-pre-wrap font-medium">
          {question}
        </div>

        <div className="space-y-3">
          {(["A", "B", "C", "D"] as const).map((opt) => {
            const val = options[opt];
            
            // Logic for highlighting
            const isThisCorrect = opt === correctAnswer;
            const isThisSelected = opt === userAnswer;
            
            let containerClass = "border-muted bg-background";
            let iconClass = "border-muted-foreground text-muted-foreground";
            
            if (isThisCorrect) {
              containerClass = "border-green-500 bg-green-50/50 dark:bg-green-900/10 ring-1 ring-green-500/50";
              iconClass = "border-green-500 bg-green-500 text-white";
            } else if (isThisSelected && !isThisCorrect) {
              containerClass = "border-red-500 bg-red-50/50 dark:bg-red-900/10 ring-1 ring-red-500/50";
              iconClass = "border-red-500 bg-red-500 text-white";
            } else if (isThisSelected && isThisCorrect) {
               // Already handled by isThisCorrect, but just to be explicit
               containerClass = "border-green-500 bg-green-50/50 dark:bg-green-900/10 ring-1 ring-green-500/50";
               iconClass = "border-green-500 bg-green-500 text-white";
            }

            return (
              <div
                key={opt}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${containerClass}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold ${iconClass}`}>
                    {opt}
                  </div>
                  <span className="text-base">{val}</span>
                  
                  {/* Indicators for screen readers or extra visual clarity */}
                  <div className="ml-auto flex items-center gap-2">
                    {isThisSelected && <span className="text-xs font-medium px-2 py-1 bg-background rounded-md shadow-sm border">Your Answer</span>}
                    {isThisCorrect && !isThisSelected && <span className="text-xs font-medium px-2 py-1 bg-background rounded-md shadow-sm border text-green-600">Correct Answer</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
