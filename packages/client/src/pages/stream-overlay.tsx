import React, { useEffect, useRef } from 'react';
import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';

import {
  gamesSelectors,
  RumbleGamePhase,
  RumbleGameScoringEvent,
  RumblePhaseChangeEvent,
} from '@rumble/core';
import {
  AnimatePresence,
  motion,
  useAnimation,
  useSpring,
} from 'framer-motion';
import useRumble from '@/hooks/useRumble';

import moment from 'moment';

const MotionStack = motion.custom(Stack);
const MotionBox = motion.custom(Box);

const capWord = (word) =>
  word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
const time = () => parseInt(moment().format('x'), 10);

const PHASE_LENGTHS: { [key: string]: number } = {
  AUTONOMOUS: 30,
  TELEOPERATED: 90,
  ENDGAME: 15,
};
const GAME_LENGTH = 30 + 90 + 15;

export default function StreamOverlay() {
  const { loading, rumbleState } = useRumble('http://localhost:8000');

  const score = useSpring(0, { stiffness: 300, damping: 10 });
  const scoreRef = useRef(null);

  const timeInPeriodRef = useRef(null);

  const autoTimeAnimation = useAnimation();
  const teleoperatedTimeAnimation = useAnimation();
  const endgameTimeAnimation = useAnimation();

  useEffect(
    () =>
      score.onChange((latestValue) => {
        scoreRef.current.textContent = Math.max(latestValue, 0).toFixed(0);
      }),
    [score]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (loading) {
        return;
      }
      const currentGame = gamesSelectors.selectById(
        rumbleState.games,
        rumbleState.games.currentGameId
      );
      if (!currentGame) {
        return;
      }

      const { phase } = currentGame;
      const phaseLength = PHASE_LENGTHS[RumbleGamePhase[phase]];
      if (PHASE_LENGTHS[RumbleGamePhase[phase]]) {
        const timeRemaining =
          phaseLength -
          (time() -
            currentGame.phaseHistory[currentGame.phaseHistory.length - 1]
              .timestamp) /
            1000;
        timeInPeriodRef.current.textContent = Math.max(
          timeRemaining,
          0
        ).toFixed(0);
      } else if (phase === RumbleGamePhase['PRE-GAME']) {
        timeInPeriodRef.current.textContent = '30';
      } else if (phase === RumbleGamePhase['POST-GAME']) {
        timeInPeriodRef.current.textContent = '0';
      }
    }, 1000);

    return () => clearInterval(interval);
  });

  const doAnimations = async (timeAnimation, timeElapsed, periodLength) => {
    await timeAnimation.start({
      width: `${
        ((1 - timeElapsed / periodLength) * 100 * periodLength) / GAME_LENGTH
      }%`,
      transition: { duration: 0 },
    });
    await timeAnimation.start({
      width: '0%',
      transition: { duration: Math.max(periodLength - timeElapsed, 0) },
    });
  };

  useEffect(() => {
    if (loading) {
      return;
    }
    const currentGame = gamesSelectors.selectById(
      rumbleState.games,
      rumbleState.games.currentGameId
    );
    if (!currentGame) {
      return;
    }

    const autoEvent = currentGame.phaseHistory.find(
      (phaseEvent) => phaseEvent.phase === RumbleGamePhase.AUTONOMOUS
    );
    const teleoperatedEvent = currentGame.phaseHistory.find(
      (phaseEvent) => phaseEvent.phase === RumbleGamePhase.TELEOPERATED
    );
    const endgameEvent = currentGame.phaseHistory.find(
      (phaseEvent) => phaseEvent.phase === RumbleGamePhase.ENDGAME
    );

    if (!autoEvent) {
      autoTimeAnimation.start('initial');
    } else {
      const timeElapsed = (time() - autoEvent.timestamp) / 1000;
      doAnimations(autoTimeAnimation, timeElapsed, PHASE_LENGTHS.AUTONOMOUS);
    }

    if (!teleoperatedEvent) {
      teleoperatedTimeAnimation.start('initial');
    } else {
      const timeElapsed = (time() - teleoperatedEvent.timestamp) / 1000;
      doAnimations(
        teleoperatedTimeAnimation,
        timeElapsed,
        PHASE_LENGTHS.TELEOPERATED
      );
    }

    if (!endgameEvent) {
      endgameTimeAnimation.start('initial');
    } else {
      const timeElapsed = (time() - endgameEvent.timestamp) / 1000;
      doAnimations(endgameTimeAnimation, timeElapsed, PHASE_LENGTHS.ENDGAME);
    }

    return () => {
      autoTimeAnimation.stop();
      teleoperatedTimeAnimation.stop();
      endgameTimeAnimation.stop();
    };
  }, [
    autoTimeAnimation,
    endgameTimeAnimation,
    loading,
    rumbleState.games,
    teleoperatedTimeAnimation,
  ]);

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
  score.set(
    currentGame.scoringHistory.reduce((acc, cur) => acc + cur.points, 0)
  );

  return (
    <Stack
      isInline
      dir="row"
      height="100vh"
      maxHeight="100vh"
      pX={6}
      spacing={6}
      color="black"
    >
      <Flex direction="column" flexBasis="33%" bg="gray.100">
        <AnimatePresence exitBeforeEnter>
          <MotionStack
            key={`${currentGame.teamNumber}.${currentGame.number}`}
            alignItems="center"
            variants={{
              initial: { x: -100, opacity: 0 },
              animate: { x: 0, opacity: 1 },
              exit: { x: 100, opacity: 0 },
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            width="100%"
            flexGrow={1}
            justifyContent="center"
            rounded="lg"
          >
            <Heading key={currentGame.teamNumber}>
              Team {currentGame.teamNumber}
            </Heading>
            <Heading key={currentGame.number}>
              Game #{currentGame.number}
            </Heading>
          </MotionStack>
        </AnimatePresence>
      </Flex>
      <Flex direction="column" flexBasis="33%">
        <Flex
          pos="relative"
          dir="row"
          minH="36px"
          border="1px solid"
          borderColor="black"
          rounded="lg"
          bg="white"
        >
          <MotionBox
            layout
            variants={{
              initial: {
                width: `${(PHASE_LENGTHS.ENDGAME / GAME_LENGTH) * 100}%`,
                transition: { duration: 0 },
              },
            }}
            animate={endgameTimeAnimation}
            bg="green.400"
            roundedLeft="lg"
            roundedRight={
              currentGame.phase === RumbleGamePhase.ENDGAME ? 'lg' : null
            }
          />
          <MotionBox
            layout
            variants={{
              initial: {
                width: `${(PHASE_LENGTHS.TELEOPERATED / GAME_LENGTH) * 100}%`,
                transition: { duration: 0 },
              },
            }}
            animate={teleoperatedTimeAnimation}
            bg="green.400"
            roundedRight={
              currentGame.phase === RumbleGamePhase.TELEOPERATED ? 'lg' : null
            }
          />
          <MotionBox
            layout
            variants={{
              initial: {
                width: `${(PHASE_LENGTHS.AUTONOMOUS / 135) * 100}%`,
                transition: { duration: 0 },
              },
            }}
            initial="initial"
            animate={autoTimeAnimation}
            bg="green.400"
            roundedRight="lg"
          />
          <Text
            ref={timeInPeriodRef}
            pos="absolute"
            left="50%"
            top="50%"
            transform="translate(-50%, -50%)"
            fontWeight="semibold"
            fontSize="xl"
          />
        </Flex>
        <Stack
          width="100%"
          flexGrow={1}
          textAlign="center"
          bg="#700002"
          color="white"
          rounded="lg"
          justifyContent="center"
        >
          <Text fontSize="xl" fontWeight="semibold">
            {RumbleGamePhase[currentGame.phase]}
          </Text>
          <Heading ref={scoreRef} />
        </Stack>
      </Flex>
      <MotionStack flexBasis="33%" overflowY="hidden" spacing={1}>
        {eventHistory.map((event) => {
          let child;
          const isPhaseChangeEvent = !!(event as RumblePhaseChangeEvent).phase;
          if (isPhaseChangeEvent) {
            const phaseEvent = event as RumblePhaseChangeEvent;
            child = (
              <Text fontWeight="semibold">
                Entered{' '}
                {RumbleGamePhase[phaseEvent.phase]
                  .split('-')
                  .map(capWord)
                  .join('-')}
                !
              </Text>
            );
          } else {
            const scoringEvent = event as RumbleGameScoringEvent;
            child = (
              <Text fontWeight="semibold">
                {scoringEvent.type.split('_').map(capWord).join(' ')}{' '}
                <Text as="span" color="green.400">
                  +{scoringEvent.points}
                </Text>
              </Text>
            );
          }

          return (
            <MotionBox
              key={event.timestamp}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.25 } }}
              bg={isPhaseChangeEvent ? 'gray.200' : 'gray.100'}
              py={2}
              px={4}
              rounded="lg"
            >
              {child}
            </MotionBox>
          );
        })}
      </MotionStack>
    </Stack>
  );
}
