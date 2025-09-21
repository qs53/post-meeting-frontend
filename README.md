# Post MeetingSocial Media Generator - Frontend

A React frontend for the Post MeetingSocial Media Generator application.

## Features

- Google OAuth authentication
- Calendar view with meeting management
- Meeting detail pages with transcript editing
- AI-powered social media content generation
- Social media posting interface
- Responsive Material-UI design

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://ec2-34-221-10-72.us-west-2.compute.amazonaws.com
```

### 3. Run the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.js       # Main layout component
├── contexts/           # React contexts
│   └── AuthContext.js  # Authentication context
├── pages/              # Page components
│   ├── LoginPage.js    # Login page
│   ├── Dashboard.js    # Dashboard page
│   ├── CalendarPage.js # Calendar page
│   └── MeetingDetailPage.js # Meeting detail page
├── services/           # API services
│   └── api.js         # API client
├── App.js             # Main app component
├── App.css            # Global styles
└── index.js           # App entry point
```

## Features Overview

### Dashboard
- Overview of meetings and statistics
- Quick access to upcoming and recent meetings
- Social media account status

### Calendar
- List view of all meetings
- Toggle notetaker attendance
- Filter by date and status

### Meeting Details
- Edit meeting transcripts
- Generate social media content
- Post to connected social media accounts
- Toggle notetaker settings

## Authentication

The app uses JWT tokens stored in localStorage for authentication. Users authenticate through Google OAuth.

## Styling

The app uses Material-UI components with a custom theme. Additional custom styles are in `App.css`.