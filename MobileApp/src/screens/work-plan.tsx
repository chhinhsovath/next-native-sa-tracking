import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button, Card, Input, DatePicker, cn, Select } from '../heroui-native';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/auth/auth-context';
import { useI18n } from '../contexts/i18n-context';
import { API_BASE_URL } from '../config';
import { AppText } from '../components/app-text';

export default function WorkPlanScreen() {
  const { t } = useI18n();
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
      Alert.alert(t('validationError'), t('enterWorkPlanTitle'));
      return;
    }

    if (!description.trim()) {
      Alert.alert(t('validationError'), t('enterWorkPlanDescription'));
      return;
    }

    if (!dueDate) {
      Alert.alert(t('validationError'), t('selectDueDate'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/workplan/manage`, {
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
          t('success'), 
          t('workPlanCreatedSuccess'),
          [
            {
              text: t('ok'),
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
        throw new Error(data.message || t('workPlanCreationFailed'));
      }
    } catch (error: any) {
      console.error('Work plan error:', error);
      Alert.alert(t('error'), error.message || t('errorCreatingWorkPlan'));
    } finally {
      setLoading(false);
    }
  };

  const updateWorkPlan = async () => {
    // This would be used to update an existing work plan
    Alert.alert(t('info'), t('updateWorkPlanInfo'));
  };

  return (
    <View className={cn('flex-1 justify-start p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
      <Card className="w-full">
        <Card.Header>
          <Card.Title className="text-2xl text-center">{t('workPlan')}</Card.Title>
          <Card.Description className="text-center mt-2">
            {t('createAndManageWorkPlans')}
          </Card.Description>
        </Card.Header>
        
        <Card.Body className="gap-4">
          <Input
            label={t('workPlanTitle')}
            placeholder={t('enterWorkPlanTitle')}
            value={title}
            onChangeText={setTitle}
          />
          
          <Input
            label={t('workPlanDescription')}
            placeholder={t('enterWorkPlanDetails')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          
          <View className="flex-row gap-2">
            <View className="flex-1">
              <AppText className="text-foreground mb-1">{t('dueDate')}</AppText>
              <DatePicker
                date={dueDate}
                onDateChange={setDueDate}
                minimumDate={new Date()}
                placeholder={t('selectDueDate')}
              />
            </View>
            
            <View className="flex-1">
              <AppText className="text-foreground mb-1">{t('status')}</AppText>
              <Select
                value={status}
                onValueChange={(value: any) => setStatus(value)}
              >
                <Select.Trigger>
                  <Select.Value placeholder={t('selectStatus')} />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="DRAFT">{t('draft')}</Select.Item>
                  <Select.Item value="SUBMITTED">{t('submitted')}</Select.Item>
                  <Select.Item value="IN_PROGRESS">{t('inProgress')}</Select.Item>
                  <Select.Item value="COMPLETED">{t('completed')}</Select.Item>
                  <Select.Item value="REJECTED">{t('rejected')}</Select.Item>
                </Select.Content>
              </Select>
            </View>
          </View>
          
          <Input
            label={`${t('progress')} (%)`}
            placeholder={t('enterProgress')}
            value={progress}
            onChangeText={setProgress}
            keyboardType="numeric"
          />
          
          <Input
            label={t('achievement')}
            placeholder={t('enterAchievement')}
            value={achievement}
            onChangeText={setAchievement}
          />
          
          <Input
            label={t('output')}
            placeholder={t('enterOutput')}
            value={output}
            onChangeText={setOutput}
          />
          
          <Input
            label={t('comments')}
            placeholder={t('enterComments')}
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
              {loading ? t('saving') : t('createWorkPlan')}
            </AppText>
          </Button>
          
          {status !== 'DRAFT' && (
            <Button onPress={updateWorkPlan} variant="outline">
              <AppText className="text-foreground text-base font-medium">
                {t('updateWorkPlan')}
              </AppText>
            </Button>
          )}
        </Card.Footer>
      </Card>
    </View>
  );
}