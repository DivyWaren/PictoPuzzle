import { Devvit, useAsync, useState } from '@devvit/public-api';
import { LoadingState } from './components/loading.js';
import { WebViewMessage } from './types/WebViewMessage.js';
import { getBestTime, updatePuzzleTime } from './utils/puzzleUtils.js';
import { Leaderboard } from './components/leaderboard.js';

export const App: Devvit.CustomPostComponent = (context) => {
  // Create a reactive state for web view visibility
      const [webviewVisible, setWebviewVisible] = useState(false);
  
      const [puzzleCompleted, setPuzzleCompleted] = useState(false);
  
      const [currentBestTime, setCurrentBestTime] = useState<number | null>(null);
  
      const { data: initialData, loading, error } = useAsync(async () => {
        const currUser = await context.reddit.getCurrentUser();
        const username = currUser?.username ?? 'anon';
        const userId = context.userId ?? 'anon';
        const postId = context.postId ?? '';
        let bestTime = null;
        if (postId && userId) {
          console.log("post id: " + postId);
          console.log("user id" + userId);
          bestTime = await getBestTime(context, postId, userId);
          setCurrentBestTime(bestTime);
          console.log("fetching done, best time is: " + bestTime);
        }
        console.log("useAsync is almost done");
        return { username, userId, postId, bestTime };
      }, { depends: [context.userId || null]});
  
      if (loading) {
        return <LoadingState />;
      }
  
      if (error) {
        return <text>Error loading data: {error.message}</text>;
      }
  
      // Check if initialData is not null before destructuring
      if (!initialData) {
        return <text>Error: No data available</text>;
      }
      
      const { username, userId, postId, bestTime } = initialData;
      
      // Update currentBestTime if it's different from the fetched bestTime
      if (bestTime != currentBestTime) {
        setCurrentBestTime(bestTime);
      }
  
      // Handle messages from the WebView
      const onMessage = async (msg: WebViewMessage) => {
        console.log("onMessage called with:", msg);
        switch (msg.type) {
          case 'completion':
            console.log("completion message");
  
            const { time } = msg.data as { time: number };
            
            const username = context.userId;
            console.log("time: " + time);
            const postId = context.postId;
  
            if (postId && username) {
              // Update the puzzle time in Redis
              let isUpdated = await updatePuzzleTime(context, postId, username, time);
  
              if (isUpdated) {
                // Fetch and update the best time
                const updatedBestTime = await getBestTime(context, postId, username);
                setCurrentBestTime(updatedBestTime);
  
                context.ui.showToast(`Congratulations, your best time is ${updatedBestTime} seconds!`);
              } else {
                // Show feedback in a toast notification
                context.ui.showToast({
                  text: `Great job, ${username}! You completed the puzzle in ${time} seconds.`,
                });
              }
            } else {
              console.error('PostId is undefined');
              context.ui.showToast('Error: Unable to update puzzle time');
            }
  
            
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
  
      const BestTimeDisplay = () => {
        if (loading) {
          return <LoadingState />;
        }
        return (
          <text size="medium" weight="bold">
            {currentBestTime !== null ? `${currentBestTime} seconds` : 
             initialData?.bestTime != null ? `${initialData.bestTime} seconds` : 
             'No time recorded yet'}
          </text>
        );
      };
      
      // Render the custom post type
      return (
        <>
          {puzzleCompleted ? (
            // Show only the Leaderboard component when the puzzle is completed
            <Leaderboard postId={postId} userId={userId} />
          ) : (
            // Show the regular puzzle UI when the puzzle is not completed
            <vstack grow padding="small">
              <vstack
                grow={!webviewVisible}
                height={webviewVisible ? '0%' : '100%'}
                alignment="middle center"
              >
                <image url="logo.jpg" imageWidth={300} imageHeight={300} />
                <spacer />
                <vstack alignment="start middle">
                  <hstack>
                    <text size="medium">Username:</text>
                    <text size="medium" weight="bold">
                      {username ?? ''}
                    </text>
                  </hstack>
                  <hstack>
                    <text size="medium">Best Time:</text>
                    <BestTimeDisplay />
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
            </vstack>
          )}
        </>
      );
      
};