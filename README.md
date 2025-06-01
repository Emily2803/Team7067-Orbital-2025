# ShelfAware -- Team 7067 👋
Level of Achievement -- Apollo 11

## Project Scope
One-sentence version:
ShelfAware is a smart pantry management app for NUS students that helps reduce food waste through expiry tracking, recipe suggestions, and community food sharing.

Descriptive version:
ShelfAware is designed to solve the everyday problem of forgotten pantry items and food waste among university students living in dorms. The app allows users to scan expiry dates using OCR, track their inventory, receive timely notifications, and discover recipe suggestions tailored to their available ingredients. In addition, ShelfAware features a food-sharing platform where users can donate or claim surplus food within the NUS community. By gamifying sustainable habits and enabling smarter food usage, ShelfAware promotes responsible consumption and a connected student ecosystem.
## Problem Motivation
Students often forget what food they have  bought, especially perishable goods tucked away in cupboards or fridges. This leads to expired food, unnecessary expenses, and increased food waste. With rising awareness of sustainability, there is a need for a user-friendly system that helps students be more mindful of their consumption habits. ShelfAware addresses this gap by empowering students with a tool to track, manage, and share their food effectively—minimizing waste and fostering a collaborative, eco-conscious dorm community. 
## Proposed Core Features/User Stories

These features are not yet implemented but are planned for development in future milestones: 

-Food Logging & Expiry Date Scanning (OCR-Based)
Users can take a photo of expiry labels; OCR extracts and records expiry dates automatically.

-Expiry Date Tracking & Notifications
The app sends reminders as items near their expiry date, helping users take timely action.

-AI-Based Recipe Suggestions
Users receive personalized recipe ideas based on ingredients they already have, reducing waste.

-Community-Driven Food Sharing
A built-in platform to list or claim surplus food within the NUS community. AI assists with dietary filtering and urgency-based matching.


## Current Progress 

✅ Login & Register Page
We’ve successfully implemented Firebase Authentication, allowing users to securely sign up and log in using their email and password. User login credentials are stored in Firebase Auth, and account data is managed through Firebase’s built-in backend services. This sets the foundation for personalized features in later stages.

✅ Basic Homepage (Welcome Dashboard)
Once logged in, users are redirected to a simple homepage that displays a personalized welcome message. The homepage is designed using React components, with placeholder sections prepared for future modules such as:

-Pantry inventory

-Recipe suggestions

-Food sharing page

## System Design

-Frontend (React + TypeScript):
The app's interface is built with React functional components, using TypeScript to catch errors early and improve code maintainability. We’ve styled components using plain CSS and HTML. The login form and homepage use reusable UI elements and manage user state effectively.

-Backend (Node.js with Express):
A custom backend has not been developed yet. For now, we’re relying on Firebase's built-in backend services, such as Authentication and (soon) Firestore, which allow us to manage users and data without deploying our own server.

-Firebase Authentication & Firestore:

Authentication: Already in use. It handles secure user login, registration, and session persistence.

Firestore Database: Planned for the next milestone. It will store each user's pantry items, shared food posts, and preferences.

-OCR (Tesseract.js) and Push Notifications:

These features are not yet started. 

We plan to:
Use Tesseract.js to extract expiry dates from food packaging images (Milestone 2).
Implement Firebase Cloud Messaging to send expiry reminders to users' devices (Milestone 2 or 3).


## Setup Instructions


## Work Log
https://docs.google.com/spreadsheets/d/1uvwY5zJe1rlmYZOSrHvpedEZY3KsdoFmI9sbk8u-dBs/edit?usp=sharing
