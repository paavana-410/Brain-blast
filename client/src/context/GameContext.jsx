import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { socket, connectSocket } from '../socket';

const GameContext = createContext();

const initialState = {
  player: null,
  roomCode: null,
  game: null,
  questions: [],
  currentQuestion: 0,
  answers: {},
  scores: {},
  endTime: null,
  status: 'idle',
  isHost: false,
  error: null,
  generating: false,
  gameResults: null
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, player: action.payload };
    case 'ROOM_CREATED':
      return { ...state, roomCode: action.payload.roomCode, game: action.payload.game, isHost: true, status: 'waiting' };
    case 'ROOM_JOINED':
      return { ...state, roomCode: action.payload.roomCode, game: action.payload.game, status: 'waiting' };
    case 'PLAYER_JOINED':
    case 'PLAYER_LEFT':
      return { ...state, game: action.payload.game };
    case 'GENERATING':
      return { ...state, generating: action.payload };
    case 'GAME_STARTED':
      const initScores = {};
      state.game?.players?.forEach(p => { initScores[p.odjectId] = p.score || 0; });
      return { ...state, questions: action.payload.questions, endTime: action.payload.endTime, status: 'playing', generating: false, scores: initScores };
    case 'SET_CURRENT_QUESTION':
      return { ...state, currentQuestion: action.payload };
    case 'SAVE_ANSWER':
      return { ...state, answers: { ...state.answers, [action.payload.index]: action.payload.answer } };
    case 'SCORE_UPDATE':
      return { ...state, scores: { ...state.scores, [action.payload.playerId]: action.payload.score } };
    case 'GAME_ENDED':
      return { ...state, status: 'finished', gameResults: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    connectSocket();

    socket.on('roomCreated', (data) => dispatch({ type: 'ROOM_CREATED', payload: data }));
    socket.on('playerJoined', (data) => dispatch({ type: 'PLAYER_JOINED', payload: data }));
    socket.on('playerLeft', (data) => dispatch({ type: 'PLAYER_LEFT', payload: data }));
    socket.on('generatingQuestions', ({ status }) => dispatch({ type: 'GENERATING', payload: status }));
    socket.on('gameStarted', (data) => dispatch({ type: 'GAME_STARTED', payload: data }));
    socket.on('scoreUpdate', (data) => dispatch({ type: 'SCORE_UPDATE', payload: data }));
    socket.on('gameEnded', (data) => dispatch({ type: 'GAME_ENDED', payload: data }));
    socket.on('error', (data) => dispatch({ type: 'SET_ERROR', payload: data.message }));

    return () => {
      socket.off('roomCreated');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('generatingQuestions');
      socket.off('gameStarted');
      socket.off('scoreUpdate');
      socket.off('gameEnded');
      socket.off('error');
    };
  }, []);

  const actions = {
    setPlayer: (player) => dispatch({ type: 'SET_PLAYER', payload: player }),
    createRoom: (player) => socket.emit('createRoom', { player }),
    joinRoom: (roomCode, player) => {
      socket.emit('joinRoom', { roomCode: roomCode.toUpperCase(), player });
      socket.once('playerJoined', (data) => dispatch({ type: 'ROOM_JOINED', payload: { roomCode, game: data.game } }));
    },
    startGame: (topic, difficulty) => socket.emit('startGame', { roomCode: state.roomCode, topic, difficulty }),
    submitAnswer: (questionIndex, answer) => {
      dispatch({ type: 'SAVE_ANSWER', payload: { index: questionIndex, answer } });
      socket.emit('submitAnswer', { roomCode: state.roomCode, questionIndex, answer });
    },
    setCurrentQuestion: (index) => dispatch({ type: 'SET_CURRENT_QUESTION', payload: index }),
    endGame: () => socket.emit('endGame', { roomCode: state.roomCode }),
    clearError: () => dispatch({ type: 'SET_ERROR', payload: null }),
    reset: () => dispatch({ type: 'RESET' })
  };

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);