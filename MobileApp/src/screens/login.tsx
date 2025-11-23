import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button, Card, Input, cn } from '../heroui-native';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/auth/auth-context';
import { useI18n } from '../contexts/i18n-context';
import { AppText } from '../components/app-text';
import { AppHeaderText } from '../components/app-header-text';
import { AppTitleText } from '../components/app-title-text';

export default function LoginScreen() {
  const { isDark } = useAppTheme();
  const { login } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('pleaseFillFields'));
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        router.replace('/'); // Redirect to home after login
      } else {
        Alert.alert(t('error'), t('email') + ' ' + t('password') + ' ' + 'មិន​ត្រឹម​ត្រូវ');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(t('error'), t('authenticationError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={cn('flex-1 justify-center p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
      <Card className="w-full max-w-md mx-auto">
        <Card.Header>
          <AppHeaderText className="text-2xl text-center">{t('login')}</AppHeaderText>
          <AppTitleText className="text-center mt-2 text-muted-foreground">
            {t('enterCredentials')}
          </AppTitleText>
        </Card.Header>
        
        <Card.Body className="gap-4">
          <Input
            label={t('email')}
            placeholder={t('email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Input
            label={t('password')}
            placeholder={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </Card.Body>
        
        <Card.Footer className="gap-3">
          <Button onPress={handleLogin} loading={loading}>
            <AppText className="text-foreground text-base">
              {loading ? t('loading') : t('login')}
            </AppText>
          </Button>
          
          <View className="flex-row justify-center mt-2">
            <AppText className="text-muted">
              {t('dontHaveAccount')}{' '}
            </AppText>
            <Button 
              variant="link" 
              onPress={() => router.push('/register')}
            >
              <AppText className="text-primary font-medium">{t('register')}</AppText>
            </Button>
          </View>
        </Card.Footer>
      </Card>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
}