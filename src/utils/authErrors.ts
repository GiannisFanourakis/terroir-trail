/**
 * Human-readable message formatter for Firebase and native authentication errors
 */
export const formatAuthError = (error: any): string => {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = error.code || '';
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
      return 'Unauthorized domain. Please add this domain to authorized domains in Firebase Console.';
    case 'auth/configuration-not-found':
      return 'Authentication is not yet enabled in Firebase Console. Go to Build ➔ Authentication to enable Email/Password and Google.';
    case 'auth/operation-not-allowed':
      return 'Apple Sign-In is not enabled yet in your Firebase Console. Please enable Apple in Firebase Console ➔ Authentication ➔ Sign-in method (requires Apple Developer credentials), or sign in with Google or Email.';
    case 'auth/too-many-requests':
      return 'Access has been temporarily disabled due to many failed attempts. Please reset your password or try again later.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    default:
      if (error.message?.includes('cancel') || error.code === '16' || error.message?.includes('16:')) {
        return 'Sign-in was cancelled.';
      }
      return error.message || 'Authentication failed. Please try again.';
  }
};
