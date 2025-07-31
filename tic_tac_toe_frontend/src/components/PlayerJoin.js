import React, { useState } from "react";

/**
 * Player join and selection form for Tic Tac Toe.
 *
 * @param {object} props
 * @param {function} props.onJoin (name, mark) => void
 * @param {string[]} props.availableMarks
 */
// PUBLIC_INTERFACE
function PlayerJoin({ onJoin, availableMarks }) {
  const [name, setName] = useState("");
  const [mark, setMark] = useState(availableMarks[0] || 'X');

  return (
    <div style={{
      textAlign: "center",
      margin: "32px 0",
      background: "var(--bg-secondary)",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 2px 16px rgba(20,20,20,0.09)"
    }}>
      <h2 style={{ marginBottom: 12 }}>Join Tic Tac Toe Game</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (name.trim()) {
            onJoin(name.trim(), mark);
          }
        }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}
      >
        <label>
          Name:
          <input
            style={{
              borderRadius: 8,
              border: "1.5px solid var(--border-color)",
              padding: "7px 18px",
              marginLeft: "16px",
              fontSize: "1.1rem",
            }}
            value={name}
            autoFocus
            maxLength={22}
            required
            onChange={e => setName(e.target.value)}
          />
        </label>
        <label>
          Choose your mark:
          <select
            style={{
              borderRadius: 6,
              border: "1px solid var(--border-color)",
              marginLeft: "12px",
              fontSize: "1.15rem",
              padding: "5px 12px",
            }}
            value={mark}
            onChange={e => setMark(e.target.value)}
          >
            {availableMarks.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
        <button
          className="theme-toggle"
          type="submit"
          style={{
            position: "relative",
            top: "unset",
            right: "unset",
            margin: "0 auto"
          }}
        >
          Join Game
        </button>
      </form>
    </div>
  );
}

export default PlayerJoin;
