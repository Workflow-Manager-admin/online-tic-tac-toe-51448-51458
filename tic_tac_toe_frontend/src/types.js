/**
 * Board is a 3x3 array for tic tac toe.
 * Values: 'X' | 'O' | null
 */
export type Player = 'X' | 'O';
export type Mark = Player | null;

export interface GameState {
  board: Mark[][];
  nextPlayer: Player;
  winner: Player | null;
  isDraw: boolean;
  id: string;
  scores: { [k in Player]: number };
  status: 'waiting' | 'ongoing' | 'finished';
  players: Array<{ id: string; mark: Player; name: string }>;
  currentTurnPlayerId: string | null;
  created_at?: string;
}
