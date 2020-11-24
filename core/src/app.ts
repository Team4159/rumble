import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import gamesReducer, {
  addGame,
  focusGame,
  addScoringEvent,
  addRobotPhaseChangeEvent,
} from '@/slices/games';
import { RumbleGamePhase } from '@/types';

const reducer = {
  games: gamesReducer,
};

const preloadedState = {};

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  devTools: process.env.NODE_ENV !== 'production',
  preloadedState,
});

store.dispatch(
  addGame({
    number: 1,
    teamNumber: 1,
  })
);
store.dispatch(
  focusGame({
    number: 1,
    teamNumber: 1,
  })
);
store.dispatch(addRobotPhaseChangeEvent(RumbleGamePhase.AUTONOMOUS));
store.dispatch(
  addScoringEvent({
    type: 'CUBE',
    points: 5,
  })
);
