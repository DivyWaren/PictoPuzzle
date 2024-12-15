import { SlidingPuzzle } from './SlidingPuzzle.js';

let slidingPuzzleInstance = null;

// Listen for messages from Devvit
window.addEventListener('message', (event) => {
  console.log('Received message:', event.data);

  if (event.data && event.data.type === 'devvit-message') {
    const { message } = event.data.data || {};

    console.log("message: " + message);

    if (message && message.type === 'setImageUrl') {
      const { puzzleImageUrl } = message.data;
      console.log('Received image URL from Devvit:', puzzleImageUrl);

      if (puzzleImageUrl) {
        console.log("sliding puzzle instance exists: " + slidingPuzzleInstance);
        // Recreate the SlidingPuzzle instance with the new image URL
        if (slidingPuzzleInstance) {
          slidingPuzzleInstance.imageSrc = puzzleImageUrl;
          slidingPuzzleInstance.initPuzzle(); // Reinitialize the puzzle with the new image
          slidingPuzzleInstance.showFullImage();
        } else {
          slidingPuzzleInstance = new SlidingPuzzle(puzzleImageUrl);
        }
      } else {
        console.error('Received setImageUrl message without a valid imageUrl');
      }
    }
  }
});

// Initialize SlidingPuzzle with the default image URL
if (!slidingPuzzleInstance) {
  slidingPuzzleInstance = new SlidingPuzzle('static/image.jpg');
}