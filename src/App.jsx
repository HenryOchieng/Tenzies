import { useState, useEffect, useRef } from 'react'
import Confetti from 'react-confetti'
import Die from './Components/Die'
import { nanoid } from 'nanoid'

export default function App() {
  const [dice, setDice] = useState(generateAllNewDice())
  const [gameWon, setGameWon] = useState(false);
  const rollBtnRef = useRef(null)
  
  // Check for win condition whenever the dice state changes
  useEffect(() => {
    const allHeld = dice.every(die => die.isHeld);
    const firstValue = dice[0].value;
    const allSameValue = dice.every(die => die.value === firstValue)
    if (allHeld && allSameValue) { 
      setGameWon(true);
    }
  }, [dice]) // Dependency array to run the effect whenever the dice state changes

  // Focus the roll button when the game is won
  useEffect(() => { 
    if (gameWon) {
      rollBtnRef.current?.focus()
    }
  }, [gameWon])

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

  // Function to reset the game
  function resetGame() {
    setDice(generateAllNewDice()); 
    setGameWon(false);
  }

  // Function to roll the dice
  function rollDice() {
    if (!gameWon) {
          setDice(oldDice => 
          oldDice.map(die => {
          return die.isHeld
          ? die
          : { ...die, value: Math.ceil(Math.random() * 6) }
      })
    )
    } else {
      resetGame()
    }

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

  // Render the main component
  return (
    <main>
      {gameWon && <Confetti />}
      <div aria-live='polite' className='sr-only'>
        {gameWon && <p>Congratulations! You won the game! Press "New Game" to start again.</p>}
      </div>
      <h1 className='title'>Tenzies</h1>
      <p className='instructions'>Roll untill all dice are the same. Click each die to freeze it at its current value between rolls.</p>
      <div className='dice-container'>
        {diceElements}
      </div>
      <button 
        ref={rollBtnRef} 
        className="roll-dice" 
        onClick={rollDice}
      >
        {gameWon ? "New Game" : "Roll"}
      </button> 
    </main>
  )
}