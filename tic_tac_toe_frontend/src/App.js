import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";
import Board from "./components/Board";
import PlayerJoin from "./components/PlayerJoin";
import StatusBar from "./components/StatusBar";
import { calculateWinner, isDraw } from "./gameLogic";

// -- Config
const GAME_LOBBY_ID = "mainroom";

/**
 * Returns a 3x3 matrix of nulls.
 */
function emptyBoard() {
  return Array(3)
    .fill(null)
    .map(() => Array(3).fill(null));
}

// PUBLIC_INTERFACE
/**
 * Top-level App for Tic Tac Toe with Supabase integration.
 */
function App() {
  const [theme, setTheme] = useState("light");
  const [player, setPlayer] = useState(null); // { id, name, mark }
  const [game, setGame] = useState(null); // { board, nextPlayer, ... }
  const [joinError, setJoinError] = useState("");
  const [loading, setLoading] = useState(true);

  // Set light/dark mode theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((theme) => (theme === "light" ? "dark" : "light"));

  // Initialize/Subscribe to real-time game state via Supabase
  useEffect(() => {
    setLoading(true);

    async function fetchGame() {
      // 1. Try join or create lobby game row in Supabase table 'games'
      let { data: gameRow } = await supabase
        .from("games")
        .select("*")
        .eq("id", GAME_LOBBY_ID)
        .single();

      if (!gameRow) {
        // Didn't exist, create a new
        const { data: created, error } = await supabase
          .from("games")
          .insert([
            {
              id: GAME_LOBBY_ID,
              board: emptyBoard(),
              next_player: "X",
              winner: null,
              is_draw: false,
              scores: { X: 0, O: 0 },
              status: "waiting",
              players: [],
              current_turn_player_id: null,
            },
          ])
          .select()
          .single();
        gameRow = created;
      }
      setGame(gameRow);
      setLoading(false);
    }
    fetchGame();

    // Real-time subscription: listen for state changes on table 'games'
    const subscription = supabase
      .channel("realtime games")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${GAME_LOBBY_ID}` },
        (payload) => {
          setGame(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // PUBLIC_INTERFACE
  // Handle player join (assign to mark if not taken)
  const handleJoin = async (name, mark) => {
    setJoinError("");
    const { data: gameRow, error } = await supabase
      .from("games")
      .select("players")
      .eq("id", GAME_LOBBY_ID)
      .single();
    if (error || !gameRow) {
      setJoinError("Could not join game. Try again.");
      return;
    }
    if (gameRow.players.find((p) => p.mark === mark)) {
      setJoinError("Selected mark is already taken by another player!");
      return;
    }
    // Assign a session id for client
    const myId = `player_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    const newPlayer = { id: myId, name, mark };
    // Add player to game row
    await supabase
      .from("games")
      .update({ players: [...gameRow.players, newPlayer], status: (gameRow.players.length === 0 ? "waiting" : "ongoing") })
      .eq("id", GAME_LOBBY_ID);
    setPlayer(newPlayer);
    // Re-fetch/let realtime update
  };

  // Find player name for turn
  const getTurnName = useCallback(() => {
    if (!game || !game.players) return "";
    const turnPlayer =
      game.players.find((p) => p.mark === game.next_player) ||
      game.players.find((p) => p.id === game.current_turn_player_id);
    return turnPlayer ? turnPlayer.name + ` (${turnPlayer.mark})` : `${game.next_player}`;
  }, [game]);

  // PUBLIC_INTERFACE
  // Handle cell click: update board, send update to Supabase if this client is current player
  const handleCellClick = async (row, col) => {
    if (
      !player ||
      !game ||
      game.winner ||
      game.is_draw ||
      game.next_player !== player.mark
    )
      return;

    if (game.board[row][col]) {
      return; // Already filled
    }
    // Deep copy board
    const newBoard = game.board.map((r, i) =>
      i === row ? r.map((cell, j) => (j === col ? player.mark : cell)) : r.slice()
    );
    const winner = calculateWinner(newBoard);
    const draw = !winner && isDraw(newBoard);

    // Update next player
    const nextMark = player.mark === "X" ? "O" : "X";
    let newScores = { ...game.scores };
    if (winner) {
      newScores[winner] = (newScores[winner] || 0) + 1;
    }
    await supabase
      .from("games")
      .update({
        board: newBoard,
        next_player: nextMark,
        winner: winner,
        is_draw: draw,
        status: winner || draw ? "finished" : "ongoing",
        scores: newScores,
        current_turn_player_id: null, // Could enhance to enforce player switching
      })
      .eq("id", GAME_LOBBY_ID);
    // Realtime will update
  };

  // PUBLIC_INTERFACE
  // Restart handler: clears board, resets states (scores remain)
  const handleRestart = async () => {
    if (!game) return;
    await supabase
      .from("games")
      .update({
        board: emptyBoard(),
        next_player: "X",
        winner: null,
        is_draw: false,
        status: game.players.length < 2 ? "waiting" : "ongoing",
        current_turn_player_id: null,
      })
      .eq("id", GAME_LOBBY_ID);
  };

  // Remove player from DB on page unload
  useEffect(() => {
    const cleanup = async () => {
      if (!player) return;
      let { data: gameRow } = await supabase
        .from("games")
        .select("players")
        .eq("id", GAME_LOBBY_ID)
        .single();
      if (!gameRow) return;
      const updatedPlayers = gameRow.players.filter((p) => p.id !== player.id);
      await supabase
        .from("games")
        .update({
          players: updatedPlayers,
          status: updatedPlayers.length < 2 ? "waiting" : game.status,
        })
        .eq("id", GAME_LOBBY_ID);
    };
    window.addEventListener("beforeunload", cleanup);
    return () => {
      window.removeEventListener("beforeunload", cleanup);
      cleanup();
    };
    // eslint-disable-next-line
  }, [player]);

  const availableMarks = ["X", "O"].filter(
    (m) => !game || !game.players || !game.players.find((p) => p.mark === m)
  );
  const canPlay = player && game && !game.winner && !game.is_draw && game.next_player === player.mark;

  return (
    <div className="App">
      <header className="App-header" style={{ minHeight: "unset" }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          style={{ top: 18, right: 18 }}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <h1 style={{ fontWeight: 900, margin: "16px 0", fontSize: "2.2em", color: "var(--primary, #1a73e8)" }}>
          Tic Tac Toe
        </h1>
        <p style={{ color: "#666", marginBottom: 12 }}>Play online with a friend in real time!</p>
        {loading && (
          <div style={{ margin: 30 }}>Loading game...</div>
        )}
        {!player && game && (
          <PlayerJoin onJoin={handleJoin} availableMarks={availableMarks} />
        )}
        {joinError && <div style={{ color: "red", margin: "8px 0" }}>{joinError}</div>}
        {player && game && (
          <>
            <StatusBar
              turnPlayerName={getTurnName()}
              scores={game.scores || { X: 0, O: 0 }}
              winner={game.winner}
              isDraw={game.is_draw}
              onRestart={handleRestart}
              gameStatus={game.status}
            />
            <div>
              <Board
                board={game.board}
                onCellClick={handleCellClick}
                disabled={!canPlay}
              />
            </div>
            <div style={{ margin: "14px auto 8px", color: "#777", maxWidth: 430 }}>
              <div>
                You are: <b>{player.mark}</b>{" "}
                <span style={{ color: player.mark === "X" ? "#1a73e8" : "#f44336" }}>{player.name}</span>
              </div>
              <div>
                Your session id: <span style={{ fontFamily: "monospace", fontSize: "0.98em" }}>{player.id?.slice(-10)}</span>
              </div>
              <div style={{ fontSize: "0.9em", marginTop: 8 }}>
                Waiting for a friend to join as the other player!
              </div>
            </div>
          </>
        )}
        <div style={{
          marginTop: 20,
          color: "#bbb",
          fontSize: "0.98em"
        }}>
          Powered by React &bull; Real-time by Supabase
        </div>
      </header>
    </div>
  );
}

export default App;
