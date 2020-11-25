import React, { useEffect, useState } from 'react';
import Head from 'next/head';

import {
  gamesReducer,
  gamesSelectors,
  addGame,
  focusGame,
  addPhaseChangeEvent,
  addScoringEvent,
  RumbleGamePhase,
} from '@rumble/core';
import { Action } from 'redux';

import io from 'socket.io-client';

import { applyChange } from 'deep-diff';
import cloneDeep from 'clone-deep';

type GamesState = ReturnType<typeof gamesReducer>;
type RootState = {
  games: GamesState;
};
enum ScoringEvents {
  CROSS_AUTO_LINE = 'CROSS_AUTO_LINE',
  SCORE_AUTO_CUBE = 'SCORE_AUTO_CUBE',
  SCORE_TELEOP_CUBE = 'SCORE_TELEOP_CUBE',
  PARK = 'PARK',
}

export default function Home() {
  const [socket] = useState(io('http://localhost:8000'));
  const [loaded, setLoaded] = useState(false);
  const [counter, setCounter] = useState(0);
  const [rootState, setRootState] = useState({} as RootState);

  useEffect(() => {
    socket.on('initialRootState', (initialRootState) => {
      setRootState(initialRootState);
      setLoaded(true);
    });
    socket.on('rootStateDiff', (diff) => {
      setRootState((oldState) => {
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

  if (!loaded) {
    return 'Connecting...';
  }

  const currentGame = rootState.games.currentGameId
    ? gamesSelectors.selectById(rootState.games, rootState.games.currentGameId)
    : null;

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <span>Current Game: </span>
      {currentGame && (
        <div>
          <p>
            Team {currentGame.teamNumber} - Game {currentGame.number}
          </p>
          <button
            type="button"
            onClick={() => dispatch(addPhaseChangeEvent(currentGame.phase + 1))}
          >
            Next Phase
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch(
                addScoringEvent({
                  type: ScoringEvents.CROSS_AUTO_LINE,
                  points: 5,
                })
              )
            }
          >
            Cross Auto Line
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch(
                addScoringEvent({
                  type: ScoringEvents.SCORE_AUTO_CUBE,
                  points: 10,
                })
              )
            }
          >
            Score Auto Cube
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch(
                addScoringEvent({
                  type: ScoringEvents.SCORE_TELEOP_CUBE,
                  points: 5,
                })
              )
            }
          >
            Score Teleop Cube
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch(
                addScoringEvent({
                  type: ScoringEvents.PARK,
                  points: 10,
                })
              )
            }
          >
            Park
          </button>
        </div>
      )}
      <ul>
        {gamesSelectors.selectAll(rootState.games).map((game, idx) => (
          <div key={idx}>
            <li>
              Team {game.teamNumber} - Game {game.number} - Phase{' '}
              {RumbleGamePhase[game.phase]} - Score {game.score}
            </li>
            <button
              type="button"
              onClick={() =>
                dispatch(
                  focusGame({
                    teamNumber: game.teamNumber,
                    number: game.number,
                  })
                )
              }
            >
              Focus
            </button>
          </div>
        ))}
      </ul>
      <br />
      <button
        type="button"
        onClick={() => {
          dispatch(
            addGame({
              number: counter,
              teamNumber: 1,
            })
          );
          setCounter(counter + 1);
        }}
      >
        Add Game
      </button>
    </div>
  );
}
