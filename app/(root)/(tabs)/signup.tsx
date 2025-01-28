import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import 'tailwindcss/tailwind.css';

WebBrowser.maybeCompleteAuthSession();

const FancyAlert = ({
  visible,
  title,
  message,
  onClose,
  onAction,
}: {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onAction?: () => void;
}) => {
  useEffect(() => {
    // Navigate to dashboard if title or message indicates success
    if (visible && title === 'Success') {
      router.push('/dashboard');
    }
  }, [visible, title]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white p-6 rounded-lg shadow-lg w-11/12">
          <Text className="text-lg font-bold mb-4 text-center">{title}</Text>
          <Text className="text-gray-700 mb-6 text-center">{message}</Text>
          <TouchableOpacity
            onPress={() => {
              onClose();
              if (onAction) onAction(); // Trigger action if provided
            }}
            className="bg-black p-3 rounded-lg"
          >
            <Text className="text-white text-center font-bold">OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertContent, setAlertContent] = useState({ title: '', message: '' });

  const showAlert = (title: string, message: string, onAction?: () => void) => {
    setAlertContent({ title, message });
    setAlertVisible(true);
  };

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '55925846579-pioue5las7ha8hcdpugampkvele4jnqo.apps.googleusercontent.com',
    androidClientId: '55925846579-pioue5las7ha8hcdpugampkvele4jnqo.apps.googleusercontent.com',
    redirectUri: 'https://wupahhhetxyijbknikff.supabase.co/auth/v1/callback',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;

      const handleGoogleAuth = async () => {
        try {
          setLoading(true);
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: id_token,
          });

          if (error) {
            showAlert('Google Signup Error', error.message || 'An error occurred.');
          } else {
            showAlert('Success', 'Google signup successful!');
            router.push('/dashboard');
          }
        } catch (err) {
          console.log('Google Auth Error:', err);
          showAlert('Error', 'Unexpected error during Google authentication.');
        } finally {
          setLoading(false);
        }
      };

      handleGoogleAuth();
    }
  }, [response]);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      showAlert('Validation Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Validation Error', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        showAlert('Signup Error', error.message || 'An error occurred during signup.');
        return;
      }

      if (data.user) {
        const { id: authId, email: userEmail } = data.user;

        // Check for existing users
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('email', userEmail);

        if (fetchError) {
          showAlert('Error', 'Failed to check existing users.');
          return;
        }

        if (existingUser?.length) {
          showAlert('Error', 'This email is already registered.');
          return;
        }

        const { error: dbError } = await supabase.from('users').insert([{ id: authId, email: userEmail }]);

        if (dbError) {
          showAlert('Database Error', dbError.message || 'Failed to save user data.');
          return;
        }

        showAlert('Success', 'Check your email for the confirmation link.');
      }
    } catch (err) {
      console.log('Unexpected Error:', err);
      showAlert('Unexpected Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <FancyAlert
        visible={alertVisible}
        title={alertContent.title}
        message={alertContent.message}
        onClose={() => setAlertVisible(false)}
        onAction={() => setAlertVisible(false)}
      />
      <View className="flex-1 justify-between px-6 py-12">
        <View>
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Text className="text-gray-800 text-xl">&#8592;</Text>
          </TouchableOpacity>
          <View className="items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800 text-center">
              Hello! Register to get started
            </Text>
          </View>
          <View className="space-y-4">
            <TextInput
              className="w-full bg-gray-100 p-4 rounded-lg border border-gray-300"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              className="w-full bg-gray-100 p-4 rounded-lg border border-gray-300"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              className="w-full bg-gray-100 p-4 rounded-lg border border-gray-300"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <TouchableOpacity
              className={`w-full p-4 rounded-lg ${loading ? 'bg-gray-300' : 'bg-black'}`}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-center text-white font-bold">Register</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View className="items-center">
          <Text className="text-gray-600">
            Already have an account?{' '}
            <Text
              className="text-blue-600 font-bold"
              onPress={() => router.push('/Login')}
            >
              Login
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Signup;
