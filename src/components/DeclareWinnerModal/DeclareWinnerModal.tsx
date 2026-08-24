import React, { useMemo } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { createStyles } from './DeclareWinnerModal.styles';

interface DeclareWinnerModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeclareWinnerModal = ({
  visible,
  onConfirm,
  onCancel,
}: DeclareWinnerModalProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Declare Winner?</Text>
          <Text style={styles.message}>
            Have you confirmed the card? If Yes, we will move on to the next game.
            Otherwise, press No to continue the current game.
          </Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="No, continue the current game"
            >
              <Text style={styles.buttonText}>No</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel="Yes, move to the next game"
            >
              <Text style={styles.buttonText}>Yes</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeclareWinnerModal;
