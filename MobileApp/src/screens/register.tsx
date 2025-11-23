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

export default function RegisterScreen() {
  const { isDark } = useAppTheme();
  const { register } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert(t('error'), t('pleaseFillFields'));
      return;
    }

    setLoading(true);
    try {
      const success = await register(email, password, firstName, lastName, position, department);
      if (success) {
        Alert.alert(t('success'), t('profileUpdated'), [
          { text: t('ok'), onPress: () => router.push('/login') }
        ]);
      } else {
        Alert.alert(t('error'), t('authenticationError'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(t('error'), t('authenticationError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={cn('flex-1 justify-center p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
      <Card className="w-full max-w-md mx-auto">
        <Card.Header>
          <AppHeaderText className="text-2xl text-center">{t('register')}</AppHeaderText>
          <AppTitleText className="text-center mt-2 text-muted-foreground">
            {t('createAccount')}
          </AppTitleText>
        </Card.Header>
        
        <Card.Body className="gap-4">
          <Input
            label={t('firstName')}
            placeholder={t('firstName')}
            value={firstName}
            onChangeText={setFirstName}
          />
          
          <Input
            label={t('lastName')}
            placeholder={t('lastName')}
            value={lastName}
            onChangeText={setLastName}
          />
          
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
          
          <Input
            label={t('position')}
            placeholder={t('position') + ' (' + t('optional').toLowerCase() + ')'}
            value={position}
            onChangeText={setPosition}
          />
          
          <Input
            label={t('department')}
            placeholder={t('department') + ' (' + t('optional').toLowerCase() + ')'}
            value={department}
            onChangeText={setDepartment}
          />
        </Card.Body>
        
        <Card.Footer className="gap-3">
          <Button onPress={handleRegister} loading={loading}>
            <AppText className="text-foreground text-base">
              {loading ? t('loading') : t('register')}
            </AppText>
          </Button>
          
          <View className="flex-row justify-center mt-2">
            <AppText className="text-muted">
              {t('alreadyHaveAccount')}{' '}
            </AppText>
            <Button 
              variant="link" 
              onPress={() => router.push('/login')}
            >
              <AppText className="text-primary font-medium">{t('login')}</AppText>
            </Button>
          </View>
        </Card.Footer>
      </Card>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
}