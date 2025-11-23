import { useState, useEffect } from 'react';
import { View, Alert, Platform } from 'react-native';
import { Button, Card, cn, Text } from '../heroui-native';
import * as Location from 'expo-location';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/auth/auth-context';
import { AppText } from '../components/app-text';

// Define attendance types
type AttendanceType = 'CHECK_IN_AM' | 'CHECK_OUT_AM' | 'CHECK_IN_PM' | 'CHECK_OUT_PM';

export default function AttendanceScreen() {
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
        Alert.alert('Permission denied', 'Location permission is required to check in/out');
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
      Alert.alert('Location Error', 'Unable to get your current location');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Error', 'User not authenticated');
      return;
    }

    setAttendanceType(type);
    setLoading(true);

    try {
      // Get office locations first
      const officeResponse = await fetch('http://localhost:3000/api/office/location', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!officeResponse.ok) {
        throw new Error('Failed to fetch office locations');
      }

      const offices = await officeResponse.json();
      
      // For now, just use the first office if available
      if (offices && offices.length > 0) {
        setCurrentOffice(offices[0]);
      }

      // Submit attendance
      const response = await fetch('http://localhost:3000/api/attendance/check-in-out', {
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
          'Success', 
          `Successfully ${type.startsWith('CHECK_IN') ? 'checked in' : 'checked out'}!\nStatus: ${data.attendance.status}`,
          [
            {
              text: 'OK',
              onPress: () => setAttendanceType(null)
            }
          ]
        );
      } else {
        throw new Error(data.message || 'Attendance submission failed');
      }
    } catch (error: any) {
      console.error('Attendance error:', error);
      Alert.alert(
        'Error', 
        error.message || 'An error occurred while submitting attendance',
        [
          {
            text: 'OK',
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
    if (!location) return 'Getting location...';
    return `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
  };

  return (
    <View className={cn('flex-1 justify-start p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
      <Card className="w-full">
        <Card.Header>
          <Card.Title className="text-2xl text-center">Attendance Check-In/Out</Card.Title>
          <Card.Description className="text-center mt-2">
            Current Location: {formatLocation(location)}
          </Card.Description>
        </Card.Header>
        
        <Card.Body className="gap-4">
          <View className="items-center mb-4">
            <AppText className="text-lg font-semibold">
              {location ? formatTime(new Date()) : 'Getting time...'}
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
                {loading && attendanceType === 'CHECK_IN_AM' ? 'Checking In...' : 'Check In AM'}
              </AppText>
            </Button>
            
            <Button 
              className="flex-1"
              onPress={() => checkInOrOut('CHECK_OUT_AM')}
              disabled={loading || attendanceType !== null}
              variant="outline"
            >
              <AppText className="text-foreground text-base font-medium">
                {loading && attendanceType === 'CHECK_OUT_AM' ? 'Checking Out...' : 'Check Out AM'}
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
                {loading && attendanceType === 'CHECK_IN_PM' ? 'Checking In...' : 'Check In PM'}
              </AppText>
            </Button>
            
            <Button 
              className="flex-1"
              onPress={() => checkInOrOut('CHECK_OUT_PM')}
              disabled={loading || attendanceType !== null}
              variant="outline"
            >
              <AppText className="text-foreground text-base font-medium">
                {loading && attendanceType === 'CHECK_OUT_PM' ? 'Checking Out...' : 'Check Out PM'}
              </AppText>
            </Button>
          </View>
          
          {currentOffice && (
            <View className="mt-4 p-3 bg-muted rounded-lg">
              <AppText className="text-muted-foreground font-medium">
                Nearest Office: {currentOffice.name}
              </AppText>
              <AppText className="text-muted-foreground">
                {currentOffice.latitude}, {currentOffice.longitude}
              </AppText>
            </View>
          )}
        </Card.Body>
        
        <Card.Footer>
          <AppText className="text-center text-muted-foreground text-sm">
            Note: You must be within 50 meters of an office location to check in/out
          </AppText>
        </Card.Footer>
      </Card>
    </View>
  );
}