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

export default function StreamOverlay() {
  const { loading, rumbleState } = useRumble('http://localhost:8000');

  if (loading) {
    return 'Connecting...';
  }

  if (!rumbleState.games.currentGameId) {
    return 'No Game Found';
  }

  return JSON.stringify(
    gamesSelectors.selectById(
      rumbleState.games,
      rumbleState.games.currentGameId
    )
  );
}
