import { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Button, Card, cn, DatePicker } from '../heroui-native';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/auth/auth-context';
import { useI18n } from '../contexts/i18n-context';
import { AppText } from '../components/app-text';
import { API_BASE_URL } from '../config';

export default function AdminReportsScreen() {
  const { t } = useI18n();
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
      Alert.alert(t('validationError'), t('selectStartAndEndDates'));
      return;
    }

    if (startDate > endDate) {
      Alert.alert(t('validationError'), t('endDateAfterStart'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/reports?reportType=${reportType}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, 
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
        throw new Error(errorData.message || t('reportGenerationFailed'));
      }
    } catch (error: any) {
      console.error('Report generation error:', error);
      Alert.alert(t('error'), error.message || t('reportGenerationFailed'));
    } finally {
      setLoading(false);
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
          <Card.Title className="text-2xl text-center">{t('reports')}</Card.Title>
          <Card.Description className="text-center">
            {t('generateAndViweReports')}
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
                {t('daily')}
              </AppText>
            </Button>
            <Button 
              variant={reportType === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onPress={() => setReportType('weekly')}
            >
              <AppText className={reportType === 'weekly' ? "text-foreground" : "text-muted-foreground"}>
                {t('weekly')}
              </AppText>
            </Button>
            <Button 
              variant={reportType === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onPress={() => setReportType('monthly')}
            >
              <AppText className={reportType === 'monthly' ? "text-foreground" : "text-muted-foreground"}>
                {t('monthly')}
              </AppText>
            </Button>
          </View>
          
          <View className="flex-row gap-2">
            <View className="flex-1">
              <AppText className="text-foreground mb-1">{t('startDate')}</AppText>
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                maximumDate={endDate || undefined}
                placeholder={t('selectStartDate')}
              />
            </View>
            
            <View className="flex-1">
              <AppText className="text-foreground mb-1">{t('endDate')}</AppText>
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                minimumDate={startDate || undefined}
                placeholder={t('selectEndDate')}
              />
            </View>
          </View>
          
          <Button 
            onPress={generateReport} 
            loading={loading}
            disabled={loading}
          >
            <AppText className="text-foreground text-base font-medium">
              {loading ? t('generating') : t('generateReport')}
            </AppText>
          </Button>
        </Card.Body>
      </Card>

      {reports && (
        <View>
          <Card className="mb-4">
            <Card.Header>
              <Card.Title>{t('summaryReport')}</Card.Title>
            </Card.Header>
            <Card.Body>
              {reportType === 'daily' && renderReportItem(t('attendanceRecords'), reports.attendance || 0, '⏱️')}
              {reportType === 'daily' && renderReportItem(t('leaveRequests'), reports.leaveRequests || 0, '🌴')}
              {reportType === 'daily' && renderReportItem(t('missionRequests'), reports.missionRequests || 0, '🎯')}
              {reportType === 'daily' && renderReportItem(t('workPlan'), reports.workPlans || 0, '📋')}
            </Card.Body>
          </Card>
          
          {reportType !== 'daily' && reports && Array.isArray(reports) && reports.length > 0 && (
            <Card>
              <Card.Header>
                <Card.Title>{t('detailedReport')}</Card.Title>
              </Card.Header>
              <Card.Body>
                {reports.map((item: any, index: number) => (
                  <View key={index} className="border-b border-muted py-2">
                    <AppText className="font-medium">
                      {item.user ? `${item.user.firstName} ${item.user.lastName}` : t('notAvailable')}
                    </AppText>
                    <AppText className="text-sm text-muted-foreground">
                      {item.title || item.reason || t('noDescription')}
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