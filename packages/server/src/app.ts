import { configureStore, combineReducers } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import { gamesReducer } from '@rumble/core';
import createSocketMiddleware from '@/middleware/socket-io';
import phaseSwitcherMiddleware from '@/middleware/phase-switcher';
import persistenceMiddleware from '@/middleware/persistence';
import { createSocketEngine } from '@/transport/socket-io';

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';

import path from 'path';
import { readFileSync } from 'fs';

const rootReducer = combineReducers({
  games: gamesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const preloadedState = JSON.parse(readFileSync(path.join(__dirname, '..', 'state.json'), 'utf8'));

const PORT = process.env.CORE_PORT || 8000;

const app = express();
app.use(cors());
app.options('*', cors());
const httpServer = createServer(app);

const io = createSocketEngine(httpServer);

const rootStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(logger)
      .concat(createSocketMiddleware(io))
      .concat(phaseSwitcherMiddleware)
      .concat(persistenceMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
  preloadedState,
});

io.on('connection', (socket) => {
  console.log('New connection');
  socket.emit('initialRootState', rootStore.getState());
  socket.on('dispatchAction', rootStore.dispatch);
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Listening on *:${PORT}`);
});

// tslint:disable-next-line:no-empty
process.on('exit', () => {});
