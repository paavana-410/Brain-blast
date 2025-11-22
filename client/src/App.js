import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import AvatarSelect from './components/AvatarSelect';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';
import GameOver from './components/GameOver';
import './App.css';

function GameFlow() {
  const { state } = useGame();

  if (state.status === 'finished') return <GameOver />;
  if (state.status === 'playing') return <GameRoom />;
  if (state.status === 'waiting') return <Lobby />;
  return <AvatarSelect />;
}

function App() {
  return (
    <GameProvider>
      <div className="app">
        <div className="stars"></div>
        <div className="twinkling"></div>
        <header className="header">
          <h1 className="title">🧠 Brain Blast</h1>
          <p className="subtitle">Real-Time Quiz Challenge!</p>
        </header>
        <main className="main">
          <GameFlow />
        </main>
      </div>
    </GameProvider>
  );
}

export default App;