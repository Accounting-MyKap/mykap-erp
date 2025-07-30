#!/bin/bash
echo "Starting Vercel build..."
npm run build
echo "Build completed!"
ls -la dist/ 