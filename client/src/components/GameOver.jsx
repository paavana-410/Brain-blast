import React from 'react';
import { useGame } from '../context/GameContext';

export default function GameOver() {
  const { state, actions } = useGame();
  const results = state.gameResults;

  if (!results) return null;

  const { winner, finalScores } = results;

  return (
    <div className="card game-over">
      <div className="confetti">🎉</div>
      <h1 className="winner-title">Game Over!</h1>

      {winner && (
        <div className="winner-section">
          <div 
            className="winner-avatar"
            style={{ '--winner-color': winner.avatarColor }}
          >
            {winner.avatar}
          </div>
          <div className="winner-name">{winner.name} Wins!</div>
          <div className="winner-score">Score: {winner.score} points</div>
        </div>
      )}

      <div className="final-standings">
        <h3>Final Standings</h3>
        {finalScores.map((player, i) => {
          const correctAnswers = player.answers?.filter(a => a.correct).length || 0;
          return (
            <div 
              key={player.odjectId}
              className={`standing-item rank-${i + 1}`}
              style={{ '--player-color': player.avatarColor }}
            >
              <span className="standing-rank">#{i + 1}</span>
              <span className="standing-avatar">{player.avatar}</span>
              <span className="standing-name">{player.name}</span>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div className="standing-score">{player.score} pts</div>
                <div className="standing-correct">{correctAnswers} correct</div>
              </div>
            </div>
          );
        })}
      </div>

      <button 
        className="btn-primary btn-large" 
        onClick={() => {
          actions.reset();
          window.location.reload();
        }}
      >
        Play Again
      </button>
    </div>
  );
}