import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button, Card, Input, DatePicker, cn } from '../heroui-native';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/auth/auth-context';
import { AppText } from '../components/app-text';

export default function MissionRequestScreen() {
  const { isDark } = useAppTheme();
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const submitMissionRequest = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for your mission');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description for your mission');
      return;
    }

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
      const response = await fetch('http://localhost:3000/api/mission/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success', 
          'Mission request submitted successfully. Awaiting approval.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setTitle('');
                setDescription('');
                setStartDate(null);
                setEndDate(null);
              }
            }
          ]
        );
      } else {
        throw new Error(data.message || 'Mission request submission failed');
      }
    } catch (error: any) {
      console.error('Mission request error:', error);
      Alert.alert('Error', error.message || 'An error occurred while submitting your mission request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={cn('flex-1 justify-start p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
      <Card className="w-full">
        <Card.Header>
          <Card.Title className="text-2xl text-center">Mission Request</Card.Title>
          <Card.Description className="text-center mt-2">
            Submit a request for a mission or assignment
          </Card.Description>
        </Card.Header>
        
        <Card.Body className="gap-4">
          <Input
            label="Title"
            placeholder="Enter mission title"
            value={title}
            onChangeText={setTitle}
          />
          
          <Input
            label="Description"
            placeholder="Enter mission details"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          
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
        </Card.Body>
        
        <Card.Footer className="gap-3">
          <Button onPress={submitMissionRequest} loading={loading}>
            <AppText className="text-foreground text-base font-medium">
              {loading ? 'Submitting...' : 'Submit Request'}
            </AppText>
          </Button>
        </Card.Footer>
      </Card>
    </View>
  );
}