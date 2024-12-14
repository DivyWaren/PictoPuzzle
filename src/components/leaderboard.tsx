import { Devvit, useState } from '@devvit/public-api';
import { getLeaderboardWithUserRank } from '../utils/leaderboardUtils.js'; // Assuming you've put the previous functions in this file

type LeaderboardData = {
    topScores: { member: string; score: number }[];
    userRank: number | null;
    userScore: number | null;
  };

  export const Leaderboard = (props: { postId: string; userId: string }, context: Devvit.Context) => {
    const { postId, userId } = props;
  
    const [leaderboardData] = useState<LeaderboardData | null>(async () => {
        const data = await getLeaderboardWithUserRank(context, postId, userId, 5);
  return data;
      });
  
    if (!leaderboardData) {
      return <text>Loading leaderboard...</text>;
    }
  
    return (
      <vstack gap="small">
        <text size="large" weight="bold">Puzzle Leaderboard</text>
        {leaderboardData.topScores.map((score, index) => (
          <hstack key={index.toString()} gap="small" alignment="center">
            <text>{index + 1}.</text>
            <text>{score.member}</text>
            <text>{formatTime(score.score)}</text>
          </hstack>
        ))}
        {leaderboardData.userRank && leaderboardData.userRank > 5 && (
          <vstack gap="small">
            <text>...</text>
            <hstack gap="small" alignment="center">
              <text>{leaderboardData.userRank}.</text>
              <text>{userId}</text>
              <text>{formatTime(leaderboardData.userScore!)}</text>
            </hstack>
          </vstack>
        )}
      </vstack>
    );
  };
  

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60000);
  const seconds = ((time % 60000) / 1000).toFixed(2);
  return `${minutes}:${seconds.padStart(5, '0')}`;
}