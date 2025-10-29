import { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import Die from './Components/Die'
import { nanoid } from 'nanoid'

export default function App() {
  const [dice, setDice] = useState(generateAllNewDice())
  const [gameWon, setGameWon] = useState(false);
  
  // Check for win condition whenever the dice state changes
  useEffect(() => {
    const allHeld = dice.every(die => die.isHeld); // Check if all dice are held
    const firstValue = dice[0].value; // Get the value of the first die
    const allSameValue = dice.every(die => die.value === firstValue) // Check if all dice have the same value

    if (allHeld || allSameValue) { 
      setGameWon(true);
      console.log("You've Won!")
    }
  }, [dice]) // Dependency array to run the effect whenever the dice state changes

  // Function to generate an array of 10 new dice objects
  function generateAllNewDice() {
    return Array(10)
        .fill(0)
        .map(() => ({
          value: Math.ceil(Math.random() * 6), //
          isHeld: false,
          id: nanoid()
        }))
  }

  // Function to roll the dice
  function rollDice() {
    if (gameWon) return; // If the game is won, do nothing on roll
    setDice(oldDice => 
      oldDice.map(die => {
        return die.isHeld
          ? die // If the die is held, return it unchanged
          : { ...die, value: Math.ceil(Math.random() * 6) } // If not held, return a new die object with a new random value
      })
    )
  }

  // Fuction to toggle the isHeld property of a die
  function hold(id) {
    setDice((oldDice) =>
      oldDice.map((die) => 
        die.id === id ? { ...die, isHeld: !die.isHeld } : die //Ternary operator to toggle isHeld property of the die with matching id
      )
    )
  }

  // Create Die components for each die object in the dice state array
  const diceElements = dice.map((dieObj) => (
    <Die 
      key={dieObj.id} 
      value={dieObj.value} 
      isHeld={dieObj.isHeld} 
      hold={() => hold(dieObj.id)}
    />
  ))

  // Function to reset the game
  function resetGame() {
    setDice(generateAllNewDice()); 
    setGameWon(false);
  }

  // Render the main component
  return (
    <main>
      {gameWon && <Confetti />}
      <h1 className='title'>Tenzies</h1>
      <p className='instructions'>Roll untill all dice are the same. Click each die to freeze it at its current value between rolls.</p>
      <div className='dice-container'>
        {diceElements}
      </div>
      <button className="roll-dice" onClick={rollDice}>{gameWon ? "Game Over" : "Roll"}</button>
      {gameWon && <div className="congratulations">Congratulations! You've won!</div>}
      <button className="reset-dice" onClick={resetGame}>Reset</button>
    </main>
  )
}