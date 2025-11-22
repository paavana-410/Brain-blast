import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const TOPICS = [
  { id: 'science', emoji: '🔬', name: 'Science' },
  { id: 'math', emoji: '🔢', name: 'Math' },
  { id: 'history', emoji: '📜', name: 'History' },
  { id: 'geography', emoji: '🌍', name: 'Geography' },
  { id: 'english', emoji: '📚', name: 'English' },
  { id: 'sports', emoji: '⚽', name: 'Sports' },
  { id: 'music', emoji: '🎵', name: 'Music' },
  { id: 'art', emoji: '🎨', name: 'Art' }
];

export default function Lobby() {
  const { state, actions } = useGame();
  const [topic, setTopic] = useState('science');
  const [difficulty, setDifficulty] = useState('simple');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(state.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = () => {
    actions.startGame(topic, difficulty);
  };

  const players = state.game?.players || [];
  const emptySlots = Array(4 - players.length).fill(null);

  return (
    <div className="card lobby">
      <div className="room-code-section">
        <p className="hint">Share this code with friends:</p>
        <div className="room-code" onClick={handleCopy}>
          <span>{state.roomCode}</span>
          <button className="copy-btn">{copied ? '✓' : '📋'}</button>
        </div>
      </div>

      <div className="players-section">
        <h3>Players ({players.length}/4)</h3>
        <div className="players-list">
          {players.map((player, i) => (
            <div 
              key={player.odjectId}
              className="player-card"
              style={{ '--player-color': player.avatarColor }}
            >
              <span className="player-avatar">{player.avatar}</span>
              <span className="player-name">{player.name}</span>
              {i === 0 && <span className="host-badge">HOST</span>}
            </div>
          ))}
          {emptySlots.map((_, i) => (
            <div key={`empty-${i}`} className="player-card empty">
              <span className="player-avatar">👤</span>
              <span className="player-name">Waiting...</span>
            </div>
          ))}
        </div>
      </div>

      {state.isHost ? (
        <>
          <div>
            <h3>Select Topic</h3>
            <div className="topics-grid">
              {TOPICS.map(t => (
                <button
                  key={t.id}
                  className={`topic-btn ${topic === t.id ? 'selected' : ''}`}
                  onClick={() => setTopic(t.id)}
                >
                  <span>{t.emoji}</span>
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3>Difficulty Level</h3>
            <div className="difficulty-toggle">
              <button
                className={`diff-btn ${difficulty === 'simple' ? 'selected' : ''}`}
                onClick={() => setDifficulty('simple')}
              >
                😊 Simple
              </button>
              <button
                className={`diff-btn ${difficulty === 'hard' ? 'selected' : ''}`}
                onClick={() => setDifficulty('hard')}
              >
                🔥 Hard
              </button>
            </div>
          </div>

          <button 
            className="btn-primary btn-large" 
            onClick={handleStart}
            disabled={players.length < 1 || state.generating}
          >
            {state.generating ? (
              <>
                <span className="spinner"></span>
                Generating Questions...
              </>
            ) : (
              'Start Game'
            )}
          </button>
        </>
      ) : (
        <div className="waiting-host">
          <div className="pulse-dot"></div>
          <p>Waiting for host to start the game...</p>
        </div>
      )}
    </div>
  );
}