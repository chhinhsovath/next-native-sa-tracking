import { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { Button, Card, Input, cn } from '../heroui-native';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/auth/auth-context';
import { AppText } from '../components/app-text';

export default function ProfileScreen() {
  const { isDark } = useAppTheme();
  const { user, token, logout } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [position, setPosition] = useState(user?.position || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [loading, setLoading] = useState(false);

  const updateProfile = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // In a real app, you would implement a profile update API
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={cn('flex-1 justify-start p-4', isDark ? 'bg-background' : 'bg-muted/30')}>
      <Card className="w-full">
        <Card.Header>
          <Card.Title className="text-2xl text-center">Profile</Card.Title>
          <Card.Description className="text-center mt-2">
            Manage your account information
          </Card.Description>
        </Card.Header>
        
        <Card.Body className="gap-4">
          <Input
            label="First Name"
            placeholder="Enter your first name"
            value={firstName}
            onChangeText={setFirstName}
          />
          
          <Input
            label="Last Name"
            placeholder="Enter your last name"
            value={lastName}
            onChangeText={setLastName}
          />
          
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Input
            label="Position"
            placeholder="Enter your position"
            value={position}
            onChangeText={setPosition}
          />
          
          <Input
            label="Department"
            placeholder="Enter your department"
            value={department}
            onChangeText={setDepartment}
          />
        </Card.Body>
        
        <Card.Footer className="gap-3">
          <Button onPress={updateProfile} loading={loading}>
            <AppText className="text-foreground text-base font-medium">
              {loading ? 'Saving...' : 'Update Profile'}
            </AppText>
          </Button>
          
          <Button 
            variant="destructive" 
            onPress={async () => {
              await logout();
            }}
          >
            <AppText className="text-background text-base font-medium">
              Logout
            </AppText>
          </Button>
        </Card.Footer>
      </Card>
    </View>
  );
}