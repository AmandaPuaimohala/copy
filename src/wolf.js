// wolfSpirits.js
import * as THREE from 'three';

export function startWolfSpirits(scene) {
  /* ================== State ================== */
  const group = new THREE.Group();
  let stopping = false;
  let outroProgress = 0;

  /* ================== Materials ================== */
  const heartMat = new THREE.PointsMaterial({
    color: 0xff4f79,
    size: 0.08,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  /* ================== Particles ================== */
  const HEART_COUNT = 3500;
  const positions = new Float32Array(HEART_COUNT * 3);
  const targets = new Float32Array(HEART_COUNT * 3);

  const scale = 23;

  for (let i = 0; i < HEART_COUNT; i++) {
    const t = Math.random() * Math.PI * 2;

    targets.set([
      0.16 * Math.pow(Math.sin(t), 3) * scale,
      (0.13 * Math.cos(t)
        - 0.05 * Math.cos(2 * t)
        - 0.02 * Math.cos(3 * t)
        - 0.01 * Math.cos(4 * t)) * scale,
      (Math.random() - 0.5)
    ], i * 3);

    positions.set([
      (Math.random() - 0.5) * 50,
      Math.random() * 20,
      (Math.random() - 0.5) * 50
    ], i * 3);
  }

  const heartGeo = new THREE.BufferGeometry();
  heartGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const heart = new THREE.Points(heartGeo, heartMat);
  heart.position.set(3, 8.5, 3);
  group.add(heart);
  scene.add(group);

  /* ================== Animation ================== */
  function animate() {
    const pos = heartGeo.attributes.position.array;

    for (let i = 0; i < HEART_COUNT; i++) {
      const ix = i * 3;

      if (!stopping) {
        // normal converge
        pos[ix]     += (targets[ix]     - pos[ix])     * 0.009;
        pos[ix + 1] += (targets[ix + 1] - pos[ix + 1]) * 0.01;
        pos[ix + 2] += (targets[ix + 2] - pos[ix + 2]) * 0.009;
      } else {
        // cinematic outro
        const angle = outroProgress * 0.1 + i * 0.002;
        pos[ix]     += Math.cos(angle) * 0.02;
        pos[ix + 1] += 0.05; // float upward
        pos[ix + 2] += Math.sin(angle) * 0.02;
      }
    }

    heartGeo.attributes.position.needsUpdate = true;
    heart.rotation.y += stopping ? 0.004 : 0.0015;

    if (stopping) {
      outroProgress += 0.02;
      heartMat.opacity = THREE.MathUtils.lerp(0.9, 0, outroProgress);

      if (outroProgress >= 1) {
        scene.remove(group);
        return;
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  /* ================== Stop ================== */
  return function stopWolfSpirits() {
    stopping = true;
  };
}
