#!/bin/bash
# Build script for Render

echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build

echo "Build complete!"
