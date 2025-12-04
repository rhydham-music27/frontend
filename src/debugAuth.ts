// Debug utility to check authentication state
// Run this in browser console after redirect happens

export const checkAuthDebug = () => {
  const debugInfo = sessionStorage.getItem('authDebug');
  if (debugInfo) {
    console.log('=== AUTH DEBUG INFO ===');
    console.log(JSON.parse(debugInfo));
    console.log('=== LOCAL STORAGE ===');
    console.log('Token:', localStorage.getItem('token'));
    console.log('User:', localStorage.getItem('user'));
    console.log('=== SESSION STORAGE ===');
    console.log('Debug Info:', debugInfo);
  } else {
    console.log('No debug info found in sessionStorage');
  }
};

// Auto-run check if we're on login page
if (window.location.pathname.includes('login')) {
  setTimeout(() => {
    checkAuthDebug();
  }, 1000);
}
