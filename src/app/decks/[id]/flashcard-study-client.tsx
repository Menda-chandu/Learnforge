"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RotateCw, Check, X, RefreshCw, Layers, ArrowLeft } from "lucide-react";
import Link from "next/link";

type CardData = {
  id: string;
  front: string;
  back: string;
};

export default function FlashcardStudyClient({ cards }: { cards: CardData[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!cards || cards.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
        <Layers className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No cards in this deck</h3>
        <p className="text-muted-foreground mt-2 mb-6">
          Add some cards to start studying.
        </p>
        <Link href="/decks">
          <Button>Back to Decks</Button>
        </Link>
      </Card>
    );
  }

  const currentCard = cards[currentIndex];
  const progressPercent = ((currentIndex) / cards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (gotIt: boolean) => {
    if (gotIt) {
      setCorrectCount(prev => prev + 1);
    } else {
      setIncorrectCount(prev => prev + 1);
    }

    setIsFlipped(false);
    
    // Allow animation to reset back to front side before changing cards
    setTimeout(() => {
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 150);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const total = cards.length;
    const accuracy = Math.round((correctCount / total) * 100);

    return (
      <Card className="p-8 text-center max-w-md mx-auto space-y-6 shadow-lg border-2">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
            <Layers className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold">Deck Completed!</h2>
          <p className="text-muted-foreground">Great job studying your cards.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="bg-muted/40 p-4 rounded-xl">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{correctCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Got It</div>
          </div>
          <div className="bg-muted/40 p-4 rounded-xl">
            <div className="text-2xl font-bold text-destructive">{incorrectCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Study Again</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold">Mastery Score</div>
          <div className="text-3xl font-extrabold text-primary">{accuracy}%</div>
          <Progress value={accuracy} className="h-2 w-full mt-2" />
        </div>

        <div className="pt-4 flex flex-col gap-2">
          <Button onClick={handleRestart} className="w-full gap-2 py-6 text-base">
            <RefreshCw className="h-4 w-4" />
            Study Again
          </Button>
          <Link href="/decks" className="w-full">
            <Button variant="outline" className="w-full py-6 text-base">
              Back to Decks
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 flex flex-col items-center">
      {/* Progress indicators */}
      <div className="w-full space-y-2">
        <div className="flex justify-between text-sm font-medium text-muted-foreground">
          <span>Progress</span>
          <span>{currentIndex + 1} of {cards.length} cards</span>
        </div>
        <Progress value={progressPercent} className="h-1.5 w-full" />
      </div>

      {/* 3D Flipping Card Container */}
      <div 
        onClick={handleFlip}
        className="w-full h-[320px] cursor-pointer group"
        style={{ perspective: "1000px" }}
      >
        <div 
          className="relative w-full h-full duration-500 rounded-2xl shadow-md hover:shadow-lg transition-all"
          style={{ 
            transformStyle: "preserve-3d", 
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" 
          }}
        >
          {/* Card Front */}
          <Card 
            className="absolute inset-0 flex flex-col justify-center p-6 border bg-card text-card-foreground rounded-2xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <CardContent className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Front</span>
              <p className="text-lg md:text-xl font-semibold leading-relaxed max-h-[180px] overflow-y-auto px-2">
                {currentCard.front}
              </p>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <RotateCw className="h-3 w-3" /> Click card to flip
              </span>
            </CardContent>
          </Card>

          {/* Card Back */}
          <Card 
            className="absolute inset-0 flex flex-col justify-center p-6 border bg-muted/20 text-card-foreground rounded-2xl"
            style={{ 
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)"
            }}
          >
            <CardContent className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest bg-green-600/10 dark:bg-green-400/10 px-3 py-1 rounded-full">Back</span>
              <p className="text-lg md:text-xl font-medium leading-relaxed max-h-[180px] overflow-y-auto px-2">
                {currentCard.back}
              </p>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 opacity-60">
                <RotateCw className="h-3 w-3" /> Click card to flip back
              </span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 w-full pt-4">
        <Button 
          variant="outline"
          onClick={() => handleAnswer(false)}
          className="flex-1 py-6 text-base border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive gap-2 rounded-xl"
        >
          <X className="h-4 w-4" />
          Study Again
        </Button>
        <Button 
          onClick={() => handleAnswer(true)}
          className="flex-1 py-6 text-base bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700 gap-2 rounded-xl"
        >
          <Check className="h-4 w-4" />
          Got It
        </Button>
      </div>
    </div>
  );
}
