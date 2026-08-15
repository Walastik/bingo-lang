import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ThemeColors } from '../theme/colors';

interface DeclareWinnerModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    content: {
      width: '100%',
      maxWidth: 360,
      borderRadius: 20,
      backgroundColor: colors.surface,
      padding: 24,
    },
    title: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 12,
    },
    message: {
      color: colors.textSecondary,
      fontSize: 16,
      lineHeight: 23,
      textAlign: 'center',
      marginBottom: 24,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    confirmButton: {
      backgroundColor: '#34C759',
    },
    cancelButton: {
      backgroundColor: '#FF3B30',
    },
    buttonText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '700',
    },
  });
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
