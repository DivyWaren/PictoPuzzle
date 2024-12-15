import { Devvit } from '@devvit/public-api';
import { getBestTime } from './puzzleUtils.js';

export async function getLeaderboard(context: Devvit.Context, postId: string): Promise<{ member: string; score: number }[]> {
  const leaderboardKey = `leaderboard:${postId}`;
  let topScores = await context.redis.zRange(leaderboardKey, 0, -1, { by: "rank" });
  console.log("top scores: " + topScores);
  return topScores;
}
  
export async function getUserRank(context: Devvit.Context, postId: string, userId: string): Promise<number | null> {
  const leaderboardKey = `leaderboard:${postId}`;
  const rank = await context.redis.zRank(leaderboardKey, userId);
  // zRank returns the 0-based rank, so we add 1 to get the position
  return rank !== undefined ? rank + 1 : null;
}

export async function getUsernameFromId(userId: string, context: Devvit.Context): Promise<string | undefined> {
  try {
    const user = await context.reddit.getUserById(userId);
    return user?.username;
  } catch (error) {
    console.error(`Error fetching user: ${error}`);
    return undefined;
  }
}
  
export async function getLeaderboardWithUserRank(context: Devvit.Context, postId: string, username: string, limit: number = 5): Promise<{
  topScores: { member: string; score: number }[];
  userRank: number | null;
  userScore: number | null;
}> {
  const leaderboardKey = `leaderboard:${postId}`;
  const topScores = await getLeaderboard(context, postId);
  const userRank = await getUserRank(context, postId, username);
  const userScore = await context.redis.zScore(leaderboardKey, username);

  console.log("top scorers 2: " + topScores);
  console.log("userRank: " + userRank);

  console.log("userScore: " + userScore);


  // If the user is not in the top scores, add their score to the list
  if (userScore !== undefined && !topScores.some(score => score.member === username)) {
    topScores.push({ member: username, score: userScore });
    topScores.sort((a, b) => a.score - b.score);
    if (topScores.length > limit) {
      topScores.pop();
    }
  }

  return {
    topScores,
    userRank,
    userScore: userScore === undefined ? null : userScore // converts undefined to null for error handling
  };
}