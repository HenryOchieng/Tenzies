import { useState, useEffect, useRef } from 'react'
import Confetti from 'react-confetti'
import Die from './Components/Die'
import { nanoid } from 'nanoid'

export default function App() {
  const [dice, setDice] = useState(generateAllNewDice())
  const [gameWon, setGameWon] = useState(false);
  const rollBtnRef = useRef(null)
  const [rollCount, setRollCount] = useState(0)
  const [time, setTime] = useState(0)
  const [bestTime, setBestTime] = useState(
    () => JSON.parse(localStorage.getItem("bestTime")) ?? null
  )
  const [bestRolls, setBestRolls] = useState(
    () => JSON.parse(localStorage.getItem("bestRolls")) ?? null
  )
  
  // Check for win condition whenever dice state changes
  useEffect(() => {
    const allHeld = dice.every(die => die.isHeld);
    const firstValue = dice[0].value;
    const allSameValue = dice.every(die => die.value === firstValue)
    
    if (allHeld && allSameValue) { 
      setGameWon(true);
    }

  }, [dice])

  // Update best time and rolls when game is won
  useEffect(() => {
    if (!gameWon) return 
    
    if (bestTime === null || time < bestTime) {
      setBestTime(time)
      localStorage.setItem("bestTime", JSON.stringify(time))
    }

    if (bestRolls === null || rollCount < bestRolls) {
      setBestRolls(rollCount)
      localStorage.setItem("bestRolls", JSON.stringify(rollCount))
    }

    rollBtnRef.current?.focus()
  }, [gameWon])

  // Timer effect
  useEffect(() => {
    if (gameWon) return 

    let intervalId

    function handleVisibilityChange() {
      if (document.hidden) {
        clearInterval(intervalId)
      } else {
        intervalId = setInterval(() => {
          setTime(prev => prev + 1)
        }, 1000)
      }
    }

    intervalId = setInterval(() => {
      setTime(prev => prev + 1)
    }, 1000)

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  })

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
    setRollCount(0)
    setTime(0)
  }

  function resetBestScores() {
    setBestTime(null)
    setBestRolls(null)
    localStorage.removeItem("bestTime")
    localStorage.removeItem("bestRolls")
  }

  // Function to roll the dice
  function rollDice() {
    if (!gameWon) {
      setRollCount(prev => prev + 1)
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
        {gameWon && <p>Congratulations! You won in {rollCount} rolls and {time} seconds.
          {bestTime === time && " This your best time!"}
          {bestRolls === rollCount && " This is your best roll record!"} 
          Press "New Game" to start again.
        </p>}
      </div>
      <h1 className='title'>Tenzies</h1>
      <p className='instructions'>Roll untill all dice are the same. Click each die to freeze it at its current value between rolls.</p>
      <div className='dice-stats'>
        <p>Rolls: <strong>{rollCount}</strong></p>
        <p>Time: <strong>{time}</strong></p>

        <hr />

        <p>Best Time: {" "}
          <strong>{bestTime !== null ? `${bestTime}s` : "-"}</strong>
        </p>
        <p>Best Rolls: {" "}
          <strong>{bestRolls !== null ? bestRolls : "-"}</strong>
        </p>
      </div>
      <div className='dice-container'>
        {diceElements}
      </div>
      <div className='button-row'>
        <button 
          ref={rollBtnRef} 
          className="roll-dice" 
          onClick={rollDice}
        >
          {gameWon ? "New Game" : "Roll"}
        </button> 
        <button className='reset-scores' onClick={resetBestScores}>Reset Scores</button>
      </div>
    </main>
  )
}