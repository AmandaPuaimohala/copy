import * as THREE from 'three';

export function startAquarius(scene, camera) {
  const group = new THREE.Group();
  scene.add(group);

  let active = true;
  const letters = [];
  let launchListener;

  function stopAquarius() {
    active = false;
    if (launchListener) window.removeEventListener('click', launchListener);
    letters.forEach(sprite => {
      sprite.material.map.dispose();
      sprite.material.dispose();
      group.remove(sprite);
    });
    scene.remove(group);
  }

  const result = { stop: stopAquarius };
  const words = 'Aquarius Independence'.split('');

  function createLetterSprite(char, color = '#66ccff', size = 64) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.font = `${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.5, 0.5, 0.5); 
    return sprite;
  }

  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const basePos = new THREE.Vector3().copy(camera.position).add(forward.multiplyScalar(2));
  words.forEach((char, i) => {
    const sprite = createLetterSprite(char);
    sprite.position.copy(basePos);
    sprite.position.x += (i - words.length / 2) * 0.3;
    sprite.userData = { yOffset: Math.random() * 0.5, speed: 0.002 + Math.random() * 0.003 };
    group.add(sprite);
    letters.push(sprite);
  });

  function animate() {
    if (!active) return;
    requestAnimationFrame(animate);

    letters.forEach(sprite => {
      sprite.position.y += sprite.userData.speed;
      sprite.position.x += Math.sin(Date.now() * 0.001 + sprite.userData.yOffset) * 0.002;
      sprite.position.z += Math.cos(Date.now() * 0.001 + sprite.userData.yOffset) * 0.002;
    });
  }

  animate();

  launchListener = () => {
    letters.forEach(sprite => {
      sprite.userData.speed += 0.003; 
    });
  };
  window.addEventListener('click', launchListener);

  return result;
}
