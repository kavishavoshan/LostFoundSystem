# Messaging Functionality Test Guide

## Overview
This guide demonstrates how to test the messaging functionality between two users in the Lost & Found System. The system allows users to search for other users, start conversations, and exchange messages in real-time using WebSockets.

## Prerequisites
- Both backend and frontend servers are running
- Two user accounts are already created:
  - User 1: john.cena@example.com / Password123@
  - User 2: steve.smith@example.com / Password456@

## Testing Steps
      
### Step 1: Login with First User
1. Open a browser window and navigate to http://localhost:3000/login
2. Enter the credentials for User 1:
   - Email: john.cena@example.com
   - Password: Password123@
3. Click "Login"
4. After successful login, navigate to the Messages page by clicking on the Messages link in the navigation or going to http://localhost:3000/messages

### Step 2: Login with Second User in a Different Browser or Incognito Window
1. Open a different browser or an incognito window
2. Navigate to http://localhost:3000/login
3. Enter the credentials for User 2:
   - Email: steve.smith@example.com
   - Password: Password456@
4. Click "Login"
5. After successful login, navigate to the Messages page by clicking on the Messages link in the navigation or going to http://localhost:3000/messages

### Step 3: Start a Conversation (from User 1's perspective)
1. In User 1's browser, click the "New Message" button in the top right corner
2. In the search box, type "Jane" to find User 2
3. Click on User 2 (Jane Smith) in the search results to start a conversation
4. The conversation view should open with an empty chat

### Step 4: Send Messages
1. In User 1's browser, type a message in the input field at the bottom of the conversation view
2. Click the send button or press Enter
3. The message should appear in the conversation view

### Step 5: Verify Real-time Message Delivery
1. Check User 2's browser - the message from User 1 should appear in real-time
2. From User 2's browser, send a reply message
3. Verify that the reply appears in User 1's conversation view in real-time

### Step 6: Test Additional Features
1. **Message Status**: Verify that messages show read/unread status correctly
2. **Conversation List**: Verify that the conversation appears in the conversation list for both users
3. **User Search**: Test searching for other users and starting new conversations

## Troubleshooting

If messages are not being delivered in real-time:

1. Check that both backend and frontend servers are running
2. Verify that WebSocket connections are established (check browser console for errors)
3. Ensure both users are properly authenticated (check localStorage for token)
4. Check browser console for any errors related to socket connections

## Technical Implementation Details

- Authentication is handled through JWT tokens stored in localStorage
- Real-time messaging is implemented using Socket.IO
- The socket connection is initialized when a user logs in and navigates to the Messages page
- Messages are sent through both HTTP requests (for persistence) and WebSocket events (for real-time delivery)
- The backend validates user authentication for both HTTP requests and WebSocket connections