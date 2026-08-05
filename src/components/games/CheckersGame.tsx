import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { I18N } from '../../data/i18n';
import { playAudioFeedback } from '../../lib/audio';

interface CheckersGameProps {
  lang: Language;
  level: number;
  onFinish: (isWin: boolean) => void;
}

interface Move {
  from: number;
  to: number;
  jump?: number;
}

export const CheckersGame: React.FC<CheckersGameProps> = ({ lang, level, onFinish }) => {
  const t = I18N[lang];
  const [board, setBoard] = useState<number[]>([]);
  const [turn, setTurn] = useState<number>(0); // 0: Player (White), 1: Bot (Black)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [multiJumpIdx, setMultiJumpIdx] = useState<number | null>(null);

  useEffect(() => {
    initBoard();
  }, [level]);

  useEffect(() => {
    if (board.length === 0) return;

    if (turn === 1) {
      const timer = setTimeout(() => {
        let moves = [];
        if (multiJumpIdx !== null) {
          const { jumps } = getMovesForPiece(board, multiJumpIdx, -1);
          moves = jumps;
        } else {
          moves = getAllMoves(board, -1);
        }

        if (moves.length === 0) {
          onFinish(true);
          return;
        }

        const chosen = moves[Math.floor(Math.random() * moves.length)];
        applyMove(chosen, board);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      const pMoves = getAllMoves(board, 1);
      if (pMoves.length === 0) {
        setTimeout(() => onFinish(false), 600);
      }
    }
  }, [turn, board, multiJumpIdx]);

  const initBoard = () => {
    const newBoard = Array(64).fill(0);
    const rBot = level < 5 ? [2] : level < 10 ? [1, 2] : [0, 1, 2];
    const rPlayer = level < 5 ? [5] : level < 10 ? [5, 6] : [5, 6, 7];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          if (rBot.includes(r)) newBoard[r * 8 + c] = -1;
          if (rPlayer.includes(r)) newBoard[r * 8 + c] = 1;
        }
      }
    }

    setBoard(newBoard);
    setTurn(0);
    setSelectedIdx(null);
    setMultiJumpIdx(null);
  };

  const getMovesForPiece = (currentBoard: number[], i: number, player: number): { moves: Move[]; jumps: Move[] } => {
    const piece = currentBoard[i];
    const moves: Move[] = [];
    const jumps: Move[] = [];

    if ((player > 0 && piece <= 0) || (player < 0 && piece >= 0)) {
      return { moves, jumps };
    }

    const r = Math.floor(i / 8);
    const c = i % 8;
    const isKing = Math.abs(piece) === 2;
    const allDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    if (!isKing) {
      // Man simple moves forward
      const forwardDirs = player === 1 ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
      for (const [dr, dc] of forwardDirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && currentBoard[nr * 8 + nc] === 0) {
          moves.push({ from: i, to: nr * 8 + nc });
        }
      }

      // Man captures in all 4 diagonal directions
      for (const [dr, dc] of allDirs) {
        const nr = r + dr;
        const nc = c + dc;
        const jr = r + dr * 2;
        const jc = c + dc * 2;
        if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8) {
          const victim = currentBoard[nr * 8 + nc];
          const target = currentBoard[jr * 8 + jc];
          if (victim !== 0 && Math.sign(victim) !== Math.sign(player) && target === 0) {
            jumps.push({ from: i, to: jr * 8 + jc, jump: nr * 8 + nc });
          }
        }
      }
    } else {
      // King sliding moves & captures
      for (const [dr, dc] of allDirs) {
        let step = 1;
        let encounteredEnemy: number | null = null;

        while (true) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;

          const targetIdx = nr * 8 + nc;
          const cellVal = currentBoard[targetIdx];

          if (cellVal === 0) {
            if (encounteredEnemy === null) {
              moves.push({ from: i, to: targetIdx });
            } else {
              jumps.push({ from: i, to: targetIdx, jump: encounteredEnemy });
            }
          } else if (Math.sign(cellVal) === Math.sign(player)) {
            break; // friendly piece blocks
          } else {
            // Enemy piece
            if (encounteredEnemy !== null) {
              break; // 2 enemy pieces in row blocks
            } else {
              encounteredEnemy = targetIdx;
            }
          }
          step++;
        }
      }
    }

    return { moves, jumps };
  };

  const getAllMoves = (currentBoard: number[], player: number): Move[] => {
    let allMoves: Move[] = [];
    let allJumps: Move[] = [];

    for (let i = 0; i < 64; i++) {
      if ((player > 0 && currentBoard[i] > 0) || (player < 0 && currentBoard[i] < 0)) {
        const { moves, jumps } = getMovesForPiece(currentBoard, i, player);
        allMoves = [...allMoves, ...moves];
        allJumps = [...allJumps, ...jumps];
      }
    }

    return allJumps.length > 0 ? allJumps : allMoves;
  };

  const applyMove = (move: Move, boardState: number[]) => {
    const isJump = move.jump !== undefined;
    playAudioFeedback(isJump ? 'success' : 'click');

    const newBoard = [...boardState];
    let piece = newBoard[move.from];
    newBoard[move.from] = 0;

    if (isJump && move.jump !== undefined) {
      newBoard[move.jump] = 0;
    }

    const isPlayer = piece > 0;

    // Promotion
    if (isPlayer && Math.floor(move.to / 8) === 0) piece = 2; // White King
    if (!isPlayer && Math.floor(move.to / 8) === 7) piece = -2; // Black King

    newBoard[move.to] = piece;
    setBoard(newBoard);

    // Check Win/Lose
    const pCount = newBoard.filter(x => x > 0).length;
    const bCount = newBoard.filter(x => x < 0).length;

    if (bCount === 0) {
      setSelectedIdx(null);
      setMultiJumpIdx(null);
      setTimeout(() => onFinish(true), 600);
      return;
    }
    if (pCount === 0) {
      setSelectedIdx(null);
      setMultiJumpIdx(null);
      setTimeout(() => onFinish(false), 600);
      return;
    }

    // Multi-jump check
    if (isJump) {
      const { jumps: multiJumps } = getMovesForPiece(newBoard, move.to, isPlayer ? 1 : -1);
      if (multiJumps.length > 0) {
        setMultiJumpIdx(move.to);
        if (isPlayer) {
          setSelectedIdx(move.to);
        }
        return; // Turn does not change
      }
    }

    setMultiJumpIdx(null);
    setSelectedIdx(null);
    setTurn(isPlayer ? 1 : 0);
  };

  const playerMoves = turn === 0 ? getAllMoves(board, 1) : [];

  const handleCellClick = (i: number) => {
    if (turn !== 0) return;

    // If in multi-jump mode, only moves from multiJumpIdx are valid
    if (multiJumpIdx !== null) {
      const validMove = playerMoves.find(m => m.from === multiJumpIdx && m.to === i);
      if (validMove) {
        applyMove(validMove, board);
      }
      return;
    }

    const piece = board[i];

    // If a piece is already selected, check if target is valid move
    if (selectedIdx !== null) {
      const validMove = playerMoves.find(m => m.from === selectedIdx && m.to === i);
      if (validMove) {
        applyMove(validMove, board);
        return;
      }
    }

    // Select piece if it belongs to player and has valid moves
    if (piece > 0) {
      const movesForPiece = playerMoves.filter(m => m.from === i);
      if (movesForPiece.length > 0) {
        playAudioFeedback('click');
        setSelectedIdx(i);
      } else {
        setSelectedIdx(null);
      }
    } else {
      setSelectedIdx(null);
    }
  };

  const pScore = board.filter(x => x > 0).length;
  const bScore = board.filter(x => x < 0).length;

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="grid grid-cols-8 grid-rows-8 border-4 border-slate-900 w-full max-w-[340px] sm:max-w-md aspect-square shadow-xl rounded-xl overflow-hidden bg-amber-50">
        {board.map((piece, i) => {
          const r = Math.floor(i / 8);
          const c = i % 8;
          const isDarkCell = (r + c) % 2 === 1;

          const isSelected = selectedIdx === i;
          const isValidMoveTarget =
            turn === 0 &&
            selectedIdx !== null &&
            playerMoves.some(m => m.from === selectedIdx && m.to === i);

          return (
            <div
              key={i}
              onClick={() => handleCellClick(i)}
              className={`relative flex items-center justify-center cursor-pointer select-none transition-colors ${
                isDarkCell ? 'bg-amber-900/90' : 'bg-amber-100'
              }`}
            >
              {piece !== 0 && (
                <div
                  className={`absolute w-[80%] h-[80%] rounded-full flex items-center justify-center font-black transition-all duration-150 shadow-md ${
                    piece > 0
                      ? 'bg-gradient-to-b from-slate-50 to-slate-200 border-2 border-slate-400 text-amber-500'
                      : 'bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-slate-600 text-amber-400'
                  } ${isSelected ? 'ring-4 ring-indigo-500 scale-105 z-10' : ''}`}
                >
                  {Math.abs(piece) === 2 && (
                    <i className="fa-solid fa-crown text-[10px] sm:text-sm drop-shadow-sm"></i>
                  )}
                </div>
              )}

              {isValidMoveTarget && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/90 ring-4 ring-emerald-300 animate-pulse shadow-md"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center w-full max-w-[340px] sm:max-w-md bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-slate-400 shadow-xs flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          </div>
          <span className="font-bold text-slate-800">{pScore}</span>
        </div>
        <div className="font-black text-indigo-600 text-xs sm:text-sm uppercase tracking-wide">
          {turn === 0 ? t.chkPlayerTurn : t.chkBotTurn}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">{bScore}</span>
          <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 shadow-xs flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-slate-700"></span>
          </div>
        </div>
      </div>
    </div>
  );
};
