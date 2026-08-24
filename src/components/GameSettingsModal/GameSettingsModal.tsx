import React, { useMemo } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { GameSpeed, GAME_SPEED_OPTIONS } from '@/game/speed';
import { useTheme } from '@/theme/ThemeContext';
import { createStyles } from './GameSettingsModal.styles';

interface GameSettingsModalProps {
  visible: boolean;
  gameSpeed: GameSpeed;
  onSelectSpeed: (speed: GameSpeed) => void;
  onQuit: () => void;
  onClose: () => void;
}

const formatSpeedLabel = (speed: GameSpeed) => `${speed}x`;

const GameSettingsModal = ({
  visible,
  gameSpeed,
  onSelectSpeed,
  onQuit,
  onClose,
}: GameSettingsModalProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Pressable
            style={styles.closeIconButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>

          <Text style={styles.title}>Game Settings</Text>

          <Text style={styles.sectionLabel}>Speed</Text>
          <View style={styles.speedOptions}>
            {GAME_SPEED_OPTIONS.map((speed) => {
              const isSelected = gameSpeed === speed;

              return (
                <Pressable
                  key={speed}
                  style={[styles.speedButton, isSelected && styles.speedButtonSelected]}
                  onPress={() => onSelectSpeed(speed)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${formatSpeedLabel(speed)} speed`}
                >
                  <Text
                    style={[
                      styles.speedButtonText,
                      isSelected && styles.speedButtonTextSelected,
                    ]}
                  >
                    {formatSpeedLabel(speed)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.quitButton}
            onPress={onQuit}
            accessibilityRole="button"
            accessibilityLabel="Quit game"
          >
            <Text style={styles.quitButtonText}>Quit Game</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default GameSettingsModal;
