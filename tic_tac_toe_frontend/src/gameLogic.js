/**
 * Checks if there's a winner in the board.
 * @param {Array<Array<'X'|'O'|null>>} board
 * @returns {'X'|'O'|null}
 */
// PUBLIC_INTERFACE
export function calculateWinner(board) {
  const lines = [
    // rows
    [ [0,0], [0,1], [0,2] ],
    [ [1,0], [1,1], [1,2] ],
    [ [2,0], [2,1], [2,2] ],
    // columns
    [ [0,0], [1,0], [2,0] ],
    [ [0,1], [1,1], [2,1] ],
    [ [0,2], [1,2], [2,2] ],
    // diagonals
    [ [0,0], [1,1], [2,2] ],
    [ [0,2], [1,1], [2,0] ],
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (
      board[a[0]][a[1]] &&
      board[a[0]][a[1]] === board[b[0]][b[1]] &&
      board[a[0]][a[1]] === board[c[0]][c[1]]
    ) {
      return board[a[0]][a[1]];
    }
  }
  return null;
}

/**
 * Checks if the board is full
 * @param {Array<Array<'X'|'O'|null>>} board
 * @returns {boolean}
 */
// PUBLIC_INTERFACE
export function isDraw(board) {
  return board.flat().every(cell => cell !== null);
}
