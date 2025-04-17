# Lost & Found System - Getting Started Guide

This guide will help you understand the project structure and get the system up and running.

## Project Overview

This is a full-stack Lost & Found System with:

- **Frontend**: React application with Tailwind CSS for styling
- **Backend**: NestJS application with TypeORM for database operations
- **Database**: MySQL database

## System Features

- User authentication and registration
- Reporting lost items
- Registering found items
- Messaging between users
- Analytics dashboard
- Admin management interface

## Prerequisites

Before starting, ensure you have the following installed:

- Node.js (v16 or higher)
- npm (v7 or higher)
- MySQL (v8 or higher)

## Project Structure

```
LostFoundSystem/
├── backend/             # NestJS server application
│   ├── src/
│   │   ├── modules/     # Feature modules (auth, lost-items, found-items, etc.)
│   │   ├── app.module.ts # Main application module
│   │   └── main.ts      # Application entry point
│   └── package.json     # Backend dependencies
├── frontend/            # React client application
│   ├── src/
│   │   ├── api/         # API integration services
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   └── App.js       # Main component with routing
│   └── package.json     # Frontend dependencies
└── README.md            # Project documentation
```

## Setup Instructions

### 1. Database Setup

1. Create a MySQL database named `lost_found_db`
2. Configure the database connection in the backend `.env` file

### 2. Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Ensure the `.env` file exists with the following variables:
     ```
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=root
     DB_NAME=lost_found_db
     JWT_SECRET=your-super-secret-key-change-this-in-production
     PORT=3001
     ```
   - Adjust these values according to your MySQL configuration

4. Start the backend server:
   ```
   npm run start:dev
   ```
   - The server will run on http://localhost:3001

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm start
   ```
   - The application will run on http://localhost:3000

## Key Components

### Backend

- **Modules**: The backend is organized into feature modules:
  - `auth`: User authentication and authorization
  - `user`: User management
  - `lost-items`: Lost item reporting and management
  - `found-items`: Found item reporting and management
  - `messages`: User-to-user messaging
  - `analytics`: System statistics and reporting

- **Entities**: Database models defined with TypeORM:
  - `User`: User account information
  - `LostItem`: Lost item details
  - `FoundItem`: Found item details
  - `Message`: Communication between users

### Frontend

- **Pages**: Main application views:
  - Home page
  - Item dashboard
  - User authentication (login/register)
  - Messaging interface
  - Analytics dashboard

- **Components**: Reusable UI elements:
  - Form inputs
  - Cards
  - Buttons
  - Headers/Footers

- **API Services**: Functions to communicate with the backend

## Development Workflow

1. **Backend Development**:
   - Create/modify entities in `backend/src/modules/*/entity.ts`
   - Implement business logic in service files `backend/src/modules/*/service.ts`
   - Define API endpoints in controller files `backend/src/modules/*/controller.ts`

2. **Frontend Development**:
   - Create/modify React components in `frontend/src/components/`
   - Build pages in `frontend/src/pages/`
   - Add API integration in `frontend/src/api/`

## Next Steps

1. Explore the existing codebase to understand the current implementation
2. Run both the frontend and backend servers
3. Test the application by creating accounts and adding lost/found items
4. Extend functionality as needed

## Troubleshooting

- **Database Connection Issues**: Verify MySQL is running and credentials in `.env` are correct
- **Module Not Found Errors**: Ensure all dependencies are installed with `npm install`
- **CORS Errors**: The backend is configured to accept requests from `http://localhost:3000`

Happy coding!