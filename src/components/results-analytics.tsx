"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, CheckCircle2, Clock } from "lucide-react";

type ResultsAnalyticsProps = {
  score: number;
  totalMarks: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
  timeTaken: number;
};

export function ResultsAnalytics({
  score,
  totalMarks,
  correct,
  wrong,
  skipped,
  accuracy,
  timeTaken,
}: ResultsAnalyticsProps) {
  const data = [
    { name: "Correct", value: correct, color: "#16a34a" }, // green-600
    { name: "Wrong", value: wrong, color: "#dc2626" },     // red-600
    { name: "Skipped", value: skipped, color: "#9ca3af" }, // gray-400
  ].filter((item) => item.value > 0);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m > 0 ? `${m}m ` : ""}${s}s`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card className="col-span-1 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Score</CardTitle>
          <Target className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {score} <span className="text-muted-foreground text-sm font-normal">/ {totalMarks}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Based on correct answers</p>
        </CardContent>
      </Card>

      <Card className="col-span-1 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{accuracy.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">Overall correctness</p>
        </CardContent>
      </Card>

      <Card className="col-span-1 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Taken</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(timeTaken)}</div>
          <p className="text-xs text-muted-foreground mt-1">Duration of attempt</p>
        </CardContent>
      </Card>

      {/* Pie Chart Card */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-1 shadow-sm flex flex-col justify-between">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-medium">Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-32 p-0 mt-2 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={45}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => [`${value} Questions`, name]}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
        <div className="flex justify-center gap-4 text-xs font-medium pb-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-600" />
            <span>{correct}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-600" />
            <span>{wrong}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span>{skipped}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
