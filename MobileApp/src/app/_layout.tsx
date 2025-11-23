import {
  Hanuman_300Light,
  Hanuman_400Regular,
  Hanuman_500Medium,
  Hanuman_700Bold,
  useFonts,
} from '@expo-google-fonts/hanuman';
import { SplashScreen, Stack, router, useSegments } from 'expo-router';
import { HeroUINativeProvider } from '../heroui-native';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import '../../global.css';
import { AppThemeProvider } from '../contexts/app-theme-context';
import { AuthProvider, useAuth } from '../contexts/auth/auth-context';
import { I18nProvider } from '../contexts/i18n-context';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// Create a separate component to handle auth state and route protection
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading, user } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    // Check if we're on auth routes
    const currentRoute = segments[0];
    const isAuthRoute = currentRoute === 'login' || currentRoute === 'register';
    
    if (!isLoading) {
      if (!user && !isAuthRoute) {
        // User is not logged in and not on auth route, redirect to login
        router.replace('/login');
      } else if (user && isAuthRoute) {
        // User is logged in but on auth route, redirect to home
        router.replace('/');
      }
    }
  }, [isLoading, user, segments]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}

function RootLayout() {
  const fonts = useFonts({
    Hanuman_300Light,
    Hanuman_400Regular,
    Hanuman_500Medium,
    Hanuman_700Bold,
  });

  if (!fonts) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <AppThemeProvider>
          <AuthProvider>
            <AuthWrapper>
              <I18nProvider>
                <HeroUINativeProvider
                  config={{
                    textProps: {
                      allowFontScaling: false,
                    },
                  }}
                >
                  <Stack screenOptions={{ 
                    headerShown: false 
                  }}>
                    <Stack.Screen 
                      name="(home)/index" 
                      options={{ headerShown: false }} 
                    />
                    <Stack.Screen 
                      name="login" 
                      options={{ 
                        headerShown: true,
                        title: 'Login',
                      }} 
                    />
                    <Stack.Screen 
                      name="register" 
                      options={{ 
                        headerShown: true,
                        title: 'Register',
                      }} 
                    />
                    <Stack.Screen 
                      name="attendance" 
                      options={{ 
                        headerShown: true,
                        title: 'Attendance',
                      }} 
                    />
                    <Stack.Screen 
                      name="leave-request" 
                      options={{ 
                        headerShown: true,
                        title: 'Leave Request',
                      }} 
                    />
                    <Stack.Screen 
                      name="mission-request" 
                      options={{ 
                        headerShown: true,
                        title: 'Mission Request',
                      }} 
                    />
                    <Stack.Screen 
                      name="work-plan" 
                      options={{ 
                        headerShown: true,
                        title: 'Work Plan',
                      }} 
                    />
                    <Stack.Screen 
                      name="profile" 
                      options={{ 
                        headerShown: true,
                        title: 'Profile',
                      }} 
                    />
                    <Stack.Screen 
                      name="admin-dashboard" 
                      options={{ 
                        headerShown: true,
                        title: 'Admin Dashboard',
                      }} 
                    />
                    <Stack.Screen 
                      name="admin-approvals" 
                      options={{ 
                        headerShown: true,
                        title: 'Admin Approvals',
                      }} 
                    />
                    <Stack.Screen 
                      name="admin-reports" 
                      options={{ 
                        headerShown: true,
                        title: 'Admin Reports',
                      }} 
                    />
                    <Stack.Screen 
                      name="admin-workplan-tracking" 
                      options={{ 
                        headerShown: true,
                        title: 'Work Plan Tracking',
                      }} 
                    />
                  </Stack>
                </HeroUINativeProvider>
              </I18nProvider>
            </AuthWrapper>
          </AuthProvider>
        </AppThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

export default RootLayout;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});