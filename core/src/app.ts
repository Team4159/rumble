import { configureStore, combineReducers } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import gamesReducer from '@/slices/games';
import socketMiddleware from '@/middleware/socket-io';
import { createSocketEngine } from '@/transport/socket-io';

import express from 'express';
import socketIO from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';

const rootReducer = combineReducers({
  games: gamesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const preloadedState = {};

export const rootStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger).concat(socketMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
  preloadedState,
});

const PORT = process.env.CORE_PORT || 8000;

const app = express();
app.use(cors());
app.options('*', cors());
const httpServer = createServer(app);

createSocketEngine(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Listening on *:${PORT}`);
});
