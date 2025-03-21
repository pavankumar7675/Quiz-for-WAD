const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/quizDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const questionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: String,
});

const Question = mongoose.model('Question', questionSchema);

// GET: Fetch a random question
app.get('/api/question', async (req, res) => {
    try {
        const count = await Question.countDocuments();
        if (count === 0) {
            return res.status(404).json({ message: 'No questions available' });
        }
        const randomIndex = Math.floor(Math.random() * count);
        const randomQuestion = await Question.findOne().skip(randomIndex).select('-correctAnswer');
        res.json(randomQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// POST: Submit an answer
app.post('/api/answer', async (req, res) => {
    try {
        const { questionId, selectedAnswer } = req.body;
        if (!questionId || !selectedAnswer) {
            return res.status(400).json({ message: 'Invalid request' });
        }
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        const isCorrect = question.correctAnswer === selectedAnswer;
        res.json({ correct: isCorrect });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
