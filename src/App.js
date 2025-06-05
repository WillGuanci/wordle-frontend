import React, { useState } from 'react';
import axios from 'axios';

const MAX_GUESSES = 6;


const pageStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2rem',
  backgroundColor: '#121213',
  color: '#f5f5f5',
  minHeight: '100vh',
  fontFamily: "'Roboto Mono', monospace",
};

const containerStyle = {
  width: '100%',
  maxWidth: '500px',
  backgroundColor: '#1a1a1b',
  borderRadius: '16px',
  padding: '2rem',
  boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
};

const sectionStyle = {
  marginTop: '2rem',
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  fontSize: '1.25rem',
  textAlign: 'center',
  borderRadius: '0.75rem',
  border: 'none',
  backgroundColor: '#2a2a2c',
  color: 'white',
  outline: 'none',
};



const buttonStyle = {
  padding: '0.5rem 1rem',
  fontSize: '1rem',
  borderRadius: '0.75rem',
  border: 'none',
  backgroundColor: '#333',
  color: 'white',
  cursor: 'pointer',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '2rem',
  gap: '1rem',
};



function App() {
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState(['b', 'b', 'b', 'b', 'b']);
  const [remaining, setRemaining] = useState([]);
  const [history, setHistory] = useState([]);
  const [solved, setSolved] = useState(false);
  const [currentGuesses, setCurrentGuesses] = useState(0);
  const [solveHistory, setSolveHistory] = useState([]);
  const [showAbout, setShowAbout] = useState(false);



  const handleFeedbackClick = (index) => {
    const newFeedback = [...feedback];
    const current = newFeedback[index];
    newFeedback[index] =
      current === 'b' ? 'y' :
      current === 'y' ? 'g' :
      'b';
    setFeedback(newFeedback);
  };



const handleSubmit = async (e) => {
  e.preventDefault();

  // Prevent further guessing if game is over:
  if (solved || currentGuesses >= MAX_GUESSES) {
    return;
  }

  try {
    const response = await axios.post('https://wordle-backend-ozqd.onrender.com/filter', {
      guess,
      feedback,
    });

    setRemaining(response.data.remaining);
    setHistory((prev) => [...prev, { guess, feedback }]);
    setGuess('');
    setFeedback(['b', 'b', 'b', 'b', 'b']);
    setCurrentGuesses(prev => prev + 1);

    // Check win
    if (feedback.join('') === 'ggggg') {
      setSolved(true);
      console.log(`Solved in ${currentGuesses + 1} guesses!`);
    }
    // No need to explicitly check "lose" — UI will display based on currentGuesses >= MAX_GUESSES

  } catch (error) {
    console.error('Error filtering words:', error);
  }
};




  const handleReset = async () => {
    try {
      await axios.post('https://wordle-backend-ozqd.onrender.com/reset');
      setRemaining([]);
      setHistory([]);

      // If this game was solved → log it
      if (solved) {
        setSolveHistory(prev => [...prev, currentGuesses]);
      }

      // Reset state
      setSolved(false);
      setCurrentGuesses(0);
      setGuess('');
      setFeedback(['b', 'b', 'b', 'b', 'b']);
    } catch (error) {
      console.error('Error resetting words:', error);
    }
  };


return (
  <div style={pageStyle}>
    <h1 style={{ marginBottom: '1rem' }}>Wordle Solver</h1>

    {/* WIN / LOSE BANNER */}
    {solved && (
      <div style={{
        backgroundColor: '#538d4e',
        color: '#fff',
        padding: '1rem',
        borderRadius: '12px',
        marginBottom: '1rem',
        fontSize: '1.5rem',
        fontWeight: 'bold',
      }}>
        🎉 Solved in {currentGuesses} guesses!
      </div>
    )}

    {!solved && currentGuesses >= MAX_GUESSES && (
      <div style={{
        backgroundColor: '#c0392b',
        color: '#fff',
        padding: '1rem',
        borderRadius: '12px',
        marginBottom: '1rem',
        fontSize: '1.5rem',
        fontWeight: 'bold',
      }}>
        ❌ Game Over — Word not solved!
      </div>
    )}

    {/* FORM */}
    <form onSubmit={handleSubmit} style={formStyle}>
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        maxLength={5}
        style={{ fontSize: '1.2rem', padding: '0.5rem', borderRadius: '8px', marginRight: '1rem' }}
        placeholder="Enter guess"
      />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {feedback.map((f, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleFeedbackClick(i)}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor:
                f === 'g' ? '#538d4e' :
                f === 'y' ? '#b59f3b' :
                '#3a3a3c',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: '#fff',
            }}
          >
            {guess[i] ? guess[i].toUpperCase() : ''}
          </button>
        ))}
      </div>
      <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '1rem', borderRadius: '8px' }}>
        Submit
      </button>
    </form>

    {/* HISTORY */}
    <div style={sectionStyle}>
      <h3>Guess History</h3>
      <ul style={{ paddingLeft: 0 }}>
        {history.map((entry, index) => (
          <li
            key={index}
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            {entry.guess.split('').map((letter, i) => (
              <div
                key={i}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor:
                    entry.feedback[i] === 'g'
                      ? '#538d4e'
                      : entry.feedback[i] === 'y'
                      ? '#b59f3b'
                      : '#3a3a3c',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  color: '#fff',
                }}
              >
                {letter.toUpperCase()}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>

    {/* SUGGESTIONS */}
    <div style={sectionStyle}>
      <h3>Suggestions</h3>
      <ul style={{ paddingLeft: 0 }}>
        {remaining.map((word, index) => (
          <li
            key={index}
            style={{
              listStyle: 'none',
              backgroundColor: index === 0 ? '#538d4e' : 'transparent',
              color: index === 0 ? '#fff' : '#f5f5f5',
              fontWeight: index === 0 ? 'bold' : 'normal',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              marginBottom: '0.25rem',
              fontFamily: 'monospace',
            }}
          >
            {word}
          </li>
        ))}
      </ul>
    </div>

    {/* RESET */}
    <button
      onClick={handleReset}
      style={{
        marginTop: '1.5rem',
        padding: '0.5rem 1rem',
        fontSize: '1rem',
        borderRadius: '8px',
        backgroundColor: '#b59f3b',
        color: '#fff',
        fontWeight: 'bold',
      }}
    >
      Reset
    </button>

    {/* ABOUT */}
    <button
      onClick={() => setShowAbout(true)}
      style={{
        marginTop: '1rem',
        padding: '0.5rem 1rem',
        fontSize: '1rem',
        borderRadius: '8px',
        backgroundColor: '#555',
        color: '#fff',
        fontWeight: 'bold',
      }}
    >
      About
    </button>

    {/* STATS */}
    <div style={sectionStyle}>
      <h3>Solver Stats</h3>
      <p>Games Played: {solveHistory.length}</p>
      <p>
        Average Guesses:{' '}
        {solveHistory.length > 0
          ? (
              solveHistory.reduce((a, b) => a + b, 0) / solveHistory.length
            ).toFixed(2)
          : 'N/A'}
      </p>
      <p>
        Current Game:{' '}
        {solved
          ? `Solved in ${currentGuesses} guesses!`
          : currentGuesses >= MAX_GUESSES
          ? 'Game Over — Not solved'
          : 'In Progress'}
      </p>
    </div>

    {/* ABOUT MODAL */}
    {showAbout && (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={() => setShowAbout(false)}
      >
        <div
          style={{
            backgroundColor: '#222',
            color: '#fff',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '400px',
            textAlign: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
            About Wordle Solver
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Built by Will Guanci. 🎓 Graduated early from CU Boulder, earned AMGA SPI certification, and developed this Wordle Solver using entropy-based scoring and React.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            Open source on{' '}
            <a
              href="https://github.com/your-repo"  // Replace with your GitHub repo!
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4fa3ff' }}
            >
              GitHub
            </a>.
          </p>
          <button
            onClick={() => setShowAbout(false)}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              borderRadius: '8px',
              backgroundColor: '#4fa3ff',
              color: '#fff',
              fontWeight: 'bold',
            }}
          >
            Close
          </button>
        </div>
      </div>
    )}
  </div>
);



}

export default App;