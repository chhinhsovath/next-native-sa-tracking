import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button, Card, Input, DatePicker, cn, Select } from '../heroui-native';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/auth/auth-context';
import { AppText } from '../components/app-text';

export default function WorkPlanScreen() {
  const { isDark } = useAppTheme();
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<'DRAFT' | 'SUBMITTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'>('DRAFT');
  const [progress, setProgress] = useState('0');
  const [achievement, setAchievement] = useState('');
  const [output, setOutput] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const submitWorkPlan = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for your work plan');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description for your work plan');
      return;
    }

    if (!dueDate) {
      Alert.alert('Validation Error', 'Please select a due date for your work plan');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/workplan/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          dueDate: dueDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success', 
          'Work plan created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setTitle('');
                setDescription('');
                setDueDate(null);
                setStatus('DRAFT');
                setProgress('0');
                setAchievement('');
                setOutput('');
                setComments('');
              }
            }
          ]
        );
      } else {
        throw new Error(data.message || 'Work plan creation failed');
      }
    } catch (error: any) {
      console.error('Work plan error:', error);
      Alert.alert('Error', error.message || 'An error occurred while creating your work plan');
    } finally {
      setLoading(false);
    }
  };

  const updateWorkPlan = async () => {
    // This would be used to update an existing work plan
    Alert.alert('Info', 'Update functionality will be implemented in a future version');
  };

  return (
    <View className={cn('flex-1 justify-start p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
      <Card className="w-full">
        <Card.Header>
          <Card.Title className="text-2xl text-center">Work Plan</Card.Title>
          <Card.Description className="text-center mt-2">
            Create and manage your work plans
          </Card.Description>
        </Card.Header>
        
        <Card.Body className="gap-4">
          <Input
            label="Title"
            placeholder="Enter work plan title"
            value={title}
            onChangeText={setTitle}
          />
          
          <Input
            label="Description"
            placeholder="Enter work plan details"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          
          <View className="flex-row gap-2">
            <View className="flex-1">
              <AppText className="text-foreground mb-1">Due Date</AppText>
              <DatePicker
                date={dueDate}
                onDateChange={setDueDate}
                minimumDate={new Date()}
                placeholder="Select due date"
              />
            </View>
            
            <View className="flex-1">
              <AppText className="text-foreground mb-1">Status</AppText>
              <Select
                value={status}
                onValueChange={(value: any) => setStatus(value)}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select status" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="DRAFT">Draft</Select.Item>
                  <Select.Item value="SUBMITTED">Submitted</Select.Item>
                  <Select.Item value="IN_PROGRESS">In Progress</Select.Item>
                  <Select.Item value="COMPLETED">Completed</Select.Item>
                  <Select.Item value="REJECTED">Rejected</Select.Item>
                </Select.Content>
              </Select>
            </View>
          </View>
          
          <Input
            label="Progress (%)"
            placeholder="Enter progress percentage"
            value={progress}
            onChangeText={setProgress}
            keyboardType="numeric"
          />
          
          <Input
            label="Achievement"
            placeholder="Enter achievements (optional)"
            value={achievement}
            onChangeText={setAchievement}
          />
          
          <Input
            label="Output"
            placeholder="Enter outputs (optional)"
            value={output}
            onChangeText={setOutput}
          />
          
          <Input
            label="Comments"
            placeholder="Enter comments (optional)"
            value={comments}
            onChangeText={setComments}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Card.Body>
        
        <Card.Footer className="gap-3">
          <Button onPress={submitWorkPlan} loading={loading}>
            <AppText className="text-foreground text-base font-medium">
              {loading ? 'Saving...' : 'Create Work Plan'}
            </AppText>
          </Button>
          
          {status !== 'DRAFT' && (
            <Button onPress={updateWorkPlan} variant="outline">
              <AppText className="text-foreground text-base font-medium">
                Update Work Plan
              </AppText>
            </Button>
          )}
        </Card.Footer>
      </Card>
    </View>
  );
}