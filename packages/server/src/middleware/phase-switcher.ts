import { Middleware } from 'redux';

import {
  gamesSelectors,
  addPhaseChangeEvent,
  RumbleGamePhase,
} from '@rumble/core';

import { RootState } from '@/app';

const PHASE_LENGTHS: { [key: string]: number } = {
  AUTONOMOUS: 30,
  TELEOPERATED: 90,
  ENDGAME: 15,
};
let timeout: NodeJS.Timeout;

const phaseSwitcherMiddleware: Middleware<{}, RootState> = (store) => {
  return (next) => (action) => {
    const result = next(action);
    const newState = store.getState();
    if (
      action.type === 'games/undoLastPhaseChangeEvent' ||
      action.type === 'games/addPhaseChangeEvent' ||
      action.type === 'games/resetGame'
    ) {
      const currentGame = gamesSelectors.selectById(
        newState.games,
        newState.games.currentGameId
      );
      if (!currentGame) {
        return result;
      }
      if (timeout) {
        clearTimeout(timeout);
      }
      if (PHASE_LENGTHS[RumbleGamePhase[currentGame.phase]]) {
        timeout = setTimeout(() => {
          store.dispatch(addPhaseChangeEvent(currentGame.phase + 1));
        }, PHASE_LENGTHS[RumbleGamePhase[currentGame.phase]] * 1000);
      }
    }
    return result;
  };
};

export default phaseSwitcherMiddleware;
