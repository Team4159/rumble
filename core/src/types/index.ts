export enum RumbleGamePhase {
  'DISABLED',
  'AUTONOMOUS',
  'TELEOPERATED',
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

export type RumbleGame = {
  number: number;
  teamNumber: number;
  complete: boolean;
  phase: RumbleGamePhase;
  score: number;
};

export type RumbleTeam = {
  number: number;
  name: string;
};
