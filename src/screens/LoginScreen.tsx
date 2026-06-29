import { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Globe } from 'lucide-react-native';
import { colors, spacing, fonts, fontSize, screenPadding } from '@/constants/theme';
import { Text, DisplayText } from '@/components/ui';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/stores/authStore';
import {
  getIdTokenFromGoogleResponse,
  isGoogleSignInConfigured,
  useGoogleIdTokenAuthRequest,
} from '@/services/googleAuth';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const [googleRequest, googleResponse, promptGoogleSignIn] = useGoogleIdTokenAuthRequest();

  const completeLogin = useCallback(async (accessToken: string, refreshToken: string) => {
    const user = await authService.getMe(accessToken);
    await setAuth(user, accessToken, refreshToken);
  }, [setAuth]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      const { accessToken, refreshToken } = await authService.login(email.trim(), password);
      await completeLogin(accessToken, refreshToken);
    } catch (error: any) {
      console.error('Login error:', error);
      const message =
        error.response?.data?.status?.message ||
        error.response?.data?.message ||
        'Login failed. Please check your credentials.';
      Alert.alert('Login Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isGoogleSignInConfigured) {
      Alert.alert(
        'Google Sign-In Not Configured',
        'Set EXPO_PUBLIC_GOOGLE_CLIENT_ID in the mobile environment first.'
      );
      return;
    }

    setIsGoogleLoading(true);
    try {
      const result = await promptGoogleSignIn();

      if (result.type === 'cancel' || result.type === 'dismiss') {
        return;
      }

      if (result.type !== 'success') {
        Alert.alert('Google Sign-In Failed', 'Google did not complete the sign-in flow.');
        return;
      }

      if (!getIdTokenFromGoogleResponse(result)) {
        Alert.alert('Google Sign-In Failed', 'Google did not return an ID token.');
      }
    } catch (error) {
      console.error('Google sign-in prompt error:', error);
      Alert.alert('Google Sign-In Failed', 'Unable to open Google sign-in.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    const idToken = getIdTokenFromGoogleResponse(googleResponse);
    if (!idToken) return;

    let cancelled = false;
    const googleIdToken = idToken;

    async function signInWithGoogleToken() {
      setIsGoogleLoading(true);
      try {
        const { accessToken, refreshToken } = await authService.loginWithGoogle(googleIdToken);
        if (!cancelled) {
          await completeLogin(accessToken, refreshToken);
        }
      } catch (error: any) {
        console.error('Google login error:', error);
        const message =
          error.response?.data?.status?.message ||
          error.response?.data?.message ||
          'Google sign-in failed. Please try again.';
        if (!cancelled) {
          Alert.alert('Google Sign-In Failed', message);
        }
      } finally {
        if (!cancelled) {
          setIsGoogleLoading(false);
        }
      }
    }

    void signInWithGoogleToken();

    return () => {
      cancelled = true;
    };
  }, [completeLogin, googleResponse]);

  const authBusy = isLoading || isGoogleLoading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <DisplayText style={styles.logo}>NULAP</DisplayText>
          <Text variant="mono" size="sm" color="secondary">
            Learning Platform
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text variant="mono" size="xs" color="secondary" uppercase style={styles.label}>
              Email
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!authBusy}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text variant="mono" size="xs" color="secondary" uppercase style={styles.label}>
              Password
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!authBusy}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={authBusy}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text variant="mono" size="base" style={styles.loginButtonText}>
                Login
              </Text>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text variant="mono" size="xs" color="secondary" uppercase>
              Or
            </Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={[
              styles.googleButton,
              (!googleRequest || authBusy || !isGoogleSignInConfigured) && styles.loginButtonDisabled,
            ]}
            onPress={handleGoogleLogin}
            disabled={!googleRequest || authBusy || !isGoogleSignInConfigured}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <>
                <Globe size={20} color={colors.textPrimary} />
                <Text variant="mono" size="base" style={styles.googleButtonText}>
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text variant="mono" size="xs" color="secondary">
            Don't have an account?
          </Text>
          <Pressable>
            <Text variant="mono" size="xs" style={styles.registerLink}>
              Register
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: screenPadding,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[12],
  },
  logo: {
    color: colors.accentPrimary,
    marginBottom: spacing[2],
  },
  form: {
    gap: spacing[5],
  },
  inputGroup: {
    gap: spacing[2],
  },
  label: {
    marginLeft: spacing[1],
  },
  input: {
    height: 52,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing[4],
    fontFamily: fonts.mono,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    height: 52,
    backgroundColor: colors.accentPrimary,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[4],
    shadowColor: colors.borderStrong,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  googleButton: {
    height: 52,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing[3],
    shadowColor: colors.borderStrong,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  googleButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[8],
  },
  registerLink: {
    color: colors.accentPrimary,
  },
});
