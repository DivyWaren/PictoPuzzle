import { Devvit } from '@devvit/public-api'

export async function updatePuzzleTime(context: Devvit.Context, postId: string, userId: string, time: number) {
  const key = `puzzle:${postId}`;
  const leaderboardKey = `leaderboard:${postId}`;

  // Get the current best time for this user on this puzzle
  const currentBestTime = await context.redis.hGet(key, userId);

  // If there's no current time, or the new time is better, update it
  if (!currentBestTime || time < parseInt(currentBestTime)) {
    await context.redis.hSet(key, { [userId]: time.toString() });
    // Update the leaderboard
    await context.redis.zAdd(leaderboardKey, { member: userId, score: time });
    console.log(`Updated best time for user ${userId} on puzzle ${postId}: ${time}`);
    return true;
  } else {
    console.log(`Time not updated. Current best (${currentBestTime}) is better than new time (${time})`);
    return false;
  }
}

export async function getBestTime(context: Devvit.Context, postId: string, userId: string): Promise<number | null> {
  const key = `puzzle:${postId}`;
  const time = await context.redis.hGet(key, userId);
  return time ? parseInt(time) : null;
}