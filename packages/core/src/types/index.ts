import { PayloadAction } from '@reduxjs/toolkit';

export enum RumbleGamePhase {
  PRE,
  AUTONOMOUS,
  TELEOPERATED,
  ENDGAME,
  POST,
}

export type RumbleGameScoringEvent = {
  timestamp: number;
  type: string;
  points: number;
};

export type RumblePhaseChangeEvent = {
  timestamp: number;
  phase: RumbleGamePhase;
};

export type RumbleGameEvent = RumbleGameScoringEvent | RumblePhaseChangeEvent;

export type RumbleGame = {
  number: number;
  teamNumber: number;
  phase: RumbleGamePhase;
  score: number;
  history: PayloadAction<RumbleGameEvent>[];
};

export type RumbleTeam = {
  number: number;
  name: string;
};
