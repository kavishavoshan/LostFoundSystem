#!/bin/bash

# Kill any process using port 3000
echo "Killing any process using port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process found on port 3000"

# Start the frontend server
echo "Starting the frontend server..."
cd frontend && npm start 