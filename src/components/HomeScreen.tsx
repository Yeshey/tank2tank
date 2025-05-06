import React, { useState } from 'react';
import './HomeScreen.css'; // We'll create this CSS file

interface HomeScreenProps {
  onStart: (name: string) => void; // Callback function when starting
}

export function HomeScreen({ onStart }: HomeScreenProps) {
  const [playerName, setPlayerName] = useState('');

  const handleStartClick = () => {
    if (playerName.trim()) {
      onStart(playerName.trim());
    } else {
      alert('Please enter a name for your tank!');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(event.target.value);
  };

   const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleStartClick();
    }
  };


  return (
    <div className="home-screen-container">
      <div className="home-screen-box">
        <h1>Tank2Tank</h1>
        <p>Enter your tank name:</p>
        <input
          type="text"
          value={playerName}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress} // Allow Enter key
          placeholder="Tank Commander"
          maxLength={20} // Optional: limit name length
          autoFocus // Focus the input on load
        />
        <button onClick={handleStartClick}>Start Game</button>
      </div>
    </div>
  );
}