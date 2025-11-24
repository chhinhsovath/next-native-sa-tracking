import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button, Card, Input, DatePicker, cn } from '../heroui-native';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/auth/auth-context';
import { useI18n } from '../contexts/i18n-context';
import { AppText } from '../components/app-text';
import { API_BASE_URL } from '../config';

export default function LeaveRequestScreen() {
  const { t } = useI18n();
  const { isDark } = useAppTheme();
  const { token } = useAuth();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const submitLeaveRequest = async () => {
    if (!startDate || !endDate) {
      Alert.alert(t('validationError'), t('selectStartAndEndDates'));
      return;
    }

    if (startDate > endDate) {
      Alert.alert(t('validationError'), t('endDateAfterStart'));
      return;
    }

    if (!reason.trim()) {
      Alert.alert(t('validationError'), t('enterReasonLeave'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/leave/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          t('success'), 
          t('leaveSubmitSuccess'),
          [
            {
              text: t('ok'),
              onPress: () => {
                // Reset form
                setStartDate(null);
                setEndDate(null);
                setReason('');
              }
            }
          ]
        );
      } else {
        throw new Error(data.message || t('leaveRequestSubmissionFailed'));
      }
    } catch (error: any) {
      console.error('Leave request error:', error);
      Alert.alert(t('error'), error.message || t('errorSubmittingLeaveRequest'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={cn('flex-1 justify-start p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
      <Card className="w-full">
        <Card.Header>
          <Card.Title className="text-2xl text-center">{t('leaveRequest')}</Card.Title>
          <Card.Description className="text-center mt-2">
            {t('submitRequestForTimeOff')}
          </Card.Description>
        </Card.Header>
        
        <Card.Body className="gap-4">
          <Input
            label={t('reasonForLeave')}
            placeholder={t('enterReason')}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          
          <View className="flex-row gap-2">
            <View className="flex-1">
              <AppText className="text-foreground mb-1">{t('startDate')}</AppText>
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                maximumDate={endDate || undefined} // Cannot select start date after end date
                placeholder={t('selectStartDate')}
              />
            </View>
            
            <View className="flex-1">
              <AppText className="text-foreground mb-1">{t('endDate')}</AppText>
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                minimumDate={startDate || undefined} // Cannot select end date before start date
                placeholder={t('selectEndDate')}
              />
            </View>
          </View>
        </Card.Body>
        
        <Card.Footer className="gap-3">
          <Button onPress={submitLeaveRequest} loading={loading}>
            <AppText className="text-foreground text-base font-medium">
              {loading ? t('submitting') : t('submitRequest')}
            </AppText>
          </Button>
        </Card.Footer>
      </Card>
    </View>
  );
}