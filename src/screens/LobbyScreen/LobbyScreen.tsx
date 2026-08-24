import React, { useMemo } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameContext } from '@/state/GameContext';
import { useTheme } from '@/theme/ThemeContext';
import { createScreenStyles } from '@/theme/screenStyles';
import AppearanceSection from './AppearanceSection';
import CardCountSelector from './CardCountSelector';
import { createStyles } from './LobbyScreen.styles';
import ModeSelector from './ModeSelector';
import RoundLineupList from './RoundLineupList';

/** Pre-game setup: mode, cards, round lineup, appearance. */
const LobbyScreen = () => {
  const { colors } = useTheme();
  const screenStyles = useMemo(() => createScreenStyles(colors), [colors]);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const {
    isCallerOnly,
    setIsCallerOnly,
    selectedCardCount,
    setSelectedCardCount,
    selectedRounds,
    toggleRoundSelection,
    rounds,
    startGame,
  } = useGameContext();

  const hasNoRounds = rounds.length === 0;

  return (
    <SafeAreaView style={screenStyles.container}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Bingo Lang!</Text>

        <Text style={styles.subtitle}>Mode</Text>
        <ModeSelector
          isCallerOnly={isCallerOnly}
          onSelect={setIsCallerOnly}
          styles={styles}
        />

        {!isCallerOnly && (
          <>
            <Text style={styles.subtitle}>Cards</Text>
            <CardCountSelector
              selected={selectedCardCount}
              onSelect={setSelectedCardCount}
              styles={styles}
            />
          </>
        )}

        <Text style={styles.subtitle}>Round lineup</Text>
        <Text style={styles.roundLineupHint}>
          Tap a game to include or exclude it.
        </Text>
        <RoundLineupList
          selectedRounds={selectedRounds}
          onToggle={toggleRoundSelection}
          styles={styles}
        />

        <Text style={styles.subtitle}>Appearance</Text>
        <AppearanceSection styles={styles} />

        <TouchableOpacity
          style={[styles.startButton, hasNoRounds && styles.startButtonDisabled]}
          onPress={startGame}
          disabled={hasNoRounds}
        >
          <Text style={styles.startButtonText}>
            {isCallerOnly ? 'Start Calling' : 'Start Game'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LobbyScreen;
