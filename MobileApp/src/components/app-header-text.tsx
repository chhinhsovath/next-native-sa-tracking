import { cn } from '../heroui-native';
import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

export const AppHeaderText = React.forwardRef<RNText, RNTextProps>((props, ref) => {
  const { className, ...restProps } = props;

  return (
    <RNText 
      ref={ref} 
      className={cn('font-bold', className)} 
      style={[{ fontFamily: 'Hanuman_700Bold' }, restProps.style]} 
      {...restProps} 
    />
  );
});

AppHeaderText.displayName = 'AppHeaderText';