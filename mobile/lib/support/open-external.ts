import { Alert, Linking } from 'react-native';

function normalizePhoneDigits(value: string) {
  return value.replace(/\D/g, '');
}

export async function openExternalUrl(
  url: string,
  errorMessage = 'Unable to open this link right now.'
) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    }
  } catch {
    // Fall through to alert below.
  }

  Alert.alert('Link unavailable', errorMessage);
  return false;
}

export async function openWhatsAppConversation({
  phone,
  text,
  errorMessage = 'WhatsApp is not available on this device right now. Please call Al Hilal instead.',
}: {
  phone: string;
  text?: string;
  errorMessage?: string;
}) {
  const digits = normalizePhoneDigits(phone);
  const encodedText = text ? encodeURIComponent(text) : '';
  const appUrl = `whatsapp://send?phone=${digits}${encodedText ? `&text=${encodedText}` : ''}`;
  const webUrl = `https://api.whatsapp.com/send?phone=${digits}${encodedText ? `&text=${encodedText}` : ''}`;

  try {
    const appSupported = await Linking.canOpenURL(appUrl);
    if (appSupported) {
      await Linking.openURL(appUrl);
      return true;
    }
  } catch {
    // Fall back to the web endpoint below.
  }

  return openExternalUrl(webUrl, errorMessage);
}
