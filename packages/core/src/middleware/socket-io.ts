import { Middleware } from 'redux';

import { Server } from 'socket.io';

import { RootState } from '@/app';

import { diff } from 'deep-object-diff';

const createSocketMiddleware = (io: Server): Middleware<{}, RootState> => (
  store
) => {
  return (next) => (action) => {
    const oldState = store.getState();
    const result = next(action);
    const newState = store.getState();
    const stateDiff = diff(oldState, newState);
    io.emit('rootStateDiff', stateDiff);
    return result;
  };
};

export default createSocketMiddleware;
