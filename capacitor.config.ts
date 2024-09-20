import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'test-send-noti',
  webDir: 'www',
  server:{
    androidScheme: 'https'
  },
  ios:{
    handleApplicationNotifications: false
  }
};

export default config;
