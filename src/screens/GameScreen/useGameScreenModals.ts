import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useGameContext } from '@/state/GameContext';

/**
 * The screen's three overlays, and the game state each one has to coordinate.
 *
 * Opening settings pauses the draw and closing it resumes — but only when
 * someone is playing along. A caller has no timer to pause.
 */
export function useGameScreenModals() {
  const { isCallerOnly, pauseGame, resumeGame, resetGame, declareWinner } =
    useGameContext();

  const [showCalledBalls, setShowCalledBalls] = useState(false);
  const [showDeclareWinner, setShowDeclareWinner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const openSettings = useCallback(() => {
    if (!isCallerOnly) {
      pauseGame();
    }
    setShowSettings(true);
  }, [isCallerOnly, pauseGame]);

  const closeSettings = useCallback(() => {
    setShowSettings(false);
    if (!isCallerOnly) {
      resumeGame();
    }
  }, [isCallerOnly, resumeGame]);

  const confirmQuit = useCallback(() => {
    Alert.alert(
      'Are you sure?',
      'This will end the current game and return to the lobby.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => {
            setShowSettings(false);
            resetGame();
          },
        },
      ],
    );
  }, [resetGame]);

  const confirmWinner = useCallback(() => {
    setShowDeclareWinner(false);
    declareWinner();
  }, [declareWinner]);

  const openCalledBalls = useCallback(() => setShowCalledBalls(true), []);
  const closeCalledBalls = useCallback(() => setShowCalledBalls(false), []);
  const openDeclareWinner = useCallback(() => setShowDeclareWinner(true), []);
  const cancelDeclareWinner = useCallback(() => setShowDeclareWinner(false), []);

  return {
    showCalledBalls,
    openCalledBalls,
    closeCalledBalls,
    showDeclareWinner,
    openDeclareWinner,
    cancelDeclareWinner,
    confirmWinner,
    showSettings,
    openSettings,
    closeSettings,
    confirmQuit,
  };
}
