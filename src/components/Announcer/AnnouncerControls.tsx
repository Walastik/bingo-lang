import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { AnnouncerStyles } from './Announcer.styles';

interface AnnouncerControlsProps {
  isPaused: boolean;
  showPauseControl: boolean;
  onTogglePause: () => void;
  showNextControl: boolean;
  canCallNextBall: boolean;
  onNextBall?: () => void;
  isAutoMode: boolean;
  showAutoControl: boolean;
  onToggleAutoMode?: () => void;
  styles: AnnouncerStyles;
}

/** Pause, manual-call, and auto-daub buttons. Renders nothing if all are off. */
const AnnouncerControls = ({
  isPaused,
  showPauseControl,
  onTogglePause,
  showNextControl,
  canCallNextBall,
  onNextBall,
  isAutoMode,
  showAutoControl,
  onToggleAutoMode,
  styles,
}: AnnouncerControlsProps) => {
  if (!showPauseControl && !showNextControl && !showAutoControl) {
    return null;
  }

  return (
    <View style={styles.controlRow}>
      {showPauseControl && (
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onTogglePause}
          accessibilityRole="button"
          accessibilityLabel={isPaused ? 'Resume game' : 'Pause game'}
        >
          <Text style={styles.controlIcon}>{isPaused ? '▶' : '⏸'}</Text>
        </TouchableOpacity>
      )}
      {showNextControl && onNextBall && (
        <TouchableOpacity
          style={[styles.controlButton, !canCallNextBall && styles.controlButtonDisabled]}
          onPress={onNextBall}
          disabled={!canCallNextBall}
          accessibilityRole="button"
          accessibilityLabel={
            canCallNextBall ? 'Call next ball' : 'All balls have been called'
          }
        >
          <Text style={styles.controlIcon}>⏭</Text>
        </TouchableOpacity>
      )}
      {showAutoControl && onToggleAutoMode && (
        <TouchableOpacity
          style={[styles.controlButton, isAutoMode && styles.controlButtonActive]}
          onPress={onToggleAutoMode}
          accessibilityRole="button"
          accessibilityLabel={
            isAutoMode ? 'Switch to manual daubing' : 'Switch to auto daubing'
          }
        >
          <Text style={styles.controlIcon}>🤖</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AnnouncerControls;
