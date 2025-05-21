// src/components/Board.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  BoardState, Player, createInitialBoard, placeStone, getValidMoves,
  checkGameEnd, GameResult, getRandomMove, CellState // CellState をインポート
} from '@/lib/othelloLogic';

export type GameMode = 'pvp' | 'pvc';

interface CellProps {
  value: CellState; // 型を CellState に変更
  isHint?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const Cell: React.FC<CellProps> = ({ value, isHint, onClick, disabled }) => {
  const cellBaseStyle = "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 border border-black/30 flex items-center justify-center transition-colors duration-150";
  let cellColor = 'bg-board'; // Tailwind config の色
  if (!disabled) {
    cellColor += ' hover:bg-board-hover';
  }

  let piece = null;
  if (value === 'black') {
    piece = <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-piece-black shadow-lg border-2 border-black/50 transform group-hover:scale-105 transition-transform"></div>;
  } else if (value === 'white') {
    piece = <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-piece-white shadow-lg border-2 border-black/20 transform group-hover:scale-105 transition-transform"></div>;
  } else if (isHint && !disabled) {
    piece = <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/20 group-hover:bg-black/30"></div>;
  }

  return (
    <div
      className={`${cellBaseStyle} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer group'} ${cellColor}`}
      onClick={disabled ? undefined : onClick}
    >
      {piece}
    </div>
  );
};

interface BoardProps {
  gameMode: GameMode;
  playerColor?: Player;
}

const Board: React.FC<BoardProps> = ({ gameMode, playerColor = 'black' }) => {
  const [board, setBoard] = useState<BoardState>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [validMoves, setValidMoves] = useState<{row: number, col: number}[]>([]);
  const [gameResult, setGameResult] = useState<GameResult>({
    isGameOver: false, winner: null, scores: { black: 2, white: 2 },
  });
  const [isCpuThinking, setIsCpuThinking] = useState(false);
  const cpuPlayer: Player | null = gameMode === 'pvc' ? (playerColor === 'black' ? 'white' : 'black') : null;

  const updateValidMoves = useCallback((currentBoard: BoardState, player: Player) => {
    setValidMoves(getValidMoves(currentBoard, player));
  }, []);

  useEffect(() => {
    if (!gameResult.isGameOver) {
        updateValidMoves(board, currentPlayer);
    } else {
        setValidMoves([]);
    }
  }, [board, currentPlayer, gameResult.isGameOver, updateValidMoves]);

  const performMove = useCallback((row: number, col: number, player: Player): BoardState | null => {
    let newBoardState: BoardState | null = null;
    setBoard(currentBoard => {
        const result = placeStone(currentBoard, row, col, player);
        newBoardState = result;
        return result ? result : currentBoard;
    });
    return newBoardState;
  }, []);

  const processNextTurn = useCallback((currentBoard: BoardState, previousPlayer: Player) => {
    const endCheckResultEarly = checkGameEnd(currentBoard, previousPlayer);
    if (endCheckResultEarly.isGameOver) {
      setGameResult(endCheckResultEarly);
      // setIsCpuThinking(false); // CPU思考中表示の調整で追加検討 -> useEffect で対応
      return;
    }

    let nextPlayer: Player = previousPlayer === 'black' ? 'white' : 'black';
    const opponentValidMoves = getValidMoves(currentBoard, nextPlayer);
    let playerToSet = nextPlayer;

    if (opponentValidMoves.length === 0) {
      const myNextValidMoves = getValidMoves(currentBoard, previousPlayer);
      if (myNextValidMoves.length > 0) {
        playerToSet = previousPlayer;
        console.log(`${nextPlayer} has no moves, ${previousPlayer} plays again.`);
      } else {
        console.log("Both players have no moves. Game Over by pass-pass.");
        const endResult = checkGameEnd(currentBoard, previousPlayer);
        setGameResult(endResult);
        // setIsCpuThinking(false); // CPU思考中表示の調整で追加検討 -> useEffect で対応
        return;
      }
    }
    
    setCurrentPlayer(playerToSet);
    const endCheckResultLater = checkGameEnd(currentBoard, playerToSet);
    if (endCheckResultLater.isGameOver) {
      setGameResult(endCheckResultLater);
      // setIsCpuThinking(false); // CPU思考中表示の調整で追加検討 -> useEffect で対応
    }
  }, []);

  const handleCellClick = useCallback(async (row: number, col: number) => {
    if (gameResult.isGameOver || (gameMode === 'pvc' && currentPlayer === cpuPlayer) || isCpuThinking) {
        return;
    }
    const newBoard = performMove(row, col, currentPlayer);
    if (newBoard) {
      processNextTurn(newBoard, currentPlayer);
    }
  }, [gameResult.isGameOver, gameMode, currentPlayer, cpuPlayer, isCpuThinking, performMove, processNextTurn]);

  // useEffect for CPU turn in src/components/Board.tsx
  useEffect(() => {
    if (gameMode === 'pvc' && currentPlayer === cpuPlayer && !gameResult.isGameOver) { // isCpuThinking を条件から外す
      setIsCpuThinking(true);
      setTimeout(() => {
        // ゲームが既に終了していたら何もしない
        if (gameResult.isGameOver) { // このチェックはsetTimeoutが実行される時点のgameResultを見る
          setIsCpuThinking(false);
          return;
        }
        const currentValidMoves = getValidMoves(board, cpuPlayer);
        const cpuMove = getRandomMove(currentValidMoves);
        if (cpuMove) {
          const newBoard = performMove(cpuMove.row, cpuMove.col, cpuPlayer);
          if (newBoard) {
            // newBoard を使って次のターン処理とゲーム終了チェック
            processNextTurn(newBoard, cpuPlayer); 
          } else { 
            // performMove が null を返した場合 (通常は起こり得ないが念のため)
            processNextTurn(board, cpuPlayer);
          }
        } else {
          // CPUが打つ手がない場合 (パス)
          processNextTurn(board, cpuPlayer);
        }
        // processNextTurn の中で gameResult.isGameOver が true になった可能性があるので、
        // ここで setIsCpuThinking(false) を呼ぶのは、processNextTurn の実行後、
        // gameResult の状態をみて判断するか、processNextTurn 側で制御する。
        // ただし、processNextTurn は useCallback でメモ化されており、
        // isCpuThinking を直接変更できない。
        // 一旦、現行のsetIsCpuThinking(false)は削除し、processNextTurnに委ねるか、
        // processNextTurnの後にgameResultを見て判断する。
        // シンプルにするため、processNextTurnが終了状態をセットした後、
        // このuseEffectの再実行時にisGameOverがtrueなら思考しない、という流れに任せる。
        // ただし、これだとCPUが手を打った直後に一瞬表示が残る可能性はまだある。

        // より確実なのは、processNextTurn が isGameOver を更新したことを受けて、
        // 別の useEffect で isCpuThinking を false にすること。
        // または、processNextTurn が isCpuThinking を false にする責務も持つ。
        // 今回は、processNextTurn に setIsCpuThinking を渡すのは複雑なので、
        // gameResult.isGameOver の変更をトリガーにする。
      }, 700);
    } else if (gameResult.isGameOver && isCpuThinking) {
      // ゲームが終了したら確実にCPU思考中フラグをfalseにする
      setIsCpuThinking(false);
    }
  }, [gameMode, currentPlayer, cpuPlayer, gameResult.isGameOver, board, performMove, processNextTurn, isCpuThinking]); // isCpuThinking を依存配列に追加

  // CPU思考中フラグ管理用のuseEffect (gameResult.isGameOver の変更を検知するuseEffect)
  // このuseEffectは、CPUターン処理のuseEffectの else if ブロックと重複する可能性があるが、
  // gameResult.isGameOverの変更をトリガーとしてisCpuThinkingを確実にfalseにするために残す。
  useEffect(() => {
      if (gameResult.isGameOver && isCpuThinking) {
          setIsCpuThinking(false);
      }
      // CPUのターンが終了したとき (プレイヤーがCPUから人間に変わったとき) も思考フラグを落とす
      // この部分は上のCPUターンuseEffect内でcurrentPlayerが変わった時にisCpuThinkingがfalseになるので、
      // 重複または不要かもしれないが、念のため残す。
      if (gameMode === 'pvc' && currentPlayer !== cpuPlayer && isCpuThinking) {
        setIsCpuThinking(false);
      }
  }, [gameResult.isGameOver, isCpuThinking, currentPlayer, gameMode, cpuPlayer]);


  const handleNewGame = useCallback(() => {
    const initialBoard = createInitialBoard();
    setBoard(initialBoard);
    setCurrentPlayer('black');
    setGameResult({ isGameOver: false, winner: null, scores: checkGameEnd(initialBoard, 'black').scores });
    setIsCpuThinking(false);
  }, []);
  
  // useEffect for score updates in src/components/Board.tsx
  useEffect(() => {
    // ゲームが終了していない場合のみ、現在の盤面からスコアを計算して表示用スコアを更新
    if (!gameResult.isGameOver) {
      const currentScores = checkGameEnd(board, currentPlayer).scores;
      setGameResult(prev => ({
        ...prev, // isGameOver と winner はそのまま維持
        scores: currentScores
      }));
    }
    // ゲーム終了時のスコアは、ゲーム終了を判定した時点で checkGameEnd から取得したものが最終スコアとして設定される。
    // このuseEffectは主にプレイ中のリアルタイムスコア更新を目的とする。
  }, [board, currentPlayer, gameResult.isGameOver]); // 依存配列に gameResult.isGameOver を追加

  useEffect(() => {
    handleNewGame();
  }, [gameMode, playerColor, handleNewGame]); // handleNewGame を依存配列に追加


  return (
    <div className="p-3 sm:p-4 bg-neutral-800 rounded-xl shadow-2xl w-full">
      {/* Score and Player Info */}
      <div className="mb-4 p-3 bg-neutral-700 rounded-lg shadow-md">
        <div className="flex justify-between items-center text-lg sm:text-xl font-semibold">
          <div className={`p-2 rounded-md ${currentPlayer === 'black' ? 'bg-piece-black text-white shadow-md' : 'text-neutral-300'}`}>
            Black: {gameResult.scores.black}
          </div>
          <div className={`p-2 rounded-md ${currentPlayer === 'white' ? 'bg-piece-white text-black shadow-md' : 'text-neutral-300'}`}>
            White: {gameResult.scores.white}
          </div>
        </div>
        {!gameResult.isGameOver && (
          <div className="mt-3 text-center">
            <p className="text-lg text-white">
              Turn: <span className={`font-bold px-2 py-1 rounded ${currentPlayer === 'black' ? 'bg-piece-black text-white' : 'bg-piece-white text-black'}`}>
                {currentPlayer.toUpperCase()}
                {gameMode === 'pvc' && currentPlayer === cpuPlayer && " (CPU)"}
                {gameMode === 'pvc' && currentPlayer !== cpuPlayer && !isCpuThinking && " (You)"}
              </span>
            </p>
            {isCpuThinking && <p className="text-sm text-blue-300 mt-1 animate-pulse">CPU is thinking...</p>}
          </div>
        )}
      </div>

      {/* Board */}
      <div className="grid grid-cols-8 gap-0.5 bg-black/20 rounded-md overflow-hidden shadow-inner">
        {board.map((rowState, rowIndex) =>
          rowState.map((cellValue, colIndex) => {
            const isHint = validMoves.some(move => move.row === rowIndex && move.col === colIndex);
            // クリック可能条件を修正: isCpuThinkingがtrueの時は常にクリック不可
            const canClick = !gameResult.isGameOver && !(gameMode === 'pvc' && currentPlayer === cpuPlayer) && !isCpuThinking;
            return (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                value={cellValue}
                isHint={cellValue === 'empty' && isHint && !isCpuThinking} // CPU思考中はヒントも非表示
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={!canClick || isCpuThinking} // isCpuThinking中は常にdisabled
              />
            );
          })
        )}
      </div>

      {/* Game Over Info and New Game Button */}
      {(gameResult.isGameOver || !isCpuThinking) && ( // ゲームオーバー時、またはCPU思考中でない時に表示
         <div className="mt-5 text-center">
            {gameResult.isGameOver && (
                <div className="p-4 bg-neutral-700 rounded-lg shadow-md">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Game Over!</h2>
                    {gameResult.winner === 'draw' ? (
                        <p className="text-xl text-white">It's a Draw!</p>
                    ) : (
                        <p className="text-xl text-white">Winner: <span className={`font-bold px-2 py-1 rounded ${gameResult.winner === 'black' ? 'bg-piece-black text-white' : 'bg-piece-white text-black'}`}>{gameResult.winner?.toUpperCase()}</span></p>
                    )}
                    <p className="text-lg text-neutral-300 mt-1">Final Score: Black {gameResult.scores.black} - White {gameResult.scores.white}</p>
                </div>
            )}
            <button
                onClick={handleNewGame}
                className="mt-4 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg shadow-md transform hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-4 focus:ring-primary-light disabled:opacity-50"
                disabled={isCpuThinking} // CPU思考中は無効化
            >
                New Game
            </button>
        </div>
      )}
    </div>
  );
};

export default Board;
