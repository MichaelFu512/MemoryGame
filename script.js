// global constants
const clueHoldTime = 1000; //how long to hold each clue's light/sound
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequencee

//Global Variables
var pattern = [];
var progress = 0; 
var gamePlaying = false;
var tonePlaying = false; 
var volume = 0.3;  //must be between 0.0 and 1.0
var guessCounter = 0; //how many guesses currently on during the round
var newClueHoldTime = 1000; //how long to hold  
var strike = 0; //counter that holds how many strikes someone can get
var numClues = 8; //number of notes to remember (default 8)
var asdf; //used to count down the timer
var time = 15; //how long the timer is (default 15)

/*
 * Starts the game
 */
function startGame(){
  //initialize game variables
  progress = 0; 
  strike = 0; 
  gamePlaying = true;
  
  //start the game
  randomPattern();
  //console.log("numClues = " + numClues);
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  playClueSequence();
}

/*
 * Used for the slider
 */ 
function updateNoteInput(val) {
    document.getElementById('textInput').value=val; 
    numClues = val;   
}

function updateTimerInput(val) {
  document.getElementById('allotedTime').value = val;
  time = val;
}

/*
 * Generates random pattern 
 */ 
function randomPattern() {
  pattern = [];
  let min = Math.ceil(1);
  let max = Math.floor(8);
  for(let i = 0; i < numClues; i++) {
    pattern.push(Math.floor(Math.random() * (max - min + 1) + min));
  }
  
  /* Prints out the new pattern
  console.log("The pattern is:");
  for(let i = 0; i < pattern.length; i++) {
    console.log(pattern[i]);
  }
  */
}

function stopGame() {
  gamePlaying = false;
  clearInterval(asdf);
  document.getElementById("time").textContent = time;
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
}

// Sound Synthesis Functions
const freqMap = {
  1: 261.6,
  2: 329.6,
  3: 392,
  4: 466.2,
  5: 536,
  6: 606,
  7: 676,
  8: 736
}

function playTone(btn,len){ 
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  tonePlaying = true
  setTimeout(function(){
    stopTone()
  },len)
}

function startTone(btn){
  if(!tonePlaying){
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    tonePlaying = true
  }
}
function stopTone(){
    g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
    tonePlaying = false
}

//Page Initialization
// Init Sound Synthesizer
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)

function lightButton(btn){
  document.getElementById("btn"+btn).classList.add("lit")
}
function clearButton(btn){
  document.getElementById("btn"+btn).classList.remove("lit")
}

function playSingleClue(btn, playTime){
  if(gamePlaying){
    lightButton(btn);
    playTone(btn,playTime);
    setTimeout(clearButton,playTime,btn);
  }
}

function playClueSequence(){
  let x = newClueHoldTime - (100*progress);
  var t = time;
  clearInterval(asdf);
  
  //minimum delay is 250 ms
  if(x < 250) {
    x = 250;
  }
  let delay = x;
  //console.log("x = " + x);
  guessCounter = 0;
  console.log("pattern[0] = " + pattern[0]);
  for(let i=0;i<=progress;i++){ // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue,delay,pattern[i], x) // set a timeout to play that clue
    delay += x; 
    delay += cluePauseTime;
  }
  document.getElementById("time").textContent = t;
  setTimeout(timer, delay, t);
}


function timer(t) {
  asdf = setInterval(count, 1000);
  
  function count() {
    t--;
    document.getElementById("time").textContent = t;
    if(t < 0) {
      clearInterval(asdf);
      alert("Ran out of time!");
      loseGame();
      t++;
      document.getElementById("time").textContent = t;
    }
  }
}


function guess(btn){

  console.log("user guessed: " + btn);
  if(!gamePlaying){
    return;
  }
  
  //Correct guess
  if(btn == pattern[guessCounter]){
    //if end of current pattern
    if(guessCounter == progress){
      //Win because you reached end of pattern
      if(progress == pattern.length - 1){
        winGame();
      }
      //Continue with pattern
      else{
        progress++;
        playClueSequence();
      }
    }
    //Haven't reached end of current known pattern, keep guessing
    else{
      guessCounter++;
    }
  }
  
  //Wrong guess
  else{
    strike++;
    alert("Incorrect: Strike #" + strike);
    if(strike == 3) {
        loseGame();
    }
    playClueSequence();
  }
}  

function loseGame(){
  stopGame();
  alert("Game Over. You lost :(");
}

function winGame(){
  stopGame();
  alert("Victory!!");
}
