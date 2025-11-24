import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button, Card, Input, DatePicker, cn } from '../heroui-native';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/auth/auth-context';
import { useI18n } from '../contexts/i18n-context';
import { AppText } from '../components/app-text';
import { API_BASE_URL } from '../config';

export default function MissionRequestScreen() {
  const { t } = useI18n();
  const { isDark } = useAppTheme();
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const submitMissionRequest = async () => {
    if (!title.trim()) {
      Alert.alert(t('validationError'), t('enterMissionTitle'));
      return;
    }

    if (!description.trim()) {
      Alert.alert(t('validationError'), t('enterMissionDescription'));
      return;
    }

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
      const response = await fetch(`${API_BASE_URL}/api/mission/request`, {
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
          t('success'), 
          t('missionSubmitSuccess'),
          [
            {
              text: t('ok'),
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
        throw new Error(data.message || t('missionRequestSubmissionFailed'));
      }
    } catch (error: any) {
      console.error('Mission request error:', error);
      Alert.alert(t('error'), error.message || t('errorSubmittingMissionRequest'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={cn('flex-1 justify-start p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
      <Card className="w-full">
        <Card.Header>
          <Card.Title className="text-2xl text-center">{t('missionRequest')}</Card.Title>
          <Card.Description className="text-center mt-2">
            {t('submitRequestForMission')}
          </Card.Description>
        </Card.Header>
        
        <Card.Body className="gap-4">
          <Input
            label={t('missionTitle')}
            placeholder={t('enterMissionTitle')}
            value={title}
            onChangeText={setTitle}
          />
          
          <Input
            label={t('missionDescription')}
            placeholder={t('enterMissionDetails')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          
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
        </Card.Body>
        
        <Card.Footer className="gap-3">
          <Button onPress={submitMissionRequest} loading={loading}>
            <AppText className="text-foreground text-base font-medium">
              {loading ? t('submitting') : t('submitRequest')}
            </AppText>
          </Button>
        </Card.Footer>
      </Card>
    </View>
  );
}