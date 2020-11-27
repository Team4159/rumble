import React, { useState } from 'react';
import Head from 'next/head';

import {
  gamesSelectors,
  addGame,
  focusGame,
  resetGame,
  addPhaseChangeEvent,
  addScoringEvent,
  undoLastScoringEvent,
  undoLastPhaseChangeEvent,
  RumbleGamePhase,
} from '@rumble/core';
import useRumble from '@/hooks/useRumble';

enum ScoringEvents {
  CROSS_AUTO_LINE = 'CROSS_AUTO_LINE',
  SCORE_AUTO_CUBE = 'SCORE_AUTO_CUBE',
  SCORE_TELEOP_CUBE = 'SCORE_TELEOP_CUBE',
  PARK = 'PARK',
}

export default function Home() {
  const { loading, rumbleState, dispatch } = useRumble('http://localhost:8000');

  const [teamNumber, setTeamNumber] = useState(1);
  const [gameNumber, setGameNumber] = useState(1);

  if (loading) {
    return 'Connecting...';
  }

  const currentGame = rumbleState.games.currentGameId
    ? gamesSelectors.selectById(
        rumbleState.games,
        rumbleState.games.currentGameId
      )
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
            Team {currentGame.teamNumber} - Game {currentGame.number} -{' '}
            {RumbleGamePhase[currentGame.phase]} - Score {currentGame.score}
          </p>
          <p>Actions</p>
          <div>
            <button
              type="button"
              onClick={() =>
                dispatch(addPhaseChangeEvent(currentGame.phase + 1))
              }
            >
              Next Phase
            </button>
            <button type="button" onClick={() => dispatch(resetGame())}>
              Reset Game
            </button>
            <button
              type="button"
              onClick={() => dispatch(undoLastScoringEvent())}
            >
              Undo Last Scoring Event
            </button>
            <button
              type="button"
              onClick={() => dispatch(undoLastPhaseChangeEvent())}
            >
              Undo Last Phase Change Event
            </button>
          </div>
          <div>
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
          <p>History</p>
          <div>
            <div
              style={{
                display: 'inline-block',
                height: '100px',
                width: '50%',
                overflowY: 'scroll',
              }}
            >
              <ul>
                {currentGame.phaseHistory.map((action, idx) => (
                  <li key={idx}>{JSON.stringify(action)}</li>
                ))}
              </ul>
            </div>
            <div
              style={{
                display: 'inline-block',
                height: '100px',
                width: '50%',
                overflowY: 'scroll',
              }}
            >
              <ul>
                {currentGame.scoringHistory.map((action, idx) => (
                  <li key={idx}>{JSON.stringify(action)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <p>Games</p>
      <ul>
        {gamesSelectors.selectAll(rumbleState.games).map((game, idx) => (
          <div key={idx}>
            <li>
              Team {game.teamNumber} - Game {game.number}
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
      <div>
        Team Number:{' '}
        <input
          placeholder="Team Number"
          type="number"
          value={teamNumber}
          onChange={(e) => setTeamNumber(+e.target.value)}
        />
      </div>
      <div>
        Game Number:{' '}
        <input
          placeholder="Game Number"
          type="number"
          value={gameNumber}
          onChange={(e) => setGameNumber(+e.target.value)}
        />
      </div>
      <button
        type="button"
        onClick={() => {
          dispatch(
            addGame({
              number: gameNumber,
              teamNumber,
            })
          );
        }}
      >
        Add Game
      </button>
    </div>
  );
}
