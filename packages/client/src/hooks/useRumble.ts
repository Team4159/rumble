import { useEffect, useMemo, useState } from 'react';

import { gamesReducer } from '@rumble/core';
import { Action } from 'redux';

import io from 'socket.io-client';

import { applyChange } from 'deep-diff';
import cloneDeep from 'clone-deep';

type GamesState = ReturnType<typeof gamesReducer>;
type RootState = {
  games: GamesState;
};

const useRumbleState = (url: string) => {
  const socket = useMemo(() => io(url), [url]);

  const [loading, setLoaded] = useState(true);
  const [rumbleState, setRumbleState] = useState({} as RootState);

  useEffect(() => {
    socket.on('initialRootState', (initialRootState) => {
      setRumbleState(initialRootState);
      setLoaded(false);
    });
    socket.on('rootStateDiff', (diff) => {
      setRumbleState((oldState) => {
        const currentState = cloneDeep(oldState);
        diff.forEach((change) => {
          applyChange(currentState, null, change);
        });
        return currentState;
      });
    });
  }, [socket]);

  const dispatch = (action: Action) => {
    socket.emit('dispatchAction', action);
  };

  return { loading, rumbleState, dispatch };
};

export default useRumbleState;
