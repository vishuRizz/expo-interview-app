import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import 'tailwindcss/tailwind.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Configure Google Auth                 
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '196388884768-dvc4j8ff382lsg4738966vjg1op4mq8a.apps.googleusercontent.com',
    androidClientId: '196388884768-dvc4j8ff382lsg4738966vjg1op4mq8a.apps.googleusercontent.com',
    iosClientId: '196388884768-dvc4j8ff382lsg4738966vjg1op4mq8a.apps.googleusercontent.com'
  });


  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.log('Signup Error:', error);
        Alert.alert('Signup Error', error.message || 'An error occurred during signup.');
      } else if (data.user) {
        Alert.alert('Success', 'Check your email for the confirmation link.', [
          { text: 'OK', onPress: () => router.push('/Home') },
        ]);
      }
    } catch (error) {
      Alert.alert('Unexpected Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      const result = await promptAsync();
      if (result.type === 'success') {
        const { id_token } = result.params;
  
        // Sign in with Supabase using the id_token
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: id_token,
        });
  
        if (error) {
          console.log('Google Signup Error:', error);
          Alert.alert('Google Signup Error', error.message || 'An error occurred during Google signup.');
        } else {
          Alert.alert('Success', 'Google signup successful!');
          router.push('/Home');
        }
      }
    } catch (error) {
      console.log('Unexpected Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
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
              placeholder="Username"
              autoCapitalize="none"
            />
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

          <View className="flex-row items-center mt-8">
            <View className="flex-1 h-px bg-gray-300"></View>
            <Text className="px-4 text-gray-600">Or Register with</Text>
            <View className="flex-1 h-px bg-gray-300"></View>
          </View>

          <View className="flex-row justify-around mt-4">
            <TouchableOpacity
              className="p-4 rounded-full bg-gray-100"
              onPress={handleGoogleSignup}
              disabled={!request}
            >
              <FontAwesome name="google" size={20} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity className="p-4 rounded-full bg-gray-100">
              <FontAwesome name="facebook" size={20} color="#4267B2" />
            </TouchableOpacity>
            <TouchableOpacity className="p-4 rounded-full bg-gray-100">
              <FontAwesome name="apple" size={20} color="#000" />
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
