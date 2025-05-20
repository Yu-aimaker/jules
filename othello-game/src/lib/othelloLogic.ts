// src/lib/othelloLogic.ts
export type Player = 'black' | 'white';
export type CellState = Player | 'empty';
export type BoardState = CellState[][];

export const BOARD_SIZE = 8;

export const createInitialBoard = (): BoardState => {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill('empty')) as BoardState;
  board[3][3] = 'white';
  board[3][4] = 'black';
  board[4][3] = 'black';
  board[4][4] = 'white';
  return board;
};

// 指定された方向に相手の石を裏返せるかチェックし、裏返せる石のリストを返す
const getFlippableStonesInDirection = (
  board: BoardState,
  row: number,
  col: number,
  player: Player,
  dr: number, // row direction
  dc: number  // col direction
): { r: number; c: number }[] => {
  const opponent: Player = player === 'black' ? 'white' : 'black';
  const flippable: { r: number; c: number }[] = [];
  let r = row + dr;
  let c = col + dc;

  // 盤外、空、または自分の石に当たるまで進む
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
    if (board[r][c] === 'empty') {
      return []; // 空白なら裏返せない
    }
    if (board[r][c] === player) {
      return flippable; // 自分の石に到達したら、それまでの相手の石を返す
    }
    // 相手の石ならリストに追加
    flippable.push({ r, c });
    r += dr;
    c += dc;
  }
  return []; // 盤外に出たら裏返せない
};

export const getValidMoves = (board: BoardState, player: Player): { row: number; col: number }[] => {
  const validMoves: { row: number; col: number }[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 'empty') {
        // 8方向すべてをチェック
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue; // 自分自身はスキップ
            if (getFlippableStonesInDirection(board, r, c, player, dr, dc).length > 0) {
              validMoves.push({ row: r, col: c });
              // 1方向でも裏返せれば有効な手なので、他の方向のチェックは不要
              dr = 2; // 外側のループを抜けるためのトリック
              break;
            }
          }
        }
      }
    }
  }
  return validMoves;
};

export const placeStone = (
  board: BoardState,
  row: number,
  col: number,
  player: Player
): BoardState | null => {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE || board[row][col] !== 'empty') {
    return null; // 無効な場所
  }

  let stonesToFlip: { r: number; c: number }[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      stonesToFlip = stonesToFlip.concat(
        getFlippableStonesInDirection(board, row, col, player, dr, dc)
      );
    }
  }

  if (stonesToFlip.length === 0) {
    return null; // 裏返せる石がない場合は置けない
  }

  const newBoard = board.map(r => [...r]); // ボードをディープコピー
  newBoard[row][col] = player;
  stonesToFlip.forEach(stone => {
    newBoard[stone.r][stone.c] = player;
  });

  return newBoard;
};

export const countStones = (board: BoardState): { black: number; white: number } => {
  let black = 0;
  let white = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 'black') black++;
      else if (board[r][c] === 'white') white++;
    }
  }
  return { black, white };
};

export type GameResult = {
  isGameOver: boolean;
  winner: Player | 'draw' | null;
  scores: { black: number; white: number };
};

export const checkGameEnd = (board: BoardState, currentPlayer: Player): GameResult => {
  const scores = countStones(board);
  const currentPlayerValidMoves = getValidMoves(board, currentPlayer);
  const opponent: Player = currentPlayer === 'black' ? 'white' : 'black';
  const opponentValidMoves = getValidMoves(board, opponent);

  if (currentPlayerValidMoves.length === 0 && opponentValidMoves.length === 0) {
    // 両者とも打つ手がない
    let winner: Player | 'draw' = 'draw';
    if (scores.black > scores.white) winner = 'black';
    else if (scores.white > scores.black) winner = 'white';
    return { isGameOver: true, winner, scores };
  }

  // 盤面がすべて埋まった場合も終了 (getValidMovesが空になる条件に含まれることが多いが念のため)
  if (scores.black + scores.white === BOARD_SIZE * BOARD_SIZE) {
    let winner: Player | 'draw' = 'draw';
    if (scores.black > scores.white) winner = 'black';
    else if (scores.white > scores.black) winner = 'white';
    return { isGameOver: true, winner, scores };
  }

  return { isGameOver: false, winner: null, scores };
};

export const getRandomMove = (validMoves: { row: number; col: number }[]): { row: number; col: number } | null => {
  if (validMoves.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return validMoves[randomIndex];
};
