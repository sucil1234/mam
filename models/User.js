const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    assessments: [
        {
            anxiety: { type: Number, required: true },
            depression: { type: Number, required: true },
            stress: { type: Number, required: true },
            date: { type: Date, default: Date.now }
        }
    ],
    moods: [
        {
            moodLevel: { type: Number, required: true },
            date: { type: Date, default: Date.now }
        }
    ],
    messages: [
        {
            message: { type: String, required: true },
            date: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('User', userSchema);
