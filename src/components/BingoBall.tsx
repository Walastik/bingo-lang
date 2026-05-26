import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getBallString, getBallColor } from '../utils/bingoUtils';

interface BingoBallProps {
  value: number;
  size?: 'small' | 'large';
}

const BingoBall: React.FC<BingoBallProps> = ({ value, size = 'small' }) => {
  const ballText = getBallString(value);
  const backgroundColor = getBallColor(value);
  
  // Dimensions based on size prop
  const dimension = size === 'large' ? 120 : 50;
  const fontSize = size === 'large' ? 32 : 16;

  return (
    <View
      style={[
        styles.ballContainer,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor,
          shadowColor: '#000',
          shadowOffset: { width: 4, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        },
      ]}
    >
      <Text
        style={[
          styles.ballText,
          { 
            fontSize, 
            color: '#FFFFFF',
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          },
        ]}
      >
        {ballText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  ballContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballText: {
    fontWeight: 'bold',
    fontFamily: 'System', // Use system font for consistency
  },
});

export default BingoBall;