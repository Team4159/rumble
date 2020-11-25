import React, { useEffect, useState } from 'react';
import Head from 'next/head';

import { addGame } from '@rumble/core';

import io from 'socket.io-client';

import { applyChange } from 'deep-diff';
import cloneDeep from 'clone-deep';

export default function Home() {
  const [socket] = useState(io('http://localhost:8000'));
  const [counter, setCounter] = useState(0);
  const [rootState, setRootState] = useState({});

  useEffect(() => {
    socket.on('initialRootState', setRootState);
    socket.on('rootStateDiff', (diff) => {
      setRootState((oldState) => {
        const currentState = cloneDeep(oldState);
        diff.forEach((change) => {
          applyChange(currentState, change);
        });
        return currentState;
      });
    });
  }, []);

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {JSON.stringify(rootState)}
      <br />
      <button
        type="button"
        onClick={() => {
          socket.emit(
            'dispatchAction',
            addGame({
              number: counter,
              teamNumber: 1,
            })
          );
          setCounter(counter + 1);
        }}
      >
        Dispatch
      </button>
    </div>
  );
}
