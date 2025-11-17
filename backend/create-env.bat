@echo off
REM Script to create .env file from .env.example
REM Run this script: create-env.bat

if exist .env (
    echo File .env already exists. Skipping...
) else (
    if exist .env.example (
        copy .env.example .env
        echo ✅ Created .env file successfully!
        echo ⚠️  Please update the values in .env file with your actual configuration.
    ) else (
        echo ❌ Error: .env.example file not found!
    )
)

