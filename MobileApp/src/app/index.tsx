import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Button, Card, cn } from '../../heroui-native';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/auth/auth-context';
import { useI18n } from '../contexts/i18n-context';
import { AppText } from '../components/app-text';
import { AppHeaderText } from '../components/app-header-text';
import { AppTitleText } from '../components/app-title-text';

export default function Index() {
  const { isDark, toggleTheme } = useAppTheme();
  const { user, isLoading, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  // Redirect based on authentication status
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      }
    }
  }, [user, isLoading]);

  // Show nothing while checking auth status
  if (isLoading || !user) {
    return null;
  }

  return (
    <View className={cn('flex-1 justify-center p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
      <View className="items-center mb-8">
        <Card className="w-full max-w-md p-6">
          <Card.Header>
            <AppHeaderText className="text-2xl text-center">
              {t('welcome')}, {user.firstName} {user.lastName}
            </AppHeaderText>
            <AppTitleText className="text-center mt-2 text-muted-foreground">
              {t('role')}: {user.role}
            </AppTitleText>
          </Card.Header>
          
          <Card.Body className="gap-4">
            <Button 
              className="w-full" 
              onPress={() => router.push('/attendance')}
              variant="default"
            >
              <AppText className="text-foreground text-base">
                {t('attendance')}
              </AppText>
            </Button>
            
            {user.role === 'STAFF' && (
              <>
                <Button 
                  className="w-full" 
                  onPress={() => router.push('/leave-request')}
                  variant="outline"
                >
                  <AppText className="text-foreground text-base">
                    {t('leaveRequest')}
                  </AppText>
                </Button>
                
                <Button 
                  className="w-full" 
                  onPress={() => router.push('/mission-request')}
                  variant="outline"
                >
                  <AppText className="text-foreground text-base">
                    {t('missionRequest')}
                  </AppText>
                </Button>
                
                <Button 
                  className="w-full" 
                  onPress={() => router.push('/work-plan')}
                  variant="outline"
                >
                  <AppText className="text-foreground text-base">
                    {t('workPlan')}
                  </AppText>
                </Button>
              </>
            )}
            
            {user.role === 'ADMIN' && (
              <>
                <Button 
                  className="w-full" 
                  onPress={() => router.push('/admin-dashboard')}
                  variant="default"
                >
                  <AppText className="text-foreground text-base">
                    {t('adminDashboard')}
                  </AppText>
                </Button>
                
                <Button 
                  className="w-full" 
                  onPress={() => router.push('/admin-approvals')}
                  variant="outline"
                >
                  <AppText className="text-foreground text-base">
                    {t('approvals')}
                  </AppText>
                </Button>
                
                <Button 
                  className="w-full" 
                  onPress={() => router.push('/admin-reports')}
                  variant="outline"
                >
                  <AppText className="text-foreground text-base">
                    {t('reports')}
                  </AppText>
                </Button>
                
                <Button 
                  className="w-full" 
                  onPress={() => router.push('/admin-workplan-tracking')}
                  variant="outline"
                >
                  <AppText className="text-foreground text-base">
                    {t('workPlanTracking')}
                  </AppText>
                </Button>
              </>
            )}
          </Card.Body>
          
          <Card.Footer className="gap-3">
            <Button 
              variant="outline" 
              className="w-full"
              onPress={() => router.push('/profile')}
            >
              <AppText className="text-foreground text-base">
                {t('profile')}
              </AppText>
            </Button>
            
            <Button 
              variant="destructive" 
              className="w-full"
              onPress={async () => {
                await logout();
                router.replace('/login');
              }}
            >
              <AppText className="text-background text-base">
                {t('logout')}
              </AppText>
            </Button>
          </Card.Footer>
        </Card>
      </View>
    </View>
  );
}