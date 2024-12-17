/**
 * Count inversions in the puzzle state
 * @param {number[]} arr - The array representing the puzzle state
 * @param {number} gridSize - The size of the grid
 * @returns {number} - The number of inversions
 */
export function getInvCount(arr, gridSize) {
  console.log("getInvCount");
  let invCount = 0;
  const totalPieces = arr.length;

  for (let i = 0; i < totalPieces - 1; i++) {
    for (let j = i + 1; j < totalPieces; j++) {
      // Count inversions where a larger number precedes a smaller one
      if (arr[i] > arr[j] && arr[i] !== gridSize * gridSize - 1 && arr[j] !== gridSize * gridSize - 1) {
        invCount++;
      }
    }
  }

  return invCount;
}


/**
 * Check if the puzzle is solvable
 * @param {number[]} puzzleState - The array representing the puzzle state
 * @param {number} gridSize - The size of the grid
 * @returns {boolean} - Whether the puzzle is solvable
 */
export function isSolvable(puzzleState, gridSize) {
  console.log("isSolvable");

  const invCount = getInvCount(puzzleState, gridSize); // Count inversions
  const totalPieces = gridSize * gridSize;

  // Find the row of the empty slot, counting from the bottom
  const emptySlotIndex = puzzleState.indexOf(totalPieces - 1);
  const emptySlotRowFromBottom = gridSize - Math.floor(emptySlotIndex / gridSize);

  // Odd grid sizes: solvable if inversions are even
  if (gridSize % 2 !== 0) {
    return invCount % 2 === 0;
  }
  // Even grid sizes: solvable if (inversions + empty slot row) is odd
  else {
    return (invCount + emptySlotRowFromBottom) % 2 === 0;
  }
}