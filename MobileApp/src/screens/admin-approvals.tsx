import { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Button, Card, cn, Badge } from '../heroui-native';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/auth/auth-context';
import { useI18n } from '../contexts/i18n-context';
import { AppText } from '../components/app-text';
import { API_BASE_URL } from '../config';

export default function AdminApprovalsScreen() {
  const { t } = useI18n();
  const { isDark } = useAppTheme();
  const { token, user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [pendingMissions, setPendingMissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'leaves' | 'missions'>('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      return;
    }

    fetchPendingItems();
  }, [user, activeTab]);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);

      // Fetch pending user registrations
      const usersResponse = await fetch(`${API_BASE_URL}/api/admin/approvals?resource=user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setPendingUsers(usersData);
      }

      // Fetch pending leave requests
      const leavesResponse = await fetch(`${API_BASE_URL}/api/admin/approvals?resource=leave`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (leavesResponse.ok) {
        const leavesData = await leavesResponse.json();
        setPendingLeaves(leavesData);
      }

      // Fetch pending mission requests
      const missionsResponse = await fetch(`${API_BASE_URL}/api/admin/approvals?resource=mission`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (missionsResponse.ok) {
        const missionsData = await missionsResponse.json();
        setPendingMissions(missionsData);
      }
    } catch (error) {
      console.error('Error fetching pending items:', error);
      Alert.alert(t('error'), t('failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const approveItem = async (id: string, resource: 'user' | 'leave' | 'mission') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/approvals?resource=${resource}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          status: resource === 'user' ? 'STAFF' : 'APPROVED', // For user registration, set role to STAFF
        }),
      });

      if (response.ok) {
        Alert.alert(t('success'), t('itemApprovedSuccess', { resource }));
        fetchPendingItems(); // Refresh the list
      } else {
        const data = await response.json();
        throw new Error(data.message || t('approvalFailed'));
      }
    } catch (error: any) {
      console.error('Approval error:', error);
      Alert.alert(t('error'), error.message || t('failedToApproveItem'));
    }
  };

  const rejectItem = async (id: string, resource: 'user' | 'leave' | 'mission') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/approvals?resource=${resource}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          status: resource === 'user' ? 'STAFF' : 'REJECTED', // For user registration, we still set to STAFF but deactivate
        }),
      });

      if (response.ok) {
        Alert.alert(t('success'), t('itemRejectedSuccess', { resource }));
        fetchPendingItems(); // Refresh the list
      } else {
        const data = await response.json();
        throw new Error(data.message || t('rejectionFailed'));
      }
    } catch (error: any) {
      console.error('Rejection error:', error);
      Alert.alert(t('error'), error.message || t('failedToRejectItem'));
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

  const renderUserItem = (item: any) => (
    <Card key={item.id} className="mb-3">
      <Card.Header>
        <Card.Title>{item.firstName} {item.lastName}</Card.Title>
        <Card.Description>{item.email}</Card.Description>
      </Card.Header>
      <Card.Body>
        <AppText className="text-muted-foreground">{t('position')}: {item.position || t('notAvailable')}</AppText>
        <AppText className="text-muted-foreground">{t('department')}: {item.department || t('notAvailable')}</AppText>
        <AppText className="text-muted-foreground mt-1">
          {t('registered')}: {new Date(item.registeredAt).toLocaleDateString()}
        </AppText>
      </Card.Body>
      <Card.Footer className="flex-row justify-between">
        <Button 
          variant="destructive" 
          size="sm"
          onPress={() => rejectItem(item.id, 'user')}
        >
          <AppText className="text-background text-sm">{t('reject')}</AppText>
        </Button>
        <Button 
          variant="default" 
          size="sm"
          onPress={() => approveItem(item.id, 'user')}
        >
          <AppText className="text-foreground text-sm">{t('approve')}</AppText>
        </Button>
      </Card.Footer>
    </Card>
  );

  const renderLeaveItem = (item: any) => (
    <Card key={item.id} className="mb-3">
      <Card.Header>
        <Card.Title>{item.user.firstName} {item.user.lastName}</Card.Title>
        <Card.Description>{item.user.email}</Card.Description>
      </Card.Header>
      <Card.Body>
        <AppText className="text-muted-foreground">{t('reasonForLeave')}: {item.reason}</AppText>
        <View className="flex-row justify-between mt-2">
          <AppText className="text-muted-foreground">
            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
          </AppText>
          <Badge variant="outline">{item.status}</Badge>
        </View>
      </Card.Body>
      <Card.Footer className="flex-row justify-between">
        <Button 
          variant="destructive" 
          size="sm"
          onPress={() => rejectItem(item.id, 'leave')}
        >
          <AppText className="text-background text-sm">{t('reject')}</AppText>
        </Button>
        <Button 
          variant="default" 
          size="sm"
          onPress={() => approveItem(item.id, 'leave')}
        >
          <AppText className="text-foreground text-sm">{t('approve')}</AppText>
        </Button>
      </Card.Footer>
    </Card>
  );

  const renderMissionItem = (item: any) => (
    <Card key={item.id} className="mb-3">
      <Card.Header>
        <Card.Title>{item.title}</Card.Title>
        <Card.Description>{t('by')} {item.user.firstName} {item.user.lastName}</Card.Description>
      </Card.Header>
      <Card.Body>
        <AppText className="text-muted-foreground">{item.description}</AppText>
        <View className="flex-row justify-between mt-2">
          <AppText className="text-muted-foreground">
            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
          </AppText>
          <Badge variant="outline">{item.status}</Badge>
        </View>
      </Card.Body>
      <Card.Footer className="flex-row justify-between">
        <Button 
          variant="destructive" 
          size="sm"
          onPress={() => rejectItem(item.id, 'mission')}
        >
          <AppText className="text-background text-sm">{t('reject')}</AppText>
        </Button>
        <Button 
          variant="default" 
          size="sm"
          onPress={() => approveItem(item.id, 'mission')}
        >
          <AppText className="text-foreground text-sm">{t('approve')}</AppText>
        </Button>
      </Card.Footer>
    </Card>
  );

  return (
    <View className={cn('flex-1', isDark ? 'bg-background' : 'bg-muted/30')}>
      <Card className="mb-0">
        <Card.Header>
          <Card.Title className="text-2xl text-center">{t('approvals')}</Card.Title>
          <Card.Description className="text-center">
            {t('reviewAndApprove')}
          </Card.Description>
        </Card.Header>
      </Card>
      
      <View className="flex-row bg-muted p-1 m-4 rounded-lg">
        <Button 
          variant={activeTab === 'users' ? 'default' : 'ghost'}
          className="flex-1"
          onPress={() => setActiveTab('users')}
        >
          <AppText className={activeTab === 'users' ? "text-foreground" : "text-muted-foreground"}>
            {t('users')} ({pendingUsers.length})
          </AppText>
        </Button>
        <Button 
          variant={activeTab === 'leaves' ? 'default' : 'ghost'}
          className="flex-1"
          onPress={() => setActiveTab('leaves')}
        >
          <AppText className={activeTab === 'leaves' ? "text-foreground" : "text-muted-foreground"}>
            {t('leaves')} ({pendingLeaves.length})
          </AppText>
        </Button>
        <Button 
          variant={activeTab === 'missions' ? 'default' : 'ghost'}
          className="flex-1"
          onPress={() => setActiveTab('missions')}
        >
          <AppText className={activeTab === 'missions' ? "text-foreground" : "text-muted-foreground"}>
            {t('missions')} ({pendingMissions.length})
          </AppText>
        </Button>
      </View>
      
      <ScrollView className="flex-1 p-4">
        {loading ? (
          <AppText className="text-center">{t('loading')}...</AppText>
        ) : activeTab === 'users' ? (
          pendingUsers.length > 0 ? (
            pendingUsers.map(renderUserItem)
          ) : (
            <Card>
              <Card.Body>
                <AppText className="text-center text-muted-foreground">
                  {t('noPendingUsers')}
                </AppText>
              </Card.Body>
            </Card>
          )
        ) : activeTab === 'leaves' ? (
          pendingLeaves.length > 0 ? (
            pendingLeaves.map(renderLeaveItem)
          ) : (
            <Card>
              <Card.Body>
                <AppText className="text-center text-muted-foreground">
                  {t('noPendingLeaves')}
                </AppText>
              </Card.Body>
            </Card>
          )
        ) : (
          pendingMissions.length > 0 ? (
            pendingMissions.map(renderMissionItem)
          ) : (
            <Card>
              <Card.Body>
                <AppText className="text-center text-muted-foreground">
                  {t('noPendingMissions')}
                </AppText>
              </Card.Body>
            </Card>
          )
        )}
      </ScrollView>
    </View>
  );
}