import React from "react";
import "./Board.css";

// PUBLIC_INTERFACE
/**
 * The game board UI for Tic Tac Toe.
 * @param {object} props
 * @param {Array<Array<'X'|'O'|null>>} props.board
 * @param {(row:number, col:number) => void} props.onCellClick
 * @param {boolean} props.disabled - disables clicking if true
 * @returns {JSX.Element}
 */
function Board({ board, onCellClick, disabled }) {
  return (
    <div className="ttt-board">
      {board.map((row, rowIdx) =>
        <div className="ttt-board-row" key={rowIdx}>
          {row.map((cell, colIdx) => 
            <button
              key={colIdx}
              className={`ttt-cell${cell ? ` ttt-cell-${cell}` : ""}`}
              onClick={() => !disabled && onCellClick(rowIdx, colIdx)}
              disabled={disabled || cell}
              tabIndex={disabled || cell ? -1 : 0}
              aria-label={`Cell ${rowIdx+1},${colIdx+1} ${cell ? cell : ''}`}
            >
              {cell}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Board;
