
import React from 'react';
import { Image } from 'react-native';

const AppLogo = () => {
  return (
    <Image 
      source={require('@/assets/images/scan-removebg-preview.png')} 
      style={{ width: 30, height: 30 }}
    />
  );
};

export default AppLogo;