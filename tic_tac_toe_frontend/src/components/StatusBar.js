import React from "react";

/**
 * Shows player info, turn, winner, and game controls (restart).
 * @param {object} props
 * @param {string} turnPlayerName
 * @param {object} scores X/O score object
 * @param {string} winner
 * @param {boolean} isDraw
 * @param {function} onRestart
 */
function StatusBar({ turnPlayerName, scores, winner, isDraw, onRestart, gameStatus }) {
  return (
    <div
      style={{
        margin: "18px 0 24px 0",
        padding: "17px 16px",
        background: "var(--bg-secondary,#f9fafc)",
        borderRadius: "14px",
        boxShadow: "0 2px 12px rgba(20,20,20,0.07)",
        display: "flex",
        flexDirection: "column",
        gap: "7px",
        alignItems: "center",
        maxWidth: "340px",
        marginLeft: "auto",
        marginRight: "auto",
        fontSize: "1.08rem",
      }}
    >
      <div>
        <span style={{ color: "var(--primary,#1a73e8)", fontWeight: 600 }}>X</span> Score: {scores.X}&nbsp; | &nbsp;
        <span style={{ color: "var(--accent,#f44336)", fontWeight: 600 }}>O</span> Score: {scores.O}
      </div>
      {winner ? (
        <div style={{ color: "var(--secondary,#ff9800)", fontWeight: 700 }}>
          🎉 Winner: {winner}!
        </div>
      ) : isDraw ? (
        <div style={{ color: "#999", fontWeight: 600 }}>
          🤝 It's a Draw!
        </div>
      ) : (
        gameStatus === "waiting"
          ? <span style={{ color: "#888" }}>Waiting for another player...</span>
          : <div>
              <span style={{ color: "#555" }}>Current turn: </span>
              <strong>{turnPlayerName}</strong>
            </div>
      )}
      <button
        className="theme-toggle"
        style={{ marginTop: "7px", position: "relative", right: "unset", top: "unset" }}
        onClick={onRestart}
        type="button"
      >
        Restart Game
      </button>
    </div>
  );
}

export default StatusBar;
