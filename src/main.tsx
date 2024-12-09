import './createPost.js';

import { Devvit, useState } from '@devvit/public-api';

// Defines the messages exchanged between Devvit and Web View
type WebViewMessage =
  | {
      type: 'initialData';
      data: { username: string };
    }
  | {
      type: 'completion';
      data: { timeTaken: number };
    };

Devvit.configure({
  redditAPI: true,
  redis: true, // Enables Redis integration for storing and retrieving persistent data
});

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

    // Handle messages from the WebView
    const onMessage = async (msg: WebViewMessage) => {
      switch (msg.type) {
        case 'completion':
          const { timeTaken } = msg.data;

          // Store the completion time in Redis
          await context.redis.set(
            `puzzle_score_${context.postId}_${username}`,
            timeTaken.toString()
          );

          // Show feedback in a toast notification
          context.ui.showToast({
            text: `Great job, ${username}! You completed the puzzle in ${timeTaken} seconds.`,
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
      </vstack>
    );
  },
});

export default Devvit;
