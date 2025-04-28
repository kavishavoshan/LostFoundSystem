/**
 * This script sets up a test environment for the messaging system
 * It creates necessary localStorage entries to bypass authentication
 * 
 * IMPORTANT: This script must be run in EACH browser window/session separately
 * because localStorage is isolated between browser sessions.
 */

// Run this script in your browser console before testing messaging

// Set user IDs for testing - CHANGE THIS VALUE FOR DIFFERENT USERS
const userId = '1'; // Use '1' for John Cena (User 1) or '2' for Steve Smith (User 2)
localStorage.setItem('userId', userId);

// Instructions for testing:
// 1. Open http://localhost:3000/messages in your browser
// 2. Open browser console (F12) and paste this entire script
// 3. Run the script by pressing Enter
// 4. The messaging interface should now be accessible without authentication
// 5. For the second user, open an incognito window, navigate to the same URL
// 6. Open console and paste this SAME script but CHANGE userId to 2 before running
// 7. You can now test messaging between the two users

console.log('Test environment set up successfully!');
console.log('User ID set to:', localStorage.getItem('userId'));
console.log('You can now use the messaging features without authentication');