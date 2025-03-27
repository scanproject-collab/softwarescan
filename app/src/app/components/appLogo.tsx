
import React from 'react';
import { Image } from 'react-native';

const AppLogo = () => {
  return (
    <Image 
      source={require('@/assets/images/scan-removebg-preview.png')} 
      style={{ width: 50, height: 50 }}
    />
  );
};

export default AppLogo;