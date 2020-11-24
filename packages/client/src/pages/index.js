import React, { useEffect, useState } from 'react';

import Head from 'next/head';

import io from 'socket.io-client';

export default function Home() {
  const [rootState, setRootState] = useState({});
  useEffect(() => {
    const socket = io('http://localhost:8000');
    socket.on('initialRootState', setRootState);
    socket.on('rootStateDiff', (diff) =>
      setRootState(Object.assign(rootState, diff))
    );
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
