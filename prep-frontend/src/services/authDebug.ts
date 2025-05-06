// authDebug.ts
// Add this file to your project for debugging authentication issues

/**
 * Utility function to debug authentication state
 * Use this before attempting to access protected resources
 */
export const debugAuth = () => {
    console.log('=== AUTH DEBUG ===');
    
    // Check if localStorage is available
    const isLocalStorageAvailable = (() => {
      try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    })();
    
    console.log('localStorage available:', isLocalStorageAvailable);
    
    if (!isLocalStorageAvailable) {
      console.error('LocalStorage not available - this will prevent authentication from working');
      return false;
    }
    
    // Check auth items
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');
    
    console.log('Token exists:', !!token);
    console.log('Token length:', token ? token.length : 0);
    console.log('Token starts with:', token ? `${token.substring(0, 12)}...` : 'N/A');
    
    console.log('Refresh token exists:', !!refreshToken);
    console.log('User data exists:', !!userStr);
    
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        console.log('User ID:', userData.id || 'unknown');
        console.log('User email:', userData.email || 'unknown');
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
    
    return !!token;
  };