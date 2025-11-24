import { cn } from '../../heroui-native';
import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

export const AppTitleText = React.forwardRef<RNText, RNTextProps>((props, ref) => {
  const { className, ...restProps } = props;

  return (
    <RNText 
      ref={ref} 
      className={cn('font-medium', className)} 
      style={[{ fontFamily: 'Hanuman_500Medium' }, restProps.style]} 
      {...restProps} 
    />
  );
});

AppTitleText.displayName = 'AppTitleText';