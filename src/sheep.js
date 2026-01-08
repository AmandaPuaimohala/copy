let sheepInterval;

export function spamSheep(scene) {
  
  sheepInterval = setInterval(() => {
    const sheep = document.createElement('div');
    sheep.textContent = '🐑';
    sheep.style.position = 'absolute';
    sheep.style.fontSize = `${Math.random() * 40 + 30}px`;
    sheep.style.left = `${Math.random() * window.innerWidth}px`;
    sheep.style.top = `-50px`;
    sheep.style.pointerEvents = 'none';
    sheep.style.zIndex = 9999;
    document.body.appendChild(sheep);

    const distance = window.innerHeight + 100;
    const duration = 5000 + Math.random() * 3000;
    const swing = Math.random() * 100 - 50; 

    sheep.animate(
      [
        { transform: `translate(0px,0px)`, opacity: 1 },
        { transform: `translate(${swing}px,${distance}px)`, opacity: 0 }
      ],
      { duration, easing: 'ease-in-out' }
    ).onfinish = () => sheep.remove();
  }, 300);
  
  return function stopSheep() {
    clearInterval(sheepInterval);
 
  };
}
