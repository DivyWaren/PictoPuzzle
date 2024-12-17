import { SlidingPuzzle } from './SlidingPuzzle.js';

let slidingPuzzleInstance = null;
// Listen for messages from Devvit
window.addEventListener('message', (event) => {
  console.log('Received message:', event.data);
  if (event.data && event.data.type === 'devvit-message') {
    const { message } = event.data.data;
    console.log("message: " + message);
    if (message && message.type === 'setPuzzleDetails') {
      const { puzzleImageUrl, gridSize } = message.data;
      console.log("url: ",puzzleImageUrl, " gridsize: ", gridSize)
      if (puzzleImageUrl && gridSize) {
        console.log('Updating puzzle with new image URL:', puzzleImageUrl);
        if (slidingPuzzleInstance) {
          slidingPuzzleInstance.imageSrc = puzzleImageUrl;
          slidingPuzzleInstance.gridSize = gridSize;
          slidingPuzzleInstance.initPuzzle(); // Reinitialize the puzzle with the new image
          slidingPuzzleInstance.showFullImage();
        } else {
          slidingPuzzleInstance = new SlidingPuzzle('static/image.jpg', gridSize);
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