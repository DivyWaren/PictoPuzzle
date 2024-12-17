/**
 * Count inversions in the puzzle state
 * @param {number[]} arr - The array representing the puzzle state
 * @returns {number} - The number of inversions
 */
export function getInvCount(arr) {
  console.log("getInvCount");
  let invCount = 0;

  // Count inversions, explicitly ignoring the empty tile (0)
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === 0) continue; // Skip the empty slot
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] === 0) continue; // Skip the empty slot
      if (arr[i] > arr[j]) invCount++;
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

  const invCount = getInvCount(puzzleState); // Count inversions
  console.log(`Inversion Count: ${invCount}`);

  // Find the row of the empty slot, counting from the bottom
  const emptySlotIndex = puzzleState.indexOf(0);
  const emptySlotRowFromBottom = gridSize - Math.floor(emptySlotIndex / gridSize);
  console.log(`Empty Slot Row (from bottom): ${emptySlotRowFromBottom}`);

  // Odd grid sizes: Solvable if inversions are even
  if (gridSize % 2 !== 0) {
    return invCount % 2 === 0;
  }
  // Even grid sizes: Solvable if (inversions + empty slot row) is odd
  else {
    return (invCount + emptySlotRowFromBottom) % 2 === 1;
  }
}
