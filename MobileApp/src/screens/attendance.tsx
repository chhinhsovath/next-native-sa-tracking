import { useState, useEffect } from 'react';
import { View, Alert, Platform } from 'react-native';
import { Button, Card, cn, Text } from '../heroui-native';
import * as Location from 'expo-location';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/auth/auth-context';
import { useI18n } from '../contexts/i18n-context';
import { AppText } from '../components/app-text';
import { API_BASE_URL } from '../config';

// Define attendance types
type AttendanceType = 'CHECK_IN_AM' | 'CHECK_OUT_AM' | 'CHECK_IN_PM' | 'CHECK_OUT_PM';

export default function AttendanceScreen() {
  const { t } = useI18n();
  const { isDark } = useAppTheme();
  const { user, token } = useAuth();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [attendanceType, setAttendanceType] = useState<AttendanceType | null>(null);
  const [currentOffice, setCurrentOffice] = useState<any>(null);

  // Request location permission
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status !== 'granted') {
        Alert.alert(t('locationPermissionDenied'), t('locationPermissionRequired'));
        return;
      }

      // Get current location
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000, // 10 seconds
      });
      setLocation(location);
    })();
  }, []);

  const checkInOrOut = async (type: AttendanceType) => {
    if (!location) {
      Alert.alert(t('locationError'), t('unableGetLocation'));
      return;
    }

    if (!user) {
      Alert.alert(t('authenticationError'), t('userNotAuthenticated'));
      return;
    }

    setAttendanceType(type);
    setLoading(true);

    try {
      // Get office locations first
      const officeResponse = await fetch(`${API_BASE_URL}/api/office/location`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!officeResponse.ok) {
        throw new Error(t('failedToFetchOfficeLocations'));
      }

      const offices = await officeResponse.json();
      
      // For now, just use the first office if available
      if (offices && offices.length > 0) {
        setCurrentOffice(offices[0]);
      }

      // Submit attendance
      const response = await fetch(`${API_BASE_URL}/api/attendance/check-in-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          attendanceType: type,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          t('success'), 
          `${type.startsWith('CHECK_IN') ? t('checkInSuccess') : t('checkOutSuccess')}!\nStatus: ${data.attendance.status}`,
          [
            {
              text: t('ok'),
              onPress: () => setAttendanceType(null)
            }
          ]
        );
      } else {
        throw new Error(data.message || t('attendanceSubmissionFailed'));
      }
    } catch (error: any) {
      console.error('Attendance error:', error);
      Alert.alert(
        t('error'), 
        error.message || t('errorSubmittingAttendance'),
        [
          {
            text: t('ok'),
            onPress: () => {
              setAttendanceType(null);
              setAttendanceType(null);
            }
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLocation = (location: Location.LocationObject | null) => {
    if (!location) return t('gettingLocation');
    return `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
  };

  return (
    <View className={cn('flex-1 justify-start p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
      <Card className="w-full">
        <Card.Header>
          <Card.Title className="text-2xl text-center">{t('attendanceCheckInCheckOut')}</Card.Title>
          <Card.Description className="text-center mt-2">
            {t('currentLocation')}: {formatLocation(location)}
          </Card.Description>
        </Card.Header>
        
        <Card.Body className="gap-4">
          <View className="items-center mb-4">
            <AppText className="text-lg font-semibold">
              {location ? formatTime(new Date()) : t('getTime')}
            </AppText>
          </View>
          
          <View className="flex-row justify-between gap-2">
            <Button 
              className="flex-1"
              onPress={() => checkInOrOut('CHECK_IN_AM')}
              disabled={loading || attendanceType !== null}
              variant="default"
            >
              <AppText className="text-foreground text-base font-medium">
                {loading && attendanceType === 'CHECK_IN_AM' ? t('checkingIn') : t('checkInAM')}
              </AppText>
            </Button>
            
            <Button 
              className="flex-1"
              onPress={() => checkInOrOut('CHECK_OUT_AM')}
              disabled={loading || attendanceType !== null}
              variant="outline"
            >
              <AppText className="text-foreground text-base font-medium">
                {loading && attendanceType === 'CHECK_OUT_AM' ? t('checkingOut') : t('checkOutAM')}
              </AppText>
            </Button>
          </View>
          
          <View className="flex-row justify-between gap-2">
            <Button 
              className="flex-1"
              onPress={() => checkInOrOut('CHECK_IN_PM')}
              disabled={loading || attendanceType !== null}
              variant="default"
            >
              <AppText className="text-foreground text-base font-medium">
                {loading && attendanceType === 'CHECK_IN_PM' ? t('checkingIn') : t('checkInPM')}
              </AppText>
            </Button>
            
            <Button 
              className="flex-1"
              onPress={() => checkInOrOut('CHECK_OUT_PM')}
              disabled={loading || attendanceType !== null}
              variant="outline"
            >
              <AppText className="text-foreground text-base font-medium">
                {loading && attendanceType === 'CHECK_OUT_PM' ? t('checkingOut') : t('checkOutPM')}
              </AppText>
            </Button>
          </View>
          
          {currentOffice && (
            <View className="mt-4 p-3 bg-muted rounded-lg">
              <AppText className="text-muted-foreground font-medium">
                {t('nearestOffice')}: {currentOffice.name}
              </AppText>
              <AppText className="text-muted-foreground">
                {currentOffice.latitude}, {currentOffice.longitude}
              </AppText>
            </View>
          )}
        </Card.Body>
        
        <Card.Footer>
          <AppText className="text-center text-muted-foreground text-sm">
            {t('noteGeofence')}
          </AppText>
        </Card.Footer>
      </Card>
    </View>
  );
}