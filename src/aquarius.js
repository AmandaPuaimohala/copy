import * as THREE from 'three';

export function startAquarius(scene, camera) {
  const group = new THREE.Group();
  scene.add(group);

  let active = true;
  const letters = [];
  let launchListener;
  const clock = new THREE.Clock();

  function stopAquarius() {
    active = false;
    if (launchListener) window.removeEventListener('click', launchListener);
    letters.forEach(l => {
      l.material.map.dispose();
      l.material.dispose();
    });
    scene.remove(group);
  }

  const result = { stop: stopAquarius };
  const text = 'Aquarius Independence';
  const INSTANCES = 2;

  /* -------------------- Letter Sprite -------------------- */
  function createLetter(char, hue) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = `hsl(${hue}, 80%, 70%)`;
    ctx.font = '72px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.55, 0.55, 0.55);
    return sprite;
  }

  /* -------------------- Spawn Centered Text -------------------- */
  for (let j = 0; j < INSTANCES; j++) {
    [...text].forEach((char, i) => {
      if (char === ' ') return;

      const sprite = createLetter(char, 200 + i * 4 + j * 20);

      sprite.userData = {
        baseX: (i - text.length / 2) * 0.18,
        baseY: (Math.random() - 0.5) * 0.2,
        depth: j * 0.35,
        floatSeed: Math.random() * Math.PI * 2,
        launched: false,
        velocity: new THREE.Vector3()
      };

      group.add(sprite);
      letters.push(sprite);
    });
  }

  /* -------------------- Animate -------------------- */
  function animate() {
    if (!active) return;
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);

    letters.forEach((sprite, i) => {
      const d = sprite.userData;

      sprite.material.opacity = Math.min(sprite.material.opacity + 0.02, 1);

      if (!d.launched) {
        sprite.position
          .copy(camera.position)
          .add(forward.clone().multiplyScalar(2.2 + d.depth));

        sprite.position.x += d.baseX + Math.sin(t + d.floatSeed) * 0.04;
        sprite.position.y += d.baseY + Math.sin(t * 0.7 + i) * 0.06;
      } else {
        sprite.position.add(d.velocity);
        sprite.material.opacity *= 0.985;
      }

      sprite.lookAt(camera.position);
    });
  }

  animate();

  /* -------------------- Click = Liberation -------------------- */
  launchListener = () => {
    letters.forEach(sprite => {
      const dir = sprite.position
        .clone()
        .sub(camera.position)
        .normalize();

      sprite.userData.launched = true;
      sprite.userData.velocity = dir.multiplyScalar(0.06 + Math.random() * 0.04);
    });
  };

  window.addEventListener('click', launchListener);
  return result;
}
