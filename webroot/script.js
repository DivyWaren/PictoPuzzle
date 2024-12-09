class PicturePuzzle {
  constructor() {
    // The container where the puzzle pieces are displayed
    this.container = document.querySelector('#puzzle-container');

    // Displays the elapsed time
    this.timerElement = document.querySelector('#timer');

    // Button to start game timer
    this.startButton = document.querySelector('#start-timer');

    // Button to submit the solution (i.e. finished puzzle)
    this.submitButton = document.querySelector('#submit-solution');

    this.timer = 0;
    this.timerInterval = null;

    // Path to puzzle image
    this.imageSrc = 'static/image.jpg';

    this.startButton.addEventListener('click', () => this.startGame());
    this.submitButton.addEventListener('click', () => this.submitSolution());

    this.initPuzzle();
  }

  // Handles loading and scrambling of the puzzle
  initPuzzle() {
    // Reset the container
    this.container.innerHTML = '';

    // Randomize puzzle piece order
    const positions = Array.from({ length: 9 }, (_, i) => i).sort(() => Math.random() - 0.5);

    // Create each puzzle piece and add them to the container
    positions.forEach((pos, index) => {
      const piece = document.createElement('div');
      piece.className = 'puzzle-piece';
      piece.style.backgroundImage = `url(${this.imageSrc})`;
      piece.style.backgroundPosition = `${(pos % 3) * -100}px ${(Math.floor(pos / 3)) * -100}px`;
      piece.dataset.index = index;
      this.container.appendChild(piece);

      // Add drag and drop functionality
      piece.draggable = true;
      piece.addEventListener('dragstart', (e) => this.dragStart(e));
      piece.addEventListener('dragover', (e) => this.dragOver(e));
      piece.addEventListener('drop', (e) => this.drop(e));
    });
  }

  // Saves the puzzle piece's original index to dataTransfer object while it is being dragged
  dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
  }

  // Prevents the default behaviour to allow dropping
  dragOver(e) {
    e.preventDefault();
  }

  // Swaps the dragged puzzle piece with target piece
  drop(e) {
    const draggedIndex = e.dataTransfer.getData('text/plain');
    const targetIndex = e.target.dataset.index;

    // Swap the two pieces
    const pieces = this.container.querySelectorAll('.puzzle-piece');
    this.container.insertBefore(pieces[draggedIndex], pieces[targetIndex]);
    this.container.insertBefore(pieces[targetIndex], pieces[draggedIndex]);
  }

  // Handles timer
  startGame() {
    this.timer = 0;
    this.timerElement.textContent = this.timer;
    this.startButton.disabled = true;
    this.submitButton.disabled = false;

    // Starts timer by incrementing timer count every second and updating the display
    this.timerInterval = setInterval(() => {
      this.timer++;
      this.timerElement.textContent = this.timer;
    }, 1000);
  }

  // Checks if puzzle is solved
  checkSolution() {
    // Fetches all pieces
    const pieces = Array.from(this.container.querySelectorAll('.puzzle-piece'));

    // Returns true if all pieces are in the correct order (index), else return false
    return pieces.every((piece, index) => parseInt(piece.dataset.index, 10) === index);
  }

  // Handles end game results
  submitSolution() {
    // Checks if puzzle is solved
    if (this.checkSolution()) {
      // Stops timer
      clearInterval(this.timerInterval);

      // Sends time data to Devvit service
      window.parent.postMessage(
        { type: 'solutionComplete', data: { time: this.timer } },
        '*'
      );

      // Display success message
      alert('Congratulations! Puzzle solved in ' + this.timer + ' seconds.');
    } else {
      // Alerts the user to continue trying
      alert('Puzzle is not solved correctly. Keep trying!');
    }
  }
}

new PicturePuzzle();
