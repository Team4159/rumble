import {
  createEntityAdapter,
  createSlice,
  EntityId,
  PayloadAction,
} from '@reduxjs/toolkit';

import moment from 'moment';

import {
  RumbleGame,
  RumbleGamePhase,
  RumblePhaseChangeEvent,
  RumbleGameScoringEvent,
} from '../types';

export const gamesAdapter = createEntityAdapter<RumbleGame>({
  selectId: (game) => `${game.teamNumber}/${game.number}`,
  sortComparer: (a, b) => {
    if (a.teamNumber !== b.teamNumber) {
      return a.teamNumber - b.teamNumber;
    }
    return a.number - b.number;
  },
});

const GAME_STATE_DEFAULTS = {
  phase: RumbleGamePhase.PRE,
  score: 0,
  scoringHistory: [] as RumbleGameScoringEvent[],
  phaseHistory: [] as RumblePhaseChangeEvent[],
};

const gamesSlice = createSlice({
  name: 'games',
  initialState: gamesAdapter.getInitialState({
    currentGameId: null,
  }),
  reducers: {
    addGame: {
      reducer: gamesAdapter.addOne,
      prepare: (payload: { number: number; teamNumber: number }) => {
        return {
          payload: {
            number: payload.number,
            teamNumber: payload.teamNumber,
            ...GAME_STATE_DEFAULTS,
          },
        };
      },
    },
    focusGame: {
      reducer: (state, action: PayloadAction<EntityId>) => {
        state.currentGameId = action.payload;
        return state;
      },
      prepare: (payload: { number: number; teamNumber: number }) => {
        return {
          payload: gamesAdapter.selectId({
            ...payload,
            ...GAME_STATE_DEFAULTS,
          }),
        };
      },
    },
    resetGame: (state) => {
      return gamesAdapter.updateOne(state, {
        id: state.currentGameId,
        changes: GAME_STATE_DEFAULTS,
      });
    },
    addScoringEvent: {
      reducer: (state, action: PayloadAction<RumbleGameScoringEvent>) => {
        const currentGame = gamesAdapter
          .getSelectors()
          .selectById(state, state.currentGameId);
        return gamesAdapter.updateOne(state, {
          id: state.currentGameId,
          changes: {
            score: currentGame.score + action.payload.points,
            scoringHistory: [...currentGame.scoringHistory, action.payload],
          },
        });
      },
      prepare: (payload: { type: string; points: number }) => {
        return {
          payload: {
            timestamp: parseInt(moment().format('x'), 10),
            type: payload.type,
            points: payload.points,
          },
        };
      },
    },
    addPhaseChangeEvent: {
      reducer: (state, action: PayloadAction<RumblePhaseChangeEvent>) => {
        const currentGame = gamesAdapter
          .getSelectors()
          .selectById(state, state.currentGameId);
        return gamesAdapter.updateOne(state, {
          id: state.currentGameId,
          changes: {
            phase: action.payload.phase,
            phaseHistory: [...currentGame.phaseHistory, action.payload],
          },
        });
      },
      prepare: (phase: RumbleGamePhase) => {
        return {
          payload: {
            timestamp: parseInt(moment().format('x'), 10),
            phase,
          },
        };
      },
    },
    undoLastScoringEvent: (state) => {
      const currentGame = gamesAdapter
        .getSelectors()
        .selectById(state, state.currentGameId);
      const undoneScoringEvent = currentGame.scoringHistory.pop();
      return gamesAdapter.updateOne(state, {
        id: state.currentGameId,
        changes: {
          score: undoneScoringEvent
            ? currentGame.score - undoneScoringEvent.points
            : GAME_STATE_DEFAULTS.score,
          scoringHistory: currentGame.scoringHistory,
        },
      });
    },
    undoLastPhaseChangeEvent: (state) => {
      const currentGame = gamesAdapter
        .getSelectors()
        .selectById(state, state.currentGameId);
      currentGame.phaseHistory.pop();
      const lastPhaseChangeEvent =
        currentGame.phaseHistory[currentGame.phaseHistory.length - 1];
      return gamesAdapter.updateOne(state, {
        id: state.currentGameId,
        changes: {
          phase: lastPhaseChangeEvent
            ? lastPhaseChangeEvent.phase
            : GAME_STATE_DEFAULTS.phase,
          phaseHistory: currentGame.phaseHistory,
        },
      });
    },
  },
});

export const {
  addGame,
  focusGame,
  resetGame,
  addScoringEvent,
  addPhaseChangeEvent,
  undoLastScoringEvent,
  undoLastPhaseChangeEvent,
} = gamesSlice.actions;
export const gamesReducer = gamesSlice.reducer;
export const gamesSelectors = gamesAdapter.getSelectors();
