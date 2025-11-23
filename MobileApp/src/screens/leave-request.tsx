import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button, Card, Input, DatePicker, cn } from '../heroui-native';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/auth/auth-context';
import { AppText } from '../components/app-text';

export default function LeaveRequestScreen() {
  const { isDark } = useAppTheme();
  const { token } = useAuth();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const submitLeaveRequest = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Validation Error', 'Please select both start and end dates');
      return;
    }

    if (startDate > endDate) {
      Alert.alert('Validation Error', 'End date must be after start date');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Validation Error', 'Please enter a reason for your leave');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/leave/request', {
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
          'Success', 
          'Leave request submitted successfully. Awaiting approval.',
          [
            {
              text: 'OK',
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
        throw new Error(data.message || 'Leave request submission failed');
      }
    } catch (error: any) {
      console.error('Leave request error:', error);
      Alert.alert('Error', error.message || 'An error occurred while submitting your leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={cn('flex-1 justify-start p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
      <Card className="w-full">
        <Card.Header>
          <Card.Title className="text-2xl text-center">Leave Request</Card.Title>
          <Card.Description className="text-center mt-2">
            Submit a request for time off
          </Card.Description>
        </Card.Header>
        
        <Card.Body className="gap-4">
          <Input
            label="Reason for Leave"
            placeholder="Enter reason for your leave"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          
          <View className="flex-row gap-2">
            <View className="flex-1">
              <AppText className="text-foreground mb-1">Start Date</AppText>
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                maximumDate={endDate || undefined} // Cannot select start date after end date
                placeholder="Select start date"
              />
            </View>
            
            <View className="flex-1">
              <AppText className="text-foreground mb-1">End Date</AppText>
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                minimumDate={startDate || undefined} // Cannot select end date before start date
                placeholder="Select end date"
              />
            </View>
          </View>
        </Card.Body>
        
        <Card.Footer className="gap-3">
          <Button onPress={submitLeaveRequest} loading={loading}>
            <AppText className="text-foreground text-base font-medium">
              {loading ? 'Submitting...' : 'Submit Request'}
            </AppText>
          </Button>
        </Card.Footer>
      </Card>
    </View>
  );
}