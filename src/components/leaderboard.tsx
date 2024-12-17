import { Devvit, useState } from '@devvit/public-api';
import { getLeaderboardWithUserRank, getUsernameFromId } from '../utils/leaderboardUtils.js';

type LeaderboardData = {
  topScores: { member: string; score: number; username: string }[];
  userRank: number | null;
  userScore: number | null;
  userUsername: string | null;
};

export const Leaderboard = (props: { postId: string; userId: string }, context: Devvit.Context) => {
  const { postId, userId } = props;

  const [leaderboardData] = useState<LeaderboardData | null>(async () => {
    const data = await getLeaderboardWithUserRank(context, postId, userId, 5);
    if (data) {
      // Fetch usernames for top scores
      const topScoresWithUsernames = await Promise.all(
        data.topScores.map(async (score) => ({
          ...score,
          username: await getUsernameFromId(score.member, context) || 'Unknown User'
        }))
      );
      // Fetch username for the current user
      const userUsername = await getUsernameFromId(userId, context) || 'Unknown User';
      return {
        ...data,
        topScores: topScoresWithUsernames,
        userUsername
      };
    }
    return null;
  });

  if (!leaderboardData) {
    return <text>Loading leaderboard...</text>;
  }

  return (
    <vstack gap="small" padding="small" cornerRadius="medium">
      <hstack alignment="top center">
  <text size="xlarge" weight="bold" color="#ff4500">Puzzle Leaderboard</text>
</hstack>
      {leaderboardData.topScores.map((score, index) => (
        <hstack key={index.toString()} gap="small" backgroundColor={index % 2 === 0 ? '#ffffff' : '#f0f0f0'} padding="xsmall" cornerRadius="small">
          <text width="10%" color="#888888">{index + 1}.</text>
          <text width="60%" color="#1a1a1b">{score.username}</text>
          <text width="30%" color="#0079d3" alignment="end middle">{formatTime(score.score)}</text>
        </hstack>
      ))}
      {leaderboardData.userRank && leaderboardData.userRank > 5 && (
        <vstack gap="small">
          <text alignment="center middle">...</text>
          <hstack gap="small" alignment="center middle" backgroundColor="#e9f5fd" padding="xsmall" cornerRadius="small">
            <text width="10%" color="#888888">{leaderboardData.userRank}.</text>
            <text width="60%" color="#1a1a1b" weight="bold">{leaderboardData.userUsername || 'Unknown User'}</text>
            <text width="30%" color="#0079d3" alignment="end middle" weight="bold">{formatTime(leaderboardData.userScore!)}</text>
          </hstack>
        </vstack>
      )}
    </vstack>
  );
};

function formatTime(time: number): string {
  const minutes = (Math.floor(time / 60)).toFixed(0);
  const seconds = (time % 60).toFixed(0);
  return `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
}