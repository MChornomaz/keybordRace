export const startGame = (text, progressCallback, finalCallback) => {
  const textContainer = document.getElementById('text-container');
  textContainer.classList.remove('display-none');
  textContainer.innerHTML = text.split('').map(char => `<span>${char}</span>`).join('');

  let currentIndex = 0;
  let startTime;
  let timerInterval;
  let gameOver = false;
	startTime = new Date().getTime();
	let finalTime = 0;

  document.addEventListener('keydown', handleKeyPress);

  function handleKeyPress(event) {
    if (gameOver) {
      clearInterval(timerInterval);
      return;
    }

    if (currentIndex === 0) {
      timerInterval = setInterval(updateTimer, 100);
    }

    const currentChar = textContainer.childNodes[currentIndex];
    if (!currentChar) {
      gameOver = true;
      clearInterval(timerInterval);
      document.removeEventListener('keydown', handleKeyPress); 
      return;
    }

    const currentCharValue = currentChar.innerText;
    const pressedChar = event.key;

    if (pressedChar === currentCharValue) {
      currentChar.classList.add('correct');
      currentIndex++;
    } 

    updateProgress();

    const totalChars = textContainer.childNodes.length;
    if (currentIndex === totalChars) { 
      gameOver = true;
      clearInterval(timerInterval);
      finalCallback(finalTime)
      document.removeEventListener('keydown', handleKeyPress);
    }
  }

  const updateTimer = () => {
    const currentTime = new Date().getTime();
    finalTime = (currentTime - startTime) / 1000;
		
    if (gameOver) {
      clearInterval(timerInterval);
      return;
    }
  };

  const updateProgress = () => {
    const totalChars = textContainer.childNodes.length;
    const correctChars = currentIndex;
    const progress = (correctChars / totalChars) * 100;
    progressCallback(Math.floor(progress))

    const nextChar = textContainer.childNodes[currentIndex];
    const prevChar = textContainer.childNodes[currentIndex - 1];

    if (nextChar) {
      nextChar.classList.add('next-char');
    }
    
    if (prevChar) {
      prevChar.classList.remove('next-char');
    }
  };
};