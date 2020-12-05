import React from 'react';
import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';

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
  RumbleGameScoringEvent,
  RumblePhaseChangeEvent,
} from '@rumble/core';
import { motion } from 'framer-motion';
import useRumble from '@/hooks/useRumble';

const MotionStack = motion.custom(Stack);
const MotionBox = motion.custom(Box);

export default function StreamOverlay() {
  const { loading, rumbleState } = useRumble('http://localhost:8000');

  if (loading) {
    return 'Connecting...';
  }

  if (!rumbleState.games.currentGameId) {
    return 'No Game Found';
  }

  const currentGame = gamesSelectors.selectById(
    rumbleState.games,
    rumbleState.games.currentGameId
  );

  const eventHistory = (currentGame.scoringHistory.slice() as (
    | RumbleGameScoringEvent
    | RumblePhaseChangeEvent
  )[])
    .concat(currentGame.phaseHistory.slice())
    .sort((a, b) => b.timestamp - a.timestamp);
  console.log(eventHistory);

  return (
    <Flex maxHeight="100vh" p={6} dir="row">
      <Stack alignItems="center" flexBasis="33%">
        <Heading>Team {currentGame.teamNumber}</Heading>
        <Heading>Game #{currentGame.number}</Heading>
      </Stack>
      <Stack flexBasis="33%">
        <Flex pos="relative" dir="row" h="36px">
          <Box bg="green.400" w="50%" />
          <Text
            pos="absolute"
            left="50%"
            top="50%"
            transform="translate(-50%, -50%)"
            fontWeight="semibold"
          >
            10
          </Text>
        </Flex>
        <Heading alignSelf="center">50</Heading>
      </Stack>
      <MotionStack flexBasis="33%" overflowY="scroll" spacing={1}>
        {eventHistory.map((event) => {
          let text;
          if ((event as RumblePhaseChangeEvent).phase) {
            const phaseEvent = event as RumblePhaseChangeEvent;
            text = phaseEvent.phase;
          } else {
            const phaseEvent = event as RumbleGameScoringEvent;
            text = phaseEvent.type;
          }

          return (
            <MotionBox
              key={event.timestamp}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              bg="gray.300"
              py={1}
              px={2}
              rounded="lg"
            >
              {text}
            </MotionBox>
          );
        })}
      </MotionStack>
    </Flex>
  );
}
