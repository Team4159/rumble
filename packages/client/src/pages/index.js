import React, { useEffect, useState } from 'react';
import Head from 'next/head';

import io from 'socket.io-client';

import { applyChange } from 'deep-diff';
import cloneDeep from 'clone-deep';

export default function Home() {
  const [rootState, setRootState] = useState({});
  useEffect(() => {
    const socket = io('http://localhost:8000');
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
    </div>
  );
}
