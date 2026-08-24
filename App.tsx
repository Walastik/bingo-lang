import React from 'react';
import GameScreen from '@/screens/GameScreen';
import LobbyScreen from '@/screens/LobbyScreen';
import { useGameContext } from '@/state/GameContext';

/** Routes between the two screens. State lives in `GameProvider`. */
export default function App() {
  const { gameState } = useGameContext();

  return gameState === 'lobby' ? <LobbyScreen /> : <GameScreen />;
}
