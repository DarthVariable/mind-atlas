import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Mind Atlas',
  webDir: 'www',
  ios: {
    // @ts-expect-error - packageManager is supported but not in CapacitorConfig types
    packageManager: 'CocoaPods'
  },
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/MindAtlasDatabase',
      iosIsEncryption: false,
      iosKeychainPrefix: 'mindatlas',
      androidIsEncryption: false
      // Note: Android database location is automatic: /data/data/<package>/databases/
      // Biometric auth settings omitted - can be added later if needed
    },
    StatusBar: {
      overlaysWebView: true,
      style: 'LIGHT',
      backgroundColor: '#ffffff'
    },
    Keyboard: {
      resize: 'none',
      style: 'dark'
    }
  }
};

export default config;
