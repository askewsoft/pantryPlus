import * as Updates from 'expo-updates';
import * as Application from 'expo-application';
import { Alert } from 'react-native';
import appConfig from '@/config/app';

class UpdateService {
  private isCheckingForUpdates = false;

  /**
   * Check if we should allow updates in the current environment
   */
  private shouldAllowUpdates(): boolean {
    // Don't allow updates if expo-updates is not enabled
    if (!Updates.isEnabled) {
      if (appConfig.debug) {
        console.log('Updates disabled: expo-updates is not enabled');
      }
      return false;
    }

    // Don't allow updates in development mode
    if (__DEV__) {
      if (appConfig.debug) {
        console.log('Updates disabled: Running in development mode');
      }
      return false;
    }

    // Don't allow updates in Expo Go
    if (Updates.channel === 'default') {
      if (appConfig.debug) {
        console.log('Updates disabled: Running in Expo Go');
      }
      return false;
    }

    return true;
  }

  /**
   * Check for updates and apply them if available
   * This should be called on app startup
   */
  async checkForUpdates(): Promise<void> {
    if (this.isCheckingForUpdates) {
      return;
    }

    // Early return if updates shouldn't be allowed
    if (!this.shouldAllowUpdates()) {
      return;
    }

    this.isCheckingForUpdates = true;

    try {
      if (appConfig.debug) {
        console.log('Checking for updates...');
      }

      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        if (appConfig.debug) {
          console.log('Update available:', update);
        }
        
        // Show user notification about the update
        Alert.alert(
          'Update Available',
          'A new version of pantryPlus is available. The app will restart to apply the update.',
          [
            {
              text: 'Update Now',
              onPress: async () => {
                try {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } catch (error) {
                  console.error('Error applying update:', error);
                  Alert.alert('Update Failed', 'Failed to apply the update. Please try again later.');
                }
              }
            },
            {
              text: 'Later',
              style: 'cancel'
            }
          ]
        );
      } else if (appConfig.debug) {
        console.log('No updates available');
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      // Don't show error to user for update check failures
    } finally {
      this.isCheckingForUpdates = false;
    }
  }

  /**
   * Manually check for updates (can be called from settings)
   */
  async manualUpdateCheck(): Promise<boolean> {
    try {
      // Check if updates should be allowed
      if (!this.shouldAllowUpdates()) {
        Alert.alert('Development Build', 'Updates are not available in development builds.');
        return false;
      }

      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        Alert.alert(
          'Update Available',
          'A new version is available. Would you like to update now?',
          [
            {
              text: 'Update Now',
              onPress: async () => {
                try {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } catch (error) {
                  console.error('Error applying update:', error);
                  Alert.alert('Update Failed', 'Failed to apply the update. Please try again later.');
                }
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
        return true;
      } else {
        Alert.alert('No Updates', 'You are running the latest version of pantryPlus.');
        return false;
      }
    } catch (error) {
      console.error('Error during manual update check:', error);
      Alert.alert('Update Check Failed', 'Unable to check for updates. Please try again later.');
      return false;
    }
  }

  /**
   * Get current update information
   */
  getAboutInfo() {
    return {
      updatesEnabled: Updates.isEnabled,
      createdAt: (Updates.createdAt ?? new Date()).toLocaleString(),
      updatesAllowed: this.shouldAllowUpdates(),
      // App version comes from CFBundleShortVersionString in iOS Info.plist
      // This is set from the "version" field in app.json during build
      appVersion: Application.nativeApplicationVersion,
      // Build version comes from CFBundleVersion in iOS Info.plist
      buildVersion: Application.nativeBuildVersion
    };
  }
}

export const updateService = new UpdateService(); 