import { Middleware } from 'redux';

import path from 'path';
import { writeFile } from 'fs';

import { RootState } from '@/app';

const persistenceMiddleware: Middleware<{}, RootState> = (store) => {
  return (next) => (action) => {
    const result = next(action);
    writeFile(
      path.join(__dirname, '..', '..', 'state.json'),
      JSON.stringify(store.getState()),
      (err) => {
        if (!err) {
          console.log('Wrote state to file!');
        }
      }
    );
    return result;
  };
};

export default persistenceMiddleware;
