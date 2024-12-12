import './createPost.js';

import { WebViewMessage } from './types/WebViewMessage.js';

import { Devvit, JSONValue, useState } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true, // Enables Redis integration for storing and retrieving persistent data
});

async function updatePuzzleTime(context: Devvit.Context, postId: string, username: string, time: number) {
  const key = `puzzle:${postId}`;
  const field = username;

  // Get the current best time for this user on this puzzle
  const currentBestTime = await context.redis.hGet(key, field);

  // If there's no current time, or the new time is better, update it
  if (!currentBestTime || time < parseInt(currentBestTime)) {
    await context.redis.hSet(key, { [field]: time.toString() });
    console.log(`Updated best time for user ${username} on puzzle ${postId}: ${time}`);
  } else {
    console.log(`Time not updated. Current best (${currentBestTime}) is better than new time (${time})`);
  }
}

async function getBestTime(context: Devvit.Context, postId: string, username: string): Promise<number | null> {
  const key = `puzzle:${postId}`;
  const time = await context.redis.hGet(key, username);
  return time ? parseInt(time) : null;
}

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: 'Picture Alignment Puzzle',
  height: 'tall',
  render: (context) => {
    // Load username with `useAsync` hook
    const [username] = useState(async () => {
      const currUser = await context.reddit.getCurrentUser();
      return currUser?.username ?? 'anon';
    });

    // Create a reactive state for web view visibility
    const [webviewVisible, setWebviewVisible] = useState(false);

    const [puzzleCompleted, setPuzzleCompleted] = useState(false);

    // Handle messages from the WebView
    const onMessage = async (msg: WebViewMessage) => {
      console.log("onMessage called with:", msg);
      switch (msg.type) {
        case 'completion':
          console.log("completion message");

          const { time } = msg.data as { time: number };
          const postId = context.postId;
          const username = context.userId;
          console.log("time: " + time);
        
          if (postId && username) {
            // Update the puzzle time only if postId is defined
            updatePuzzleTime(context, postId, username, time)
              .then(() => getBestTime(context, postId, username))
              .then((bestTime) => {
                context.ui.showToast(`Your best time is ${bestTime} seconds!`);
              })
              .catch((error) => {
                console.error('Error updating or getting puzzle time:', error);
              });
          } else {
            console.error('PostId is undefined');
            context.ui.showToast('Error: Unable to update puzzle time');
          }

          // Show feedback in a toast notification
          context.ui.showToast({
            text: `Great job, ${username}! You completed the puzzle in ${time} seconds.`,
          });
          setWebviewVisible(false);
          setPuzzleCompleted(true);
          break;

        case 'alert':
          console.log("alert message");
          // Show feedback in a toast notification
          context.ui.showToast({
            text: msg.message,
          });
          break;

        default:
          throw new Error(`Unknown message type: ${(msg as WebViewMessage).type}`);
      }
    };

    // When the button is clicked, send initial data to WebView and show it
    const onShowWebviewClick = () => {
      setWebviewVisible(true);
      context.ui.webView.postMessage('myWebView', {
        type: 'initialData',
        data: {
          username: username,
        },
      });
    };

    // Render the custom post type
    return (
      <vstack grow padding="small">
        <vstack
          grow={!webviewVisible}
          height={webviewVisible ? '0%' : '100%'}
          alignment="middle center"
        >
          <text size="xlarge" weight="bold">
            Picture Alignment Puzzle
          </text>
          <spacer />
          <vstack alignment="start middle">
            <hstack>
              <text size="medium">Username:</text>
              <text size="medium" weight="bold">
                {username ?? ''}
              </text>
            </hstack>
          </vstack>
          <spacer />
          <button onPress={onShowWebviewClick}>Start Puzzle</button>
        </vstack>

        {webviewVisible && (
          <vstack grow={webviewVisible} height={webviewVisible ? '100%' : '0%'}>
            <vstack border="thick" borderColor="black" height={webviewVisible ? '100%' : '0%'}>
            <webview
              id="myWebView"
              url="page.html"
              onMessage={(msg) => onMessage(msg as WebViewMessage)}
              grow
              height={webviewVisible ? '100%' : '0%'}
            />
            </vstack>
          </vstack>
        )}

        {puzzleCompleted && (
          <vstack grow alignment="middle center">
            <text size="xlarge" weight="bold">Puzzle Completed!</text>
            <spacer size="medium" />
            <text>Great job, {username}!</text>
            <spacer size="medium" />
          </vstack>
        )}
      </vstack>
    );
  },
});

export default Devvit;
