const readyBtn = document.getElementById('ready-btn');
const leaveRoomBtn = document.getElementById('quit-room-btn');

export const startTimer = (time, element ,callback) => {
	readyBtn.classList.add('display-none')
	leaveRoomBtn.classList.add('display-none')

	
	element.classList.remove('display-none')

  const updateTimer = () => {
    element.innerText = time;
    time--;

    if (time === 0) {
      clearInterval(intervalId);
      element.classList.add('display-none')
			callback()
    }
  };

  updateTimer(); 
	const intervalId = setInterval(updateTimer, 1000);

	return {clearTimer: () => {
		clearInterval(intervalId);
      element.classList.add('display-none')
	}}
}