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
  RumbleGameEvent,
} from '@/types';

const gamesAdapter = createEntityAdapter<RumbleGame>({
  selectId: (game) => `${game.teamNumber}/${game.number}`,
  sortComparer: (a, b) => {
    if (a.teamNumber !== b.teamNumber) {
      return a.teamNumber - b.teamNumber;
    }
    return a.number - b.number;
  },
});

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
            complete: false,
            phase: RumbleGamePhase.DISABLED,
            score: 0,
            history: [] as PayloadAction<RumbleGameEvent>[],
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
            complete: null,
            score: null,
            phase: null,
            history: null,
          }),
        };
      },
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
            history: [...currentGame.history, action],
          },
        });
      },
      prepare: (payload: { type: string; points: number }) => {
        return {
          payload: {
            timestamp: moment().unix(),
            type: payload.type,
            points: payload.points,
          },
        };
      },
    },
    addRobotPhaseChangeEvent: {
      reducer: (state, action: PayloadAction<RumblePhaseChangeEvent>) => {
        const currentGame = gamesAdapter
          .getSelectors()
          .selectById(state, state.currentGameId);
        return gamesAdapter.updateOne(state, {
          id: state.currentGameId,
          changes: {
            phase: action.payload.phase,
            history: [...currentGame.history, action],
          },
        });
      },
      prepare: (phase: RumbleGamePhase) => {
        return {
          payload: {
            timestamp: moment().unix(),
            phase,
          },
        };
      },
    },
    finishGame: (state) => {
      state = gamesAdapter.updateOne(state, {
        id: state.currentGameId,
        changes: {
          complete: true,
        },
      });
      state.currentGameId = null;
      return state;
    },
  },
});

export const {
  addGame,
  focusGame,
  addScoringEvent,
  addRobotPhaseChangeEvent,
  finishGame,
} = gamesSlice.actions;
export const gamesSelectors = gamesAdapter.getSelectors();
export default gamesSlice.reducer;
