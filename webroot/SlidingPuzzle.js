import { isSolvable } from './checkPuzzle.js';

export class SlidingPuzzle {
  constructor(imageUrl, gridSize = 3) {
    // The container where the puzzle pieces are displayed
    this.container = document.querySelector('#puzzle-container');

    // Displays the elapsed time
    this.timerElement = document.querySelector('#timer');

    // Button to start game timer
    this.startButton = document.querySelector('#start-timer');

    // Button to show full image
    this.showImageButton = document.querySelector('#show-image-button');

    this.timer = 0;
    this.timerInterval = null;

    // Set grid size (3x3)
    this.gridSize = gridSize;

    // Array to track current positions of the tiles
    this.puzzleState = [];

    // Tracks the empty tile position
    this.emptySlot = null;

    // Path to puzzle image
    this.imageSrc = imageUrl;

    this.startButton.addEventListener('click', () => this.startGame());

    this.showImageButton.addEventListener('click', () => this.showImageOverlay());

    this.showFullImage();
  }

  // Handles loading and scrambling of the puzzle
  initPuzzle() {
    // Disable the grid container
    this.container.classList.add('disabled'); 

    // Get total number of puzzle pieces
    const totalPieces = this.gridSize * this.gridSize;

    // Repeat scrambling until solvable
    do {
      // Shuffle puzzle pieces randomly, leaving the last slot as the empty slot
      this.puzzleState = Array.from({ length: totalPieces }, (_, i) => i);
      this.puzzleState = this.puzzleState.sort(() => Math.random() - 0.5);
    } while (!isSolvable(this.puzzleState, this.gridSize));

    console.log(isSolvable(this.puzzleState, this.gridSize));

    this.emptySlot = this.puzzleState.indexOf(totalPieces - 1);

    this.renderPuzzle();
  }

  renderPuzzle() {
    // Reset the container
    this.container.innerHTML = '';
  
    // Set grid-template dynamically for rows and columns
    this.container.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
    this.container.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;
  
    // Calculate the size of each tile dynamically
    const tileWidth = this.container.offsetWidth / this.gridSize;
    const tileHeight = this.container.offsetHeight / this.gridSize;
  
    this.puzzleState.forEach((pos, index) => {
      const piece = document.createElement('div');
      piece.className = 'puzzle-piece';
  
      if (pos === this.gridSize * this.gridSize - 1) {
        // Empty slot
        piece.classList.add('empty-slot');
        this.emptySlot = index;
      } else {
        // Position and style each puzzle piece
        piece.style.width = `${tileWidth}px`;
        piece.style.height = `${tileHeight}px`;
  
        piece.style.backgroundImage = `url(${this.imageSrc})`;
        piece.style.backgroundSize = `${this.gridSize * 100}% ${this.gridSize * 100}%`;
        piece.style.backgroundPosition = `${(pos % this.gridSize) * -tileWidth}px ${(Math.floor(pos / this.gridSize)) * -tileHeight}px`;
  
        piece.dataset.index = pos;
  
        // Add click event for sliding
        piece.addEventListener('click', () => this.slidePiece(index));
      }
  
      this.container.appendChild(piece);
    });
  }
  
  
  slidePiece(index) {
    const row = Math.floor(index / this.gridSize);
    const col = index % this.gridSize;
    const emptyRow = Math.floor(this.emptySlot / this.gridSize);
    const emptyCol = this.emptySlot % this.gridSize;

    // Check if the clicked piece is adjacent to the empty slot
    if (Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1) {
      // Swap the clicked piece with the empty slot
      [this.puzzleState[index], this.puzzleState[this.emptySlot]] = [
        this.puzzleState[this.emptySlot],
        this.puzzleState[index],
      ];
      this.emptySlot = index;

      this.renderPuzzle();
      // Check if the puzzle is solved
      if (this.checkSolution()) {
        this.submitSolution(); // Automatically submit solution upon completion
      }
    }
  }

  // Handles timer
  startGame() {
    this.initPuzzle();
    this.timer = 0;
    this.timerElement.textContent = this.timer;
    this.startButton.disabled = true;


    // Enable the puzzle grid when game starts
    this.container.classList.remove('disabled');

    // Starts timer by incrementing timer count every second and updating the display
    this.timerInterval = setInterval(() => {
      this.timer++;
      this.timerElement.textContent = this.timer;
    }, 1000);
  }

  // Checks if puzzle is solved
  checkSolution() {
    // Returns true if all pieces are in the correct ascending order (solved state), else return false
    return this.puzzleState.every((value, index) => value === index);
  }

  // Handles end game results
  submitSolution() {
    // Checks if puzzle is solved
    if (this.checkSolution()) {
      // Stops timer
      clearInterval(this.timerInterval);

      // Show the full image
      this.showFullImage();

      // Sends time data to Devvit service
      window.parent.postMessage(
        { type: 'completion', data: { time: this.timer } },
        '*'
      );
    } else {
      // Alerts the user to continue trying
      window.parent.postMessage({
        type: 'alert',
        message: 'Puzzle is not solved correctly. Keep trying!'
      }, '*');
    }
  }

  // Display the full image
  showFullImage() {
    // Reset the puzzle container
    this.container.innerHTML = '';

    // Create a single div to show the full image
    const fullImage = document.createElement('div');
    fullImage.className = 'full-image';
    fullImage.style.backgroundImage = `url(${this.imageSrc})`;
    fullImage.style.width = `${this.container.offsetWidth}px`; // Match container width
    fullImage.style.height = `${this.container.offsetHeight}px`; // Match container height
    fullImage.style.backgroundSize = 'cover';

    this.container.appendChild(fullImage);
  }

  showImageOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    const image = document.createElement('img');
    image.src = this.imageSrc;
    overlay.appendChild(image);

    // Add event listener to hide the overlay when clicked
    overlay.addEventListener('click', () => {
      overlay.remove();
    });

    document.body.appendChild(overlay);
  }
}