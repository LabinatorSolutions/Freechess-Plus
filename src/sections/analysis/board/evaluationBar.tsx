import { Box, Grid, Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import {
  boardAtom,
  boardOrientationAtom,
  currentPositionAtom,
} from "../states";
import { getEvaluationBarValue } from "@/lib/chess";

interface Props {
  height: number;
}

export default function EvaluationBar({ height }: Props) {
  const [evalBar, setEvalBar] = useState({
    whiteBarPercentage: 50,
    label: "0.0",
  });
  const board = useAtomValue(boardAtom);
  const boardOrientation = useAtomValue(boardOrientationAtom);
  const position = useAtomValue(currentPositionAtom);

  const isWhiteToPlay = board.turn() === "w";

  useEffect(() => {
    const bestLine = position?.eval?.lines[0];
    if (!position.eval || !bestLine || bestLine.depth < 6) return;

    const evalBar = getEvaluationBarValue(position.eval);
    setEvalBar(evalBar);
  }, [position, isWhiteToPlay]);

  return (
    <Grid
      item
      container
      justifyContent="center"
      alignItems="center"
      width="2rem"
      height={height}
      border="1px solid black"
      borderRadius="5px"
    >
      <Box
        sx={{ backgroundColor: boardOrientation ? "#424242" : "white" }}
        height={`${
          boardOrientation
            ? 100 - evalBar.whiteBarPercentage
            : evalBar.whiteBarPercentage
        }%`}
        width="100%"
        borderRadius={
          evalBar.whiteBarPercentage === 100 ? "5px" : "5px 5px 0 0"
        }
      >
        <Typography
          color={boardOrientation ? "white" : "black"}
          textAlign="center"
          width="100%"
        >
          {(evalBar.whiteBarPercentage < 50 && boardOrientation) ||
          (evalBar.whiteBarPercentage >= 50 && !boardOrientation)
            ? evalBar.label
            : ""}
        </Typography>
      </Box>

      <Box
        sx={{ backgroundColor: boardOrientation ? "white" : "#424242" }}
        height={`${
          boardOrientation
            ? evalBar.whiteBarPercentage
            : 100 - evalBar.whiteBarPercentage
        }%`}
        width={"100%"}
        display="flex"
        alignItems="flex-end"
        borderRadius={
          evalBar.whiteBarPercentage === 100 ? "5px" : "0 0 5px 5px"
        }
      >
        <Typography
          color={boardOrientation ? "black" : "white"}
          textAlign="center"
          width="100%"
        >
          {(evalBar.whiteBarPercentage >= 50 && boardOrientation) ||
          (evalBar.whiteBarPercentage < 50 && !boardOrientation)
            ? evalBar.label
            : ""}
        </Typography>
      </Box>
    </Grid>
  );
}
