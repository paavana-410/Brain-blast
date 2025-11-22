import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import Scoreboard from './Scoreboard';

export default function GameRoom() {
  const { state, actions } = useGame();
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  const currentQ = state.questions[state.currentQuestion];
  const hasAnswered = state.answers[state.currentQuestion] !== undefined;
  const isLastQuestion = state.currentQuestion === state.questions.length - 1;

  useEffect(() => {
    if (!state.endTime) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(state.endTime).getTime();
      const diff = Math.max(0, end - now);
      setTimeLeft(diff);
      
      if (diff === 0 && state.isHost) {
        actions.endGame();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.endTime, state.isHost, actions]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (option) => {
    if (hasAnswered) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption || hasAnswered) return;
    actions.submitAnswer(state.currentQuestion, selectedOption);
    setSelectedOption(null);
  };

  const handleSkip = () => {
    if (state.currentQuestion < state.questions.length - 1) {
      actions.setCurrentQuestion(state.currentQuestion + 1);
      setSelectedOption(null);
    }
  };

  const handlePrevious = () => {
    if (state.currentQuestion > 0) {
      actions.setCurrentQuestion(state.currentQuestion - 1);
      setSelectedOption(null);
    }
  };

  const handleQuestionNav = (index) => {
    actions.setCurrentQuestion(index);
    setSelectedOption(null);
  };

  if (!currentQ) return null;

  return (
    <div className="game-room">
      <div className="game-header">
        <div 
          className="timer" 
          data-warning={timeLeft < 60000}
        >
          ⏱️ {formatTime(timeLeft)}
        </div>
        <div className="progress">
          Question {state.currentQuestion + 1} / {state.questions.length}
        </div>
        {state.isHost && (
          <button className="btn-danger" onClick={actions.endGame}>
            End Game
          </button>
        )}
      </div>

      <div className="game-content">
        <div className="question-panel">
          <div className="ai-badge">
            <span className="ai-glow"></span>
            AI Generated
          </div>

          <h2 className="question-text">{currentQ.question}</h2>

          <div className="options-grid">
            {currentQ.options.map((option, i) => {
              const letter = String.fromCharCode(65 + i);
              const isSelected = selectedOption === option;
              const isAnswered = hasAnswered && state.answers[state.currentQuestion] === option;
              
              return (
                <button
                  key={i}
                  className={`option-btn ${isSelected ? 'selected' : ''} ${isAnswered ? 'answered' : ''}`}
                  onClick={() => handleSelectOption(option)}
                  disabled={hasAnswered}
                >
                  <span className="option-letter">{letter}</span>
                  <span className="option-text">{option}</span>
                </button>
              );
            })}
          </div>

          <div className="question-actions">
            <button 
              className="btn-secondary" 
              onClick={handlePrevious}
              disabled={state.currentQuestion === 0}
            >
              ← Previous
            </button>
            
            {!hasAnswered ? (
              <>
                <button 
                  className="btn-primary" 
                  onClick={handleSubmit}
                  disabled={!selectedOption}
                >
                  Submit Answer
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={handleSkip}
                  disabled={isLastQuestion}
                >
                  Skip →
                </button>
              </>
            ) : (
              <button 
                className="btn-secondary" 
                onClick={handleSkip}
                disabled={isLastQuestion}
              >
                Next →
              </button>
            )}
          </div>

          <div className="question-nav">
            {state.questions.map((_, i) => (
              <button
                key={i}
                className={`nav-dot ${i === state.currentQuestion ? 'current' : ''} ${state.answers[i] !== undefined ? 'answered' : ''}`}
                onClick={() => handleQuestionNav(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <Scoreboard />
      </div>
    </div>
  );
}