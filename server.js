const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { verifyToken } = require('./middleware/auth');
const User = require('./models/User'); 

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://sucilbhandari11:Uqu57h2qjz@cluster0.h5i6ukf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

        res.json({ token, userId: user._id });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/user/assessment', verifyToken, async (req, res) => {
    const { userId, anxiety, depression, stress } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.assessments.push({ anxiety, depression, stress });
        await user.save();

        res.status(201).json({ message: 'Assessment submitted successfully' });
    } catch (error) {
        console.error('Assessment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/user/mood', verifyToken, async (req, res) => {
    const { userId, moodLevel } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.moods.push({ moodLevel });
        await user.save();

        res.status(201).json({ message: 'Mood logged successfully' });
    } catch (error) {
        console.error('Mood logging error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch assessments for the user
app.get('/user/assessments/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.assessments);
    } catch (error) {
        console.error('Fetch assessments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch moods for the user
app.get('/user/moods/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.moods);
    } catch (error) {
        console.error('Fetch moods error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/resources', verifyToken, async (req, res) => {
    console.log('Fetching resources with token verification passed');
    try {
        const resources = [
            { title: 'Resource 1', content: 'This is resource 1 content' },
            { title: 'Resource 2', content: 'This is resource 2 content' },
            { title: 'Resource 3', content: 'This is resource 3 content' },
            // Add more resources here
        ];
        res.json(resources);
    } catch (error) {
        console.error('Resources error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/messages', verifyToken, async (req, res) => {
    const { userId, message } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.messages.push({ message, date: new Date() });
        await user.save();

        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/messages/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.messages);
    } catch (error) {
        console.error('Message fetching error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/exercises', verifyToken, async (req, res) => {
    try {
        const exercises = [
            { title: 'Deep Breathing', description: 'Take a deep breath in through your nose, hold for a few seconds, and slowly exhale through your mouth. Repeat for 5-10 minutes.' },
            { title: 'Progressive Muscle Relaxation', description: 'Tense and then slowly release each muscle group, starting from your toes and working up to your head.' },
            { title: 'Mindfulness Meditation', description: 'Sit quietly and focus on your breath. If your mind wanders, gently bring your focus back to your breath.' },
            // Add more exercises here
        ];
        res.json(exercises);
    } catch (error) {
        console.error('Exercises error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
