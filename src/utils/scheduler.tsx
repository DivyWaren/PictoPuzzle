import { Devvit } from '@devvit/public-api';
import { LoadingState } from "../components/loading.js";


const TOTAL_IMAGES = 800;
const DAILY_JOB_NAME = 'daily_puzzle_post';

Devvit.addSchedulerJob({
  name: DAILY_JOB_NAME,
  onRun: async (event, context) => {
    const { reddit, redis } = context;
    
    // Get the current index and increment it
    let currentIndex = parseInt(await redis.get('currentPuzzleIndex') || '0');
    currentIndex = (currentIndex % TOTAL_IMAGES) + 1;
    await redis.set('currentPuzzleIndex', currentIndex.toString());

    // Determine if it's a weekly post (every 7th post)
    const isWeekly = currentIndex % 7 === 0;

    // Set grid size
    const gridSize = isWeekly ? '5' : (Math.random() < 0.5 ? '3' : '4');

    // Construct image URL
    const imageUrl = `/static/image_${currentIndex}.jpg`;

    // Get the current subreddit
    const subreddit = await reddit.getCurrentSubreddit();

    // Create post title
    const title = `Daily Puzzle #${currentIndex} - ${gridSize}x${gridSize} Grid`;

    // Submit a new post
    const post = await reddit.submitPost({
      title: title,
      subredditName: subreddit.name,
      preview: <LoadingState/>,
    });

    // Store the imageUrl and gridSize in Redis, associated with the post ID
    await redis.hSet(`post:${post.id}`, {
      imageUrl: imageUrl,
      gridSize: gridSize
    });

    console.log(`Created daily puzzle post: ${title}`);
  },
});

Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (event, context) => {
    // Schedule the daily job to run at midnight UTC
    await context.scheduler.runJob({
      name: DAILY_JOB_NAME,
      cron: '0 0 * * *',
    });
    console.log('Scheduled daily puzzle post job');
  },
});

export default Devvit;