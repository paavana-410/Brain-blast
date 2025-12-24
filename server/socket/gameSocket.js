 const Game = require('../models/Game');
const { generateQuestions } = require('../services/aiService');

const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

function setupGameSocket(io) {
  const activeGames = new Map();
  const gameTimers = new Map();

  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    socket.on('createRoom', async ({ player }) => {
      try {
        const roomCode = generateRoomCode();
        const game = new Game({
          roomCode,
          hostId: socket.id,
          players: [{ odjectId: socket.id, ...player, score: 0, answers: [] }]
        });
        await game.save();
        activeGames.set(roomCode, game);
        
        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.emit('roomCreated', { roomCode, game });
      } catch (err) {
        socket.emit('error', { message: 'Failed to create room' });
      }
    });

    socket.on('joinRoom', async ({ roomCode, player }) => {
      try {
        let game = activeGames.get(roomCode) || await Game.findOne({ roomCode });
        
        if (!game) return socket.emit('error', { message: 'Room not found' });
        if (game.status !== 'waiting') return socket.emit('error', { message: 'Game already started' });
        if (game.players.length >= 4) return socket.emit('error', { message: 'Room is full' });

        game.players.push({ odjectId: socket.id, ...player, score: 0, answers: [] });
        await Game.findOneAndUpdate({ roomCode }, { players: game.players });
        activeGames.set(roomCode, game);

        socket.join(roomCode);
        socket.roomCode = roomCode;
        io.to(roomCode).emit('playerJoined', { game });
      } catch (err) {
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('startGame', async ({ roomCode, topic, difficulty }) => {
      try {
        let game = activeGames.get(roomCode);
        if (!game || game.hostId !== socket.id) return;

        socket.emit('generatingQuestions', { status: true });
        const questions = await generateQuestions(topic, difficulty);
        
        game.topic = topic;
        game.difficulty = difficulty;
        game.questions = questions;
        game.status = 'playing';
        game.startTime = new Date();
        game.endTime = new Date(Date.now() + 15 * 60 * 1000);

        await Game.findOneAndUpdate({ roomCode }, game);
        activeGames.set(roomCode, game);

        io.to(roomCode).emit('gameStarted', {
          questions: questions.map(q => ({ ...q, correctAnswer: undefined })),
          endTime: game.endTime,
          totalQuestions: questions.length
        });

        const timer = setTimeout(() => endGame(roomCode), 15 * 60 * 1000);
        gameTimers.set(roomCode, timer);
      } catch (err) {
        socket.emit('error', { message: 'Failed to start game' });
      }
    });

    socket.on('submitAnswer', async ({ roomCode, questionIndex, answer }) => {
      try {
        let game = activeGames.get(roomCode);
        if (!game || game.status !== 'playing') return;

        const player = game.players.find(p => p.odjectId === socket.id);
        if (!player) return;

        const question = game.questions[questionIndex];
        const correct = question.correctAnswer === answer;
        
        const existingAnswer = player.answers.find(a => a.questionIndex === questionIndex);
        if (existingAnswer) return;

        player.answers.push({ questionIndex, answer, correct });
        if (correct) player.score += 10;

        await Game.findOneAndUpdate({ roomCode }, { players: game.players });
        activeGames.set(roomCode, game);

        io.to(roomCode).emit('scoreUpdate', {
          playerId: socket.id,
          playerName: player.name,
          score: player.score,
          correct,
          questionIndex
        });
      } catch (err) {
        console.error('Submit answer error:', err);
      }
    });

    async function endGame(roomCode) {
      try {
        let game = activeGames.get(roomCode);
        if (!game) return;

        game.status = 'finished';
        await Game.findOneAndUpdate({ roomCode }, { status: 'finished' });

        const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
        const winner = sortedPlayers[0];

        io.to(roomCode).emit('gameEnded', {
          winner,
          finalScores: sortedPlayers,
          questions: game.questions
        });

        clearTimeout(gameTimers.get(roomCode));
        gameTimers.delete(roomCode);
      } catch (err) {
        console.error('End game error:', err);
      }
    }

    socket.on('endGame', ({ roomCode }) => {
      const game = activeGames.get(roomCode);
      if (game && game.hostId === socket.id) {
        endGame(roomCode);
      }
    });

    socket.on('disconnect', async () => {
      console.log('Player disconnected:', socket.id);
      if (socket.roomCode) {
        const game = activeGames.get(socket.roomCode);
        if (game) {
          game.players = game.players.filter(p => p.odjectId !== socket.id);
          if (game.players.length === 0) {
            activeGames.delete(socket.roomCode);
            clearTimeout(gameTimers.get(socket.roomCode));
          } else {
            if (game.hostId === socket.id && game.players.length > 0) {
              game.hostId = game.players[0].odjectId;
            }
            io.to(socket.roomCode).emit('playerLeft', { game });
          }
          await Game.findOneAndUpdate({ roomCode: socket.roomCode }, game);
        }
      }
    });
  });
}

module.exports = setupGameSocket;