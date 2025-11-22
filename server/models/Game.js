const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  odjectId: String,
  name: String,
  avatar: String,
  score: { type: Number, default: 0 },
  answers: [{
    questionIndex: Number,
    answer: String,
    correct: Boolean
  }]
});

const QuestionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String,
  explanation: String
});

const GameSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  hostId: String,
  topic: String,
  difficulty: { type: String, enum: ['simple', 'hard'], default: 'simple' },
  status: { 
    type: String, 
    enum: ['waiting', 'playing', 'finished'], 
    default: 'waiting' 
  },
  players: [PlayerSchema],
  questions: [QuestionSchema],
  currentQuestion: { type: Number, default: 0 },
  startTime: Date,
  endTime: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', GameSchema);