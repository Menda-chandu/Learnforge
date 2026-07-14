"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Plus, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export type QuestionData = {
  id: string; // unique for drag/drop
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string | null;
  marks: number;
};

type QuizEditorProps = {
  questions: QuestionData[];
  onChange: (questions: QuestionData[]) => void;
};

export function QuizEditor({ questions, onChange }: QuizEditorProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  const updateQuestion = (index: number, field: keyof QuestionData, value: string | number) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    onChange(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    onChange(newQuestions);
  };

  const duplicateQuestion = (index: number) => {
    const q = questions[index];
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, {
      ...q,
      id: crypto.randomUUID(),
    });
    onChange(newQuestions);
  };

  const addNewQuestion = () => {
    onChange([
      ...questions,
      {
        id: crypto.randomUUID(),
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        answer: null,
        marks: 10,
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {questions.map((q, index) => (
                <Draggable key={q.id} draggableId={q.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`relative bg-card ${
                        snapshot.isDragging ? "shadow-xl ring-1 ring-primary/20 scale-[1.01]" : ""
                      }`}
                    >
                      {/* Drag Handle */}
                      <div
                        {...provided.dragHandleProps}
                        className="absolute left-2 top-0 bottom-0 flex items-center justify-center w-8 cursor-grab hover:bg-muted/50 rounded-l-lg transition-colors"
                      >
                        <GripVertical className="h-5 w-5 text-muted-foreground/50" />
                      </div>

                      <CardContent className="pl-12 pt-6 pb-6">
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">Question {index + 1}</h3>
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-muted-foreground">Marks:</label>
                                <Input
                                  type="number"
                                  value={q.marks}
                                  onChange={(e) =>
                                    updateQuestion(index, "marks", parseInt(e.target.value) || 0)
                                  }
                                  className="w-20 h-8"
                                />
                              </div>
                            </div>
                            
                            <Textarea
                              value={q.question}
                              onChange={(e) => updateQuestion(index, "question", e.target.value)}
                              placeholder="Enter your question here..."
                              className="min-h-[80px] resize-y text-base font-medium"
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-muted-foreground w-6 text-center bg-muted rounded-md py-1">A</span>
                                <Input
                                  value={q.optionA}
                                  onChange={(e) => updateQuestion(index, "optionA", e.target.value)}
                                  placeholder="Option A"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-muted-foreground w-6 text-center bg-muted rounded-md py-1">B</span>
                                <Input
                                  value={q.optionB}
                                  onChange={(e) => updateQuestion(index, "optionB", e.target.value)}
                                  placeholder="Option B"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-muted-foreground w-6 text-center bg-muted rounded-md py-1">C</span>
                                <Input
                                  value={q.optionC}
                                  onChange={(e) => updateQuestion(index, "optionC", e.target.value)}
                                  placeholder="Option C"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-muted-foreground w-6 text-center bg-muted rounded-md py-1">D</span>
                                <Input
                                  value={q.optionD}
                                  onChange={(e) => updateQuestion(index, "optionD", e.target.value)}
                                  placeholder="Option D"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                              <span className="font-medium text-sm">Correct Answer:</span>
                              <select
                                value={q.answer || ""}
                                onChange={(e) => updateQuestion(index, "answer", e.target.value)}
                                className="flex h-9 w-[120px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="" disabled>Select...</option>
                                <option value="A">Option A</option>
                                <option value="B">Option B</option>
                                <option value="C">Option C</option>
                                <option value="D">Option D</option>
                              </select>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => duplicateQuestion(index)}
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => deleteQuestion(index)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button
        variant="outline"
        className="w-full h-12 border-dashed border-2 hover:bg-muted/50 transition-colors"
        onClick={addNewQuestion}
      >
        <Plus className="mr-2 h-5 w-5" />
        Add New Question
      </Button>
    </div>
  );
}
