// wolfSpirits.js
import * as THREE from 'three';

export function startWolfSpirits(scene) {
  /* ================== State ================== */
  const group = new THREE.Group();
  let stopped = false;

  /* ================== Materials ================== */
  const heartMat = new THREE.PointsMaterial({
    color: 0xff4f79,
    size: 0.08,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  /* ================== Heart Particles ================== */
  const HEART_COUNT = 3000;
  const positions = new Float32Array(HEART_COUNT * 3);
  const targets = new Float32Array(HEART_COUNT * 3);

  const scale = 23;
  const squashX = 1;
  const squashY = 0.9;
  const depth = 1;

  for (let i = 0; i < HEART_COUNT; i++) {
    const t = Math.random() * Math.PI * 2;

    const x = 0.16 * Math.pow(Math.sin(t), 3) * scale * squashX;
    const y =
      (0.13 * Math.cos(t) -
        0.05 * Math.cos(2 * t) -
        0.02 * Math.cos(3 * t) -
        0.01 * Math.cos(4 * t)) *
      scale *
      squashY;
    const z = (Math.random() - 0.5) * depth;

    targets.set([x, y, z], i * 3);

    positions.set(
      [
        (Math.random() - 0.5) * 50,
        Math.random() * 20,
        (Math.random() - 0.5) * 50
      ],
      i * 3
    );
  }

  const heartGeo = new THREE.BufferGeometry();
  heartGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const heart = new THREE.Points(heartGeo, heartMat);
  heart.position.set(3, 8.5, 3);
  group.add(heart);

  scene.add(group);

  /* ================== Animation ================== */
  function animate() {
    if (stopped) return;

    const pos = heartGeo.attributes.position.array;
    for (let i = 0; i < HEART_COUNT; i++) {
      pos[i * 3] += (targets[i * 3] - pos[i * 3]) * 0.005;
      pos[i * 3 + 1] += (targets[i * 3 + 1] - pos[i * 3 + 1]) * 0.005;
      pos[i * 3 + 2] += (targets[i * 3 + 2] - pos[i * 3 + 2]) * 0.005;
    }
    heartGeo.attributes.position.needsUpdate = true;

    heart.rotation.y += 0.0015;

    requestAnimationFrame(animate);
  }

  animate();

  /* ================== Cleanup ================== */
  return function stopWolfSpirits() {
    stopped = true;
    scene.remove(group);
  };
}
