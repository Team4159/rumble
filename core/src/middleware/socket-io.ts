import { Middleware } from 'redux';

import { RootState } from '@/app';

const socketMiddleware: Middleware<{}, RootState> = (store) => {
  return (next) => (action) => {
    console.log('dispatching', action);
    const result = next(action);
    console.log('next state', store.getState());
    return result;
  };
};

export default socketMiddleware;
