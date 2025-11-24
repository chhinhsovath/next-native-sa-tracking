import { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Button, Card, cn, Badge, Select } from '../heroui-native';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/auth/auth-context';
import { useI18n } from '../contexts/i18n-context';
import { AppText } from '../components/app-text';
import { API_BASE_URL } from '../config';

export default function AdminWorkPlanTrackingScreen() {
  const { t } = useI18n();
  const { isDark } = useAppTheme();
  const { token, user } = useAuth();
  const [workPlans, setWorkPlans] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      return;
    }

    fetchWorkPlans();
  }, [user, selectedUser, statusFilter]);

  const fetchWorkPlans = async () => {
    setLoading(true);

    try {
      let url = `${API_BASE_URL}/api/admin/workplan-tracking`;
      const params = new URLSearchParams();
      
      if (selectedUser) params.append('userId', selectedUser);
      if (statusFilter) params.append('status', statusFilter);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWorkPlans(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch work plans');
      }
    } catch (error: any) {
      console.error('Work plan fetch error:', error);
      Alert.alert(t('error'), error.message || t('failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const updateWorkPlanStatus = async (id: string, newStatus: string, comments?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/workplan-tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          status: newStatus,
          comments: comments || `Status updated to ${newStatus} by admin`
        }),
      });

      if (response.ok) {
        Alert.alert(t('success'), t('workPlanStatusUpdated'));
        fetchWorkPlans(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || t('failedToUpdateWorkPlan'));
      }
    } catch (error: any) {
      console.error('Work plan update error:', error);
      Alert.alert(t('error'), error.message || t('failedToUpdateWorkPlan'));
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <View className={cn('flex-1 justify-center items-center p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
        <Card className="w-full max-w-md p-6">
          <Card.Header>
            <Card.Title className="text-xl text-center">{t('accessDenied')}</Card.Title>
          </Card.Header>
          <Card.Body>
            <AppText className="text-center text-muted-foreground">
              {t('adminPrivileges')}
            </AppText>
          </Card.Body>
        </Card>
      </View>
    );
  }

  const renderWorkPlanItem = (wp: any) => (
    <Card key={wp.id} className="mb-3">
      <Card.Header>
        <Card.Title>{wp.title}</Card.Title>
        <Card.Description>{t('by')} {wp.user.firstName} {wp.user.lastName}</Card.Description>
      </Card.Header>
      <Card.Body>
        <View className="flex-row justify-between items-center mb-2">
          <Badge variant="outline">{wp.status}</Badge>
          <AppText className="text-muted-foreground text-sm">
            {t('progress')}: {wp.progress}%
          </AppText>
        </View>
        
        <AppText className="text-muted-foreground mb-2">{wp.description}</AppText>
        
        {wp.achievement && (
          <View className="mb-2">
            <AppText className="font-medium text-sm">{t('achievement')}:</AppText>
            <AppText className="text-muted-foreground">{wp.achievement}</AppText>
          </View>
        )}
        
        {wp.output && (
          <View className="mb-2">
            <AppText className="font-medium text-sm">{t('output')}:</AppText>
            <AppText className="text-muted-foreground">{wp.output}</AppText>
          </View>
        )}
        
        {wp.comments && (
          <View>
            <AppText className="font-medium text-sm">{t('comments')}:</AppText>
            <AppText className="text-muted-foreground">{wp.comments}</AppText>
          </View>
        )}
        
        <View className="mt-3">
          <AppText className="text-xs text-muted-foreground">
            {t('dueDate')}: {new Date(wp.dueDate).toLocaleDateString()}
          </AppText>
          <AppText className="text-xs text-muted-foreground">
            {t('created')}: {new Date(wp.createdAt).toLocaleDateString()}
          </AppText>
        </View>
      </Card.Body>
      <Card.Footer className="gap-2">
        <Select
          value={wp.status}
          onValueChange={(value: any) => updateWorkPlanStatus(wp.id, value)}
        >
          <Select.Trigger className="w-full">
            <Select.Value placeholder={t('updateStatus')} />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="DRAFT">{t('draft')}</Select.Item>
            <Select.Item value="SUBMITTED">{t('submitted')}</Select.Item>
            <Select.Item value="IN_PROGRESS">{t('inProgress')}</Select.Item>
            <Select.Item value="COMPLETED">{t('completed')}</Select.Item>
            <Select.Item value="REJECTED">{t('rejected')}</Select.Item>
          </Select.Content>
        </Select>
      </Card.Footer>
    </Card>
  );

  return (
    <ScrollView className={cn('flex-1 p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
      <Card className="mb-4">
        <Card.Header>
          <Card.Title className="text-2xl text-center">{t('workPlanTracking')}</Card.Title>
          <Card.Description className="text-center">
            {t('monitorAndManageWorkPlans')}
          </Card.Description>
        </Card.Header>
        
        <Card.Body className="gap-4">
          <View className="flex-row gap-2">
            <View className="flex-1">
              <AppText className="text-foreground mb-1">{t('filterByStatus')}</AppText>
              <Select
                value={statusFilter || ''}
                onValueChange={(value: any) => setStatusFilter(value || null)}
              >
                <Select.Trigger>
                  <Select.Value placeholder={t('allStatuses')} />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="">{t('allStatuses')}</Select.Item>
                  <Select.Item value="DRAFT">{t('draft')}</Select.Item>
                  <Select.Item value="SUBMITTED">{t('submitted')}</Select.Item>
                  <Select.Item value="IN_PROGRESS">{t('inProgress')}</Select.Item>
                  <Select.Item value="COMPLETED">{t('completed')}</Select.Item>
                  <Select.Item value="REJECTED">{t('rejected')}</Select.Item>
                </Select.Content>
              </Select>
            </View>
          </View>
        </Card.Body>
      </Card>

      {loading ? (
        <Card>
          <Card.Body>
            <AppText className="text-center">{t('loading')}...</AppText>
          </Card.Body>
        </Card>
      ) : workPlans.length > 0 ? (
        workPlans.map(renderWorkPlanItem)
      ) : (
        <Card>
          <Card.Body>
            <AppText className="text-center text-muted-foreground">
              {t('noWorkPlans')}
            </AppText>
          </Card.Body>
        </Card>
      )}
    </ScrollView>
  );
}