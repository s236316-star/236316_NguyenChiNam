
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const foodRoutes = require('./routes/foodRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Auto Food API is running',
        timestamp: new Date().toISOString()
    });
});

// Food API
app.use('/api/foods', foodRoutes);

// 404 handler - đặt sau các routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Cannot start server without MongoDB.');
        process.exit(1);
    }
}

startServer();
