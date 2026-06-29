import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { ResponseType } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || googleClientId;
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || googleClientId;
const googleAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || googleClientId;
const fallbackClientId = 'google-sign-in-not-configured';

export const isGoogleSignInConfigured = Boolean(
  Platform.select({
    ios: googleIosClientId,
    android: googleAndroidClientId,
    default: googleWebClientId,
  })
);

export function useGoogleIdTokenAuthRequest() {
  return Google.useAuthRequest(
    {
      clientId: googleClientId || fallbackClientId,
      webClientId: googleWebClientId || fallbackClientId,
      iosClientId: googleIosClientId || fallbackClientId,
      androidClientId: googleAndroidClientId || fallbackClientId,
      responseType: ResponseType.IdToken,
      scopes: ['openid', 'profile', 'email'],
      selectAccount: true,
      usePKCE: false,
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'nulap',
        path: 'oauthredirect',
      }),
    },
    {
      scheme: 'nulap',
      path: 'oauthredirect',
    }
  );
}

export function getIdTokenFromGoogleResponse(response: AuthSession.AuthSessionResult | null) {
  if (response?.type !== 'success') {
    return null;
  }

  return response.params.id_token || null;
}
