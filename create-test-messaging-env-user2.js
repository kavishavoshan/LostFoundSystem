/**
 * This script sets up a test environment for the messaging system (USER 2)
 * It creates necessary localStorage entries to bypass authentication
 * 
 * IMPORTANT: This script must be run in the SECOND browser window/session
 * because localStorage is isolated between browser sessions.
 */

// Run this script in your browser console before testing messaging

// Set user ID for testing - This is for USER 2 (Steve Smith)
const userId = '2'; // This is specifically for User 2 (Steve Smith)
localStorage.setItem('userId', userId);

// Instructions for testing:
// 1. Open http://localhost:3000/messages in your incognito window
// 2. Open browser console (F12) and paste this entire script
// 3. Run the script by pressing Enter
// 4. The messaging interface should now be accessible without authentication
// 5. You can now test messaging between the two users (regular window = User 1, incognito = User 2)

console.log('Test environment for USER 2 set up successfully!');
console.log('User ID set to:', localStorage.getItem('userId'));
console.log('You can now use the messaging features without authentication');