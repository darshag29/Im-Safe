const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();

// Middleware for parsing JSON
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/safeapp', { useNewUrlParser: true, useUnifiedTopology: true });

// User schema and model
const UserSchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String,
    emergencyContacts: [String], // Array of phone numbers
});
const User = mongoose.model('User', UserSchema);

// Create Twilio client
const client = twilio('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');

// SOS route
app.post('/sendSOS', async (req, res) => {
    const { latitude, longitude } = req.body;
    const user = await User.findOne(); // Modify this to fetch the actual user
    
    if (user) {
        user.emergencyContacts.forEach(contact => {
            client.messages.create({
                body: `URGENT: ${user.name} needs help. Location: https://maps.google.com/?q=${latitude},${longitude}`,
                from: '+1234567890', // Your Twilio number
                to: contact
            });
        });

        res.json({ message: 'SOS alert sent successfully' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Police Helpline route
app.get('/callPolice', (req, res) => {
    nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password'
        }
    }).sendMail({
        from: 'your-email@gmail.com',
        to: 'police-helpline-email@example.com',
        subject: 'Emergency Alert',
        text: 'A woman needs immediate help. Please respond immediately.'
    });

    res.json({ message: 'Police help called' });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
