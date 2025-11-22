import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const AVATARS = [
  { id: 'explorer', emoji: '🚀', name: 'Space Explorer', color: '#6366f1' },
  { id: 'robot', emoji: '🤖', name: 'Clever Robot', color: '#10b981' },
  { id: 'fox', emoji: '🦊', name: 'Speedy Fox', color: '#f59e0b' },
  { id: 'artist', emoji: '🎨', name: 'Creative Artist', color: '#ec4899' },
  { id: 'wizard', emoji: '🧙', name: 'Quiz Wizard', color: '#8b5cf6' },
  { id: 'ninja', emoji: '🥷', name: 'Swift Ninja', color: '#374151' },
  { id: 'dragon', emoji: '🐲', name: 'Wise Dragon', color: '#ef4444' },
  { id: 'star', emoji: '⭐', name: 'Super Star', color: '#eab308' }
];

const NAMES = ['Luna', 'Blaze', 'Nova', 'Pixel', 'Storm', 'Dash', 'Echo', 'Spark', 'Comet', 'Bolt', 'Ziggy', 'Flash'];

export default function AvatarSelect() {
  const { actions, state } = useGame();
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState(null);

  const handleRandomName = () => {
    setName(NAMES[Math.floor(Math.random() * NAMES.length)] + Math.floor(Math.random() * 99));
  };

  const handleContinue = () => {
    if (!selected || !name.trim()) return;
    const player = { name: name.trim(), avatar: selected.emoji, avatarColor: selected.color };
    actions.setPlayer(player);
    
    if (mode === 'create') {
      actions.createRoom(player);
    } else if (mode === 'join') {
      actions.joinRoom(roomCode, player);
    }
  };

  return (
    <div className="card avatar-select" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Choose Your Avatar</h2>
      
      <div className="avatars-grid">
        {AVATARS.map(avatar => (
          <button
            key={avatar.id}
            className={`avatar-btn ${selected?.id === avatar.id ? 'selected' : ''}`}
            onClick={() => setSelected(avatar)}
            style={{ '--avatar-color': avatar.color }}
          >
            <span className="avatar-emoji">{avatar.emoji}</span>
            <span className="avatar-name">{avatar.name}</span>
          </button>
        ))}
      </div>

      <div className="name-input">
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
        />
        <button className="btn-secondary" onClick={handleRandomName}>🎲</button>
      </div>

      {!mode ? (
        <div className="mode-select">
          <button className="btn-primary btn-large" onClick={() => setMode('create')}>
            Create Room
          </button>
          <button className="btn-secondary btn-large" onClick={() => setMode('join')}>
            Join Room
          </button>
        </div>
      ) : mode === 'join' ? (
        <div className="join-room">
          <input
            type="text"
            placeholder="ROOM CODE"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <div className="btn-group">
            <button className="btn-secondary" onClick={() => setMode(null)}>Back</button>
            <button 
              className="btn-primary" 
              onClick={handleContinue}
              disabled={!selected || !name.trim() || roomCode.length !== 6}
            >
              Join Game
            </button>
          </div>
        </div>
      ) : (
        <div className="btn-group">
          <button className="btn-secondary" onClick={() => setMode(null)}>Back</button>
          <button 
            className="btn-primary btn-large" 
            onClick={handleContinue}
            disabled={!selected || !name.trim()}
          >
            Continue
          </button>
        </div>
      )}

      {state.error && (
        <div className="error-msg">
          <span>❌ {state.error}</span>
          <button onClick={actions.clearError}>✕</button>
        </div>
      )}
    </div>
  );
}