class PicturePuzzle {
  constructor() {
    this.container = document.querySelector('#puzzle-container');
    this.timerElement = document.querySelector('#timer');
    this.startButton = document.querySelector('#start-timer');
    this.submitButton = document.querySelector('#submit-solution');
    this.imageSrc = 'static/image.jpg';
    this.timer = 0;
    this.timerInterval = null;

    this.startButton.addEventListener('click', () => this.startGame());
    this.submitButton.addEventListener('click', () => this.submitSolution());

    this.initPuzzle();
  }

  initPuzzle() {
    // Load and scramble the image
    this.container.innerHTML = '';
    const positions = Array.from({ length: 9 }, (_, i) => i).sort(() => Math.random() - 0.5);
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

  dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
  }

  dragOver(e) {
    e.preventDefault();
  }

  drop(e) {
    const draggedIndex = e.dataTransfer.getData('text/plain');
    const targetIndex = e.target.dataset.index;

    // Swap the two pieces
    const pieces = this.container.querySelectorAll('.puzzle-piece');
    this.container.insertBefore(pieces[draggedIndex], pieces[targetIndex]);
    this.container.insertBefore(pieces[targetIndex], pieces[draggedIndex]);
  }

  startGame() {
    this.timer = 0;
    this.timerElement.textContent = this.timer;
    this.startButton.disabled = true;
    this.submitButton.disabled = false;

    // Start timer
    this.timerInterval = setInterval(() => {
      this.timer++;
      this.timerElement.textContent = this.timer;
    }, 1000);
  }

  checkSolution() {
    const pieces = Array.from(this.container.querySelectorAll('.puzzle-piece'));
    return pieces.every((piece, index) => parseInt(piece.dataset.index, 10) === index);
  }

  submitSolution() {
    if (this.checkSolution()) {
      clearInterval(this.timerInterval);
      window.parent.postMessage(
        { type: 'solutionComplete', data: { time: this.timer } },
        '*'
      );
      alert('Congratulations! Puzzle solved in ' + this.timer + ' seconds.');
    } else {
      alert('Puzzle is not solved correctly. Keep trying!');
    }
  }
}

new PicturePuzzle();
