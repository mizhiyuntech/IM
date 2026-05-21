import React, { memo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../../theme';
import { IconOutline } from '@ant-design/icons-react-native';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
}

function Avatar({ uri, name, size = 44 }: AvatarProps) {
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (uri) {
    return <Image source={{ uri }} style={[containerStyle, styles.image]} />;
  }

  return (
    <View style={[containerStyle, styles.fallback]}>
      {name ? (
        <Text style={[styles.fallbackText, { fontSize: size * 0.4 }]}>
          {name.charAt(0)}
        </Text>
      ) : (
        <IconOutline name="user" size={size * 0.5} color={Colors.white} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: Colors.border,
  },
  fallback: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: Colors.white,
    fontWeight: '600',
  },
});

export default memo(Avatar);
