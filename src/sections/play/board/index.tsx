import { Grid } from "@mui/material";
import { Chessboard } from "react-chessboard";
import { useAtomValue, useSetAtom } from "jotai";
import {
  clickedSquaresAtom,
  engineSkillLevelAtom,
  gameAtom,
  playerColorAtom,
} from "../states";
import { Square } from "react-chessboard/dist/chessboard/types";
import { useChessActions } from "@/hooks/useChessActions";
import { useEffect, useRef } from "react";
import PlayerInfo from "./playerInfo";
import { useScreenSize } from "@/hooks/useScreenSize";
import { Color, EngineName } from "@/types/enums";
import SquareRenderer from "./squareRenderer";
import { useEngine } from "@/hooks/useEngine";
import { uciMoveParams } from "@/lib/chess";

export default function Board() {
  const boardRef = useRef<HTMLDivElement>(null);
  const { boardSize } = useScreenSize();
  const game = useAtomValue(gameAtom);
  const playerColor = useAtomValue(playerColorAtom);
  const { makeMove: makeBoardMove } = useChessActions(gameAtom);
  const setClickedSquares = useSetAtom(clickedSquaresAtom);
  const engineSkillLevel = useAtomValue(engineSkillLevelAtom);
  const engine = useEngine(EngineName.Stockfish16);

  const gameFen = game.fen();
  const turn = game.turn();

  useEffect(() => {
    const playEngineMove = async () => {
      if (!engine?.isReady() || turn === playerColor) return;
      const move = await engine.getEngineNextMove(
        gameFen,
        engineSkillLevel - 1
      );
      makeBoardMove(uciMoveParams(move));
    };
    playEngineMove();
  }, [engine, turn, engine, playerColor, engineSkillLevel]);

  useEffect(() => {
    setClickedSquares([]);
  }, [gameFen, setClickedSquares]);

  const onPieceDrop = (
    source: Square,
    target: Square,
    piece: string
  ): boolean => {
    if (!piece || piece[0] !== playerColor) return false;
    try {
      const result = makeBoardMove({
        from: source,
        to: target,
        promotion: piece[1]?.toLowerCase() ?? "q",
      });

      return !!result;
    } catch {
      return false;
    }
  };

  const isPieceDraggable = ({ piece }: { piece: string }): boolean => {
    if (!piece) return false;
    return playerColor === piece[0];
  };

  return (
    <Grid
      item
      container
      rowGap={1}
      justifyContent="center"
      alignItems="center"
      width={boardSize}
      maxWidth="85vh"
    >
      <PlayerInfo
        color={playerColor === Color.White ? Color.Black : Color.White}
      />

      <Grid
        item
        container
        justifyContent="center"
        alignItems="center"
        ref={boardRef}
        xs={12}
      >
        <Chessboard
          id="AnalysisBoard"
          position={gameFen}
          onPieceDrop={onPieceDrop}
          boardOrientation={playerColor ? "white" : "black"}
          customBoardStyle={{
            borderRadius: "5px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          }}
          isDraggablePiece={isPieceDraggable}
          customSquare={SquareRenderer}
        />
      </Grid>

      <PlayerInfo color={playerColor} />
    </Grid>
  );
}
