#!/bin/bash
# Bash script to kill process using port 8080
PORT=8080
PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
    echo "No process found on port $PORT"
else
    echo "Killing process $PID on port $PORT"
    kill -9 $PID
    echo "Port $PORT cleared"
fi

