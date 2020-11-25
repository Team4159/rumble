import { configureStore, combineReducers } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import { gamesReducer } from '@rumble/core';
import createSocketMiddleware from '@/middleware/socket-io';
import { createSocketEngine } from '@/transport/socket-io';

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';

const rootReducer = combineReducers({
  games: gamesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const preloadedState = {};

const PORT = process.env.CORE_PORT || 8000;

const app = express();
app.use(cors());
app.options('*', cors());
const httpServer = createServer(app);

const io = createSocketEngine(httpServer);

const rootStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger).concat(createSocketMiddleware(io)),
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
