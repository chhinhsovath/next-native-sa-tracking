import { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Button, Card, cn, DatePicker } from '../heroui-native';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/auth/auth-context';
import { AppText } from '../components/app-text';

export default function AdminReportsScreen() {
  const { isDark } = useAppTheme();
  const { token, user } = useAuth();
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      return;
    }

    generateReport();
  }, [user, reportType, startDate, endDate]);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Validation Error', 'Please select both start and end dates');
      return;
    }

    if (startDate > endDate) {
      Alert.alert('Validation Error', 'End date must be after start date');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/reports?reportType=${reportType}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Report generation failed');
      }
    } catch (error: any) {
      console.error('Report generation error:', error);
      Alert.alert('Error', error.message || 'Failed to generate report');
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

  const renderReportItem = (title: string, count: number, icon: string = '📊') => (
    <Card key={title} className="mb-3">
      <Card.Body className="flex-row items-center">
        <View className="bg-muted p-3 rounded-lg mr-3">
          <AppText className="text-xl">{icon}</AppText>
        </View>
        <View className="flex-1">
          <AppText className="font-semibold">{title}</AppText>
          <AppText className="text-2xl font-bold text-primary">{count}</AppText>
        </View>
      </Card.Body>
    </Card>
  );

  return (
    <ScrollView className={cn('flex-1 p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
      <Card className="mb-4">
        <Card.Header>
          <Card.Title className="text-2xl text-center">Admin Reports</Card.Title>
          <Card.Description className="text-center">
            Generate and view reports for staff activities
          </Card.Description>
        </Card.Header>
        
        <Card.Body className="gap-4">
          <View className="flex-row flex-wrap gap-2">
            <Button 
              variant={reportType === 'daily' ? 'default' : 'outline'}
              size="sm"
              onPress={() => setReportType('daily')}
            >
              <AppText className={reportType === 'daily' ? "text-foreground" : "text-muted-foreground"}>
                Daily
              </AppText>
            </Button>
            <Button 
              variant={reportType === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onPress={() => setReportType('weekly')}
            >
              <AppText className={reportType === 'weekly' ? "text-foreground" : "text-muted-foreground"}>
                Weekly
              </AppText>
            </Button>
            <Button 
              variant={reportType === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onPress={() => setReportType('monthly')}
            >
              <AppText className={reportType === 'monthly' ? "text-foreground" : "text-muted-foreground"}>
                Monthly
              </AppText>
            </Button>
          </View>
          
          <View className="flex-row gap-2">
            <View className="flex-1">
              <AppText className="text-foreground mb-1">Start Date</AppText>
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                maximumDate={endDate || undefined}
                placeholder="Select start date"
              />
            </View>
            
            <View className="flex-1">
              <AppText className="text-foreground mb-1">End Date</AppText>
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                minimumDate={startDate || undefined}
                placeholder="Select end date"
              />
            </View>
          </View>
          
          <Button 
            onPress={generateReport} 
            loading={loading}
            disabled={loading}
          >
            <AppText className="text-foreground text-base font-medium">
              {loading ? 'Generating...' : 'Generate Report'}
            </AppText>
          </Button>
        </Card.Body>
      </Card>

      {reports && (
        <View>
          <Card className="mb-4">
            <Card.Header>
              <Card.Title>Summary Report</Card.Title>
            </Card.Header>
            <Card.Body>
              {reportType === 'daily' && renderReportItem('Attendance Records', reports.attendance || 0, '⏱️')}
              {reportType === 'daily' && renderReportItem('Leave Requests', reports.leaveRequests || 0, '🌴')}
              {reportType === 'daily' && renderReportItem('Mission Requests', reports.missionRequests || 0, '🎯')}
              {reportType === 'daily' && renderReportItem('Work Plans', reports.workPlans || 0, '📋')}
            </Card.Body>
          </Card>
          
          {reportType !== 'daily' && reports && Array.isArray(reports) && reports.length > 0 && (
            <Card>
              <Card.Header>
                <Card.Title>Detailed Report</Card.Title>
              </Card.Header>
              <Card.Body>
                {reports.map((item: any, index: number) => (
                  <View key={index} className="border-b border-muted py-2">
                    <AppText className="font-medium">
                      {item.user ? `${item.user.firstName} ${item.user.lastName}` : 'N/A'}
                    </AppText>
                    <AppText className="text-sm text-muted-foreground">
                      {item.title || item.reason || 'No description'}
                    </AppText>
                    <AppText className="text-xs text-muted-foreground">
                      {new Date(item.timestamp || item.createdAt).toLocaleString()}
                    </AppText>
                  </View>
                ))}
              </Card.Body>
            </Card>
          )}
        </View>
      )}
    </ScrollView>
  );
}