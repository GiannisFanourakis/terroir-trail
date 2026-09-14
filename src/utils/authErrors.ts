/**
 * Human-readable message formatter for Firebase and native authentication errors
 */
export const formatAuthError = (error: any): string => {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = typeof error === 'string' ? error : (error.code || '');
  const rawMessage = typeof error === 'string' ? error : (error.message || '');

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Incorrect email or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup was closed before completing.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/unauthorized-domain':
      return 'Sign-in is temporarily unavailable for this site. Please try another sign-in method.';
    case 'auth/configuration-not-found':
      return 'Sign-in is temporarily unavailable. Please try again later.';
    case 'auth/operation-not-allowed':
      return 'This sign-in option is currently unavailable. Please try another sign-in method.';
    case 'auth/too-many-requests':
      return 'Access has been temporarily disabled due to many failed attempts. Please reset your password or try again later.';
    case 'auth/network-request-failed':
      return 'Unable to connect to the sign-in service. Check your connection and try again.';
    case 'FIREBASE_NOT_CONFIGURED':
      return 'Sign-in is temporarily unavailable. Please try again later.';
  }

  if (rawMessage === 'FIREBASE_NOT_CONFIGURED' || rawMessage.includes('FIREBASE_NOT_CONFIGURED')) {
    return 'Sign-in is temporarily unavailable. Please try again later.';
  }
  if (rawMessage.includes('invalid-credential') || rawMessage.includes('wrong-password') || rawMessage.includes('user-not-found')) {
    return 'Incorrect email or password. Please verify your credentials.';
  }
  if (rawMessage.includes('email-already-in-use')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (rawMessage.includes('weak-password')) {
    return 'Password is too weak. Please choose at least 6 characters.';
  }
  if (rawMessage.includes('invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (rawMessage.includes('popup-closed-by-user')) {
    return 'The sign-in popup was closed before completing.';
  }
  if (rawMessage.includes('popup-blocked')) {
    return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
  }
  if (rawMessage.includes('unauthorized-domain') || rawMessage.includes('unauthorized domain')) {
    return 'Sign-in is temporarily unavailable for this site. Please try another sign-in method.';
  }
  if (rawMessage.includes('operation-not-allowed')) {
    return 'This sign-in option is currently unavailable. Please try another sign-in method.';
  }
  if (rawMessage.includes('too-many-requests')) {
    return 'Access has been temporarily disabled due to many failed attempts. Please reset your password or try again later.';
  }
  if (rawMessage.includes('network-request-failed') || rawMessage.includes('Network connection error')) {
    return 'Unable to connect to the sign-in service. Check your connection and try again.';
  }
  if (rawMessage.includes('cancel') || code === '16' || rawMessage.includes('16:')) {
    return 'Sign-in was cancelled.';
  }
  if (
    rawMessage.includes('Firebase Console') ||
    rawMessage.includes('.env') ||
    rawMessage.includes('authorized domain') ||
    rawMessage.includes('Apple Developer') ||
    rawMessage.includes('configuration-not-found')
  ) {
    return 'Sign-in is temporarily unavailable. Please try again later.';
  }

  return 'Authentication failed. Please try again.';
};
