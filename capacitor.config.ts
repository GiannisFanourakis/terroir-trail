import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.terroirtrail.app',
  appName: 'TerroirTrail',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      backgroundColor: '#0c0a09',
      showSpinner: false
    },
    StatusBar: {
      backgroundColor: '#0c0a09'
    },
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ['google.com', 'apple.com']
    }
  }
};

export default config;
