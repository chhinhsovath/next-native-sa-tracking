import { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Card, cn, Progress } from '../heroui-native';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/auth/auth-context';
import { AppText } from '../components/app-text';

export default function AdminDashboardScreen() {
  const { isDark } = useAppTheme();
  const { token, user } = useAuth();
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      // Redirect or show error if not admin
      return;
    }

    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch summary reports
      const response = await fetch('http://localhost:3000/api/admin/reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <View className={cn('flex-1 justify-center items-center p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
        <Card className="w-full max-w-md p-6">
          <Card.Header>
            <Card.Title className="text-xl text-center">Access Denied</Card.Title>
          </Card.Header>
          <Card.Body>
            <AppText className="text-center text-muted-foreground">
              You don't have admin privileges to access this area.
            </AppText>
          </Card.Body>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView className={cn('flex-1 p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
      <View className="gap-4">
        <Card>
          <Card.Header>
            <Card.Title className="text-2xl">Admin Dashboard</Card.Title>
            <Card.Description>Overview of system activity</Card.Description>
          </Card.Header>
        </Card>

        {loading ? (
          <Card>
            <Card.Body>
              <AppText className="text-center">Loading dashboard...</AppText>
            </Card.Body>
          </Card>
        ) : (
          <>
            <View className="flex-row justify-between gap-2">
              <Card className="flex-1">
                <Card.Header>
                  <Card.Title className="text-center">{reports?.users || 0}</Card.Title>
                  <Card.Description className="text-center">Total Users</Card.Description>
                </Card.Header>
              </Card>
              
              <Card className="flex-1">
                <Card.Header>
                  <Card.Title className="text-center">{reports?.attendance || 0}</Card.Title>
                  <Card.Description className="text-center">Attendance Records</Card.Description>
                </Card.Header>
              </Card>
            </View>

            <View className="flex-row justify-between gap-2">
              <Card className="flex-1">
                <Card.Header>
                  <Card.Title className="text-center">{reports?.leaveRequests || 0}</Card.Title>
                  <Card.Description className="text-center">Leave Requests</Card.Description>
                </Card.Header>
              </Card>
              
              <Card className="flex-1">
                <Card.Header>
                  <Card.Title className="text-center">{reports?.missionRequests || 0}</Card.Title>
                  <Card.Description className="text-center">Mission Requests</Card.Description>
                </Card.Header>
              </Card>
            </View>

            <Card>
              <Card.Header>
                <Card.Title>Quick Actions</Card.Title>
              </Card.Header>
              <Card.Body className="gap-3">
                <Button variant="default" className="w-full">
                  <AppText className="text-foreground text-base font-medium">
                    View Pending Approvals
                  </AppText>
                </Button>
                
                <Button variant="outline" className="w-full">
                  <AppText className="text-foreground text-base font-medium">
                    Generate Reports
                  </AppText>
                </Button>
                
                <Button variant="outline" className="w-full">
                  <AppText className="text-foreground text-base font-medium">
                    Manage Users
                  </AppText>
                </Button>
                
                <Button variant="outline" className="w-full">
                  <AppText className="text-foreground text-base font-medium">
                    Track Work Plans
                  </AppText>
                </Button>
              </Card.Body>
            </Card>
          </>
        )}
      </View>
    </ScrollView>
  );
}