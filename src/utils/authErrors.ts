// Utility function to get translated Firebase auth error messages
export const getAuthErrorMessage = (errorCode: string, translations: any): string => {
  const errorMap: Record<string, string> = {
    'auth/email-already-in-use': translations.auth.emailAlreadyInUse,
    'auth/invalid-email': translations.auth.invalidEmail,
    'auth/weak-password': translations.auth.weakPassword,
    'auth/user-not-found': translations.auth.userNotFound,
    'auth/wrong-password': translations.auth.wrongPassword,
    'auth/too-many-requests': translations.auth.tooManyRequests,
    'auth/network-request-failed': translations.auth.networkError,
    'auth/popup-closed-by-user': translations.auth.popupClosed,
    'auth/account-exists-with-different-credential': translations.auth.accountExistsWithDifferentCredential,
    'auth/operation-not-allowed': translations.auth.operationNotAllowed,
    'auth/configuration-not-found': translations.auth.configurationNotFound,
  };

  return errorMap[errorCode] || translations.auth.unknownError;
};
