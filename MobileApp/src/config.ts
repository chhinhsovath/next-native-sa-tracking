import { Platform } from 'react-native';

// API Base URL Configuration
const getAPIBaseURL = () => {
    if (__DEV__) {
        // Development mode
        if (Platform.OS === 'web') {
            return 'http://localhost:3000';
        } else {
            // For mobile devices, use your computer's local IP
            // Update this to your computer' IP address
            return 'http://192.168.1.184:3000'; // Network address shown when backend starts
        }
    } else {
        // Production mode - update with your production API URL
        return 'https://your-production-api.com';
    }
};

export const API_BASE_URL = getAPIBaseURL();

export const config = {
    apiBaseURL: API_BASE_URL,
};
