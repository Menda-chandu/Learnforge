import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Star, Zap, Flame, Crown } from "lucide-react";

type AchievementsListProps = {
  totalQuizzes: number;
  totalAttempts: number;
  hasPerfectScore: boolean;
};

export function AchievementsList({
  totalQuizzes,
  totalAttempts,
  hasPerfectScore,
}: AchievementsListProps) {
  // Define possible achievements
  const achievements = [
    {
      id: "first_blood",
      title: "First Blood",
      description: "Take your first quiz attempt.",
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      earned: totalAttempts >= 1,
    },
    {
      id: "quiz_creator",
      title: "Quiz Creator",
      description: "Create your first quiz.",
      icon: <Trophy className="w-6 h-6 text-blue-500" />,
      earned: totalQuizzes >= 1,
    },
    {
      id: "quiz_master",
      title: "Quiz Master",
      description: "Create 5 or more quizzes.",
      icon: <Crown className="w-6 h-6 text-purple-500" />,
      earned: totalQuizzes >= 5,
    },
    {
      id: "dedicated",
      title: "Dedicated",
      description: "Complete 10 or more quiz attempts.",
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      earned: totalAttempts >= 10,
    },
    {
      id: "perfect_score",
      title: "Perfectionist",
      description: "Get a 100% score on any quiz attempt.",
      icon: <Star className="w-6 h-6 text-green-500" />,
      earned: hasPerfectScore,
    },
  ];

  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" />
          Achievements
        </h3>
        <Badge variant="secondary" className="px-3 py-1">
          {earnedCount} / {achievements.length} Unlocked
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <Card 
            key={achievement.id} 
            className={`transition-all duration-300 ${
              achievement.earned 
                ? "border-primary/20 bg-primary/5 shadow-sm" 
                : "opacity-60 grayscale"
            }`}
          >
            <CardContent className="p-5 flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                achievement.earned ? "bg-background shadow-sm border" : "bg-muted"
              }`}>
                {achievement.icon}
              </div>
              <div>
                <h4 className="font-bold text-base mb-1">{achievement.title}</h4>
                <p className="text-xs text-muted-foreground leading-tight">
                  {achievement.description}
                </p>
                {achievement.earned && (
                  <Badge variant="default" className="mt-2 text-[10px] px-1.5 py-0">Unlocked</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
