import React from 'react';
import { useGame } from '../context/GameContext';

export default function Scoreboard() {
  const { state } = useGame();
  
  const players = state.game?.players || [];
  const sortedPlayers = [...players].sort((a, b) => {
    const scoreA = state.scores[a.odjectId] || 0;
    const scoreB = state.scores[b.odjectId] || 0;
    return scoreB - scoreA;
  });

  return (
    <div className="scoreboard">
      <h3>🏆 Live Scores</h3>
      <div className="scores-list">
        {sortedPlayers.map((player, i) => (
          <div 
            key={player.odjectId}
            className={`score-item rank-${i + 1}`}
            style={{ '--player-color': player.avatarColor }}
          >
            <span className="rank">#{i + 1}</span>
            <span className="player-avatar">{player.avatar}</span>
            <span className="player-name">{player.name}</span>
            <span className="player-score">{state.scores[player.odjectId] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}