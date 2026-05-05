/*
 * server.js - Main Express Server
 * This is the entry point of the backend application.
 * It sets up the Express server, middleware, and routes.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database and routes
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ═══════════════════════════════════════
// MIDDLEWARE (runs on every request)
// ═══════════════════════════════════════

// Enable CORS - allows frontend to communicate with backend
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ═══════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════

// Authentication routes (login, register, profile)
app.use('/api/auth', authRoutes);

// Appointment routes (booking, viewing)
app.use('/api/appointments', appointmentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Shalamar Hospital Backend is running!',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// ═══════════════════════════════════════
// STATIC FILES (Frontend)
// ═══════════════════════════════════════

// Serve frontend files from 'public' folder (if they exist)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML file for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ═══════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════

// Handle 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found. Please check the API endpoint.'
  });
});

// Handle server errors
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ═══════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════

// Test database connection, then start server
const startServer = async () => {
  await testConnection();

  app.listen(PORT, () => {
    console.log('\n🏥 Shalamar Hospital Backend Server');
    console.log('═══════════════════════════════════════');
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
    console.log('');
    console.log('📋 Available Endpoints:');
    console.log(`   POST http://localhost:${PORT}/api/auth/register`);
    console.log(`   POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   GET  http://localhost:${PORT}/api/auth/profile`);
    console.log(`   POST http://localhost:${PORT}/api/appointments`);
    console.log(`   GET  http://localhost:${PORT}/api/health`);
    console.log('═══════════════════════════════════════\n');
  });
};

startServer();
