// daisy.js
export function daisyEvent() {
  const audio = new Audio('src/DAISIES.mp3');
  audio.loop = true;
  
  audio.play();

  return function stop() {
    audio.pause();
    audio.currentTime = 0;
  };
}
