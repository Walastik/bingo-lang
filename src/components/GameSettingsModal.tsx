import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GameSpeed, GAME_SPEED_OPTIONS } from '../hooks/useBingoGame';

interface GameSettingsModalProps {
  visible: boolean;
  gameSpeed: GameSpeed;
  onSelectSpeed: (speed: GameSpeed) => void;
  onQuit: () => void;
  onClose: () => void;
}

const formatSpeedLabel = (speed: GameSpeed) => {
  if (speed === 1) {
    return '1x';
  }
  return `${speed}x`;
};

const GameSettingsModal = ({
  visible,
  gameSpeed,
  onSelectSpeed,
  onQuit,
  onClose,
}: GameSettingsModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
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
                    style={[styles.speedButtonText, isSelected && styles.speedButtonTextSelected]}
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

          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          >
            <Text style={styles.closeButtonText}>Close Menu</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  speedOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  speedButton: {
    minWidth: 56,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#ececec',
    alignItems: 'center',
  },
  speedButtonSelected: {
    backgroundColor: '#007AFF',
  },
  speedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  speedButtonTextSelected: {
    color: '#fff',
  },
  quitButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  quitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default GameSettingsModal;
