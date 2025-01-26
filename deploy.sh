#!/bin/bash

# Build the Next.js app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
