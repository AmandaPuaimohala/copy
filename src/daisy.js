import * as THREE from 'three';

export function daisyEvent(scene) {
  /* ---------- AUDIO ---------- */
  const audio = new Audio('sounds/daisy dandelion.mp3');
  audio.loop = true;
  audio.play();

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(audio);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  /* ---------- GROUP ---------- */
  const group = new THREE.Group();
  group.position.set(5, 2, 13);
  scene.add(group);

  /* ---------- PARTICLE TEXTURE ---------- */
  function createCircleTexture(size = 64) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }
  const circleTex = createCircleTexture();

  /* ---------- BASE PARTICLES ---------- */
  const DEPTH_LAYERS = 20;
  const POINTS_PER_LAYER = 400;
  const WIDTH = 25;
  const HEIGHT = 7;

  const totalPoints = DEPTH_LAYERS * POINTS_PER_LAYER;
  const positions = new Float32Array(totalPoints * 3);
  const colors = new Float32Array(totalPoints * 3);

  let idx = 0;
  for (let z = 0; z < DEPTH_LAYERS; z++) {
    for (let x = 0; x < POINTS_PER_LAYER; x++) {
      positions[idx * 3] = (x / POINTS_PER_LAYER - 0.5) * WIDTH + (Math.random() - 0.5) * 1.2;
      positions[idx * 3 + 1] = (Math.random() - 0.5) * HEIGHT;
      positions[idx * 3 + 2] = -z * 0.8 + (Math.random() - 0.5) * 1.2;

      const hue = (x / POINTS_PER_LAYER + z / DEPTH_LAYERS) % 1;
      const col = new THREE.Color().setHSL(hue, 0.85, 0.6);
      colors[idx * 3] = col.r;
      colors[idx * 3 + 1] = col.g;
      colors[idx * 3 + 2] = col.b;

      idx++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.08,
    transparent: true,
    opacity: 0.85,
    map: circleTex,
    alphaTest: 0.01,
    sizeAttenuation: true,
  });

  const wave = new THREE.Points(geometry, material);
  group.add(wave);

  /* ---------- EXTRA PARTICLES ---------- */
  let extraParticles = [];
  const extraParticleMaterial = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    map: circleTex,
    alphaTest: 0.01,
    sizeAttenuation: true,
  });

  /* ---------- LIGHT ---------- */
  const light = new THREE.PointLight(0xffffff, 1.2, 50);
  light.position.set(0, 6, 6);
  scene.add(light);

  /* ---------- ANIMATION ---------- */
  let active = true;
  let stopping = false; // tornado phase
  let time = 0;
  let spawnRadius = WIDTH * 2.5; // expanding spawn area
  const maxExtraParticles = 25000; // fill screen
  const extraParticleSpeed = 0.002;

  function animate() {
    if (!active && !stopping) return;
    requestAnimationFrame(animate);
    time += 0.01;

    if (!stopping) {
      analyser.getByteFrequencyData(dataArray);
      const pos = geometry.attributes.position.array;
      const colorAttr = geometry.attributes.color.array;

      // ---- Animate base particles ----
      let i = 0;
      for (let z = 0; z < DEPTH_LAYERS; z++) {
        for (let x = 0; x < POINTS_PER_LAYER; x++) {
          const freq = dataArray[x % dataArray.length] / 255;
          const phase = x * 0.08 + z * 0.4 + pos[i * 3] * 0.05;

          const waveY = Math.sin(phase + time) * 1.5 + freq * HEIGHT * 1.2;
          pos[i * 3 + 1] += (waveY - pos[i * 3 + 1]) * 0.12;

          const hue = (x / POINTS_PER_LAYER + z / DEPTH_LAYERS + time * 0.02) % 1;
          const col = new THREE.Color().setHSL(hue, 0.85, 0.6);
          colorAttr[i * 3] = col.r;
          colorAttr[i * 3 + 1] = col.g;
          colorAttr[i * 3 + 2] = col.b;
          i++;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;

      // ---- Spawn extra particles gradually ----
      spawnRadius += 0.015;
      const spawnCount = Math.min(50, maxExtraParticles - extraParticles.length);
      for (let n = 0; n < spawnCount; n++) {
        const p = new THREE.Vector3(
          (Math.random() - 0.5) * spawnRadius * 2,
          (Math.random() - 0.5) * HEIGHT * 3,
          (Math.random() - 0.5) * spawnRadius * 2
        );
        extraParticles.push(p);
      }

      // ---- Smooth drift for extra particles ----
      extraParticles.forEach((p, idx) => {
        p.x += Math.sin(time * 0.5 + idx) * extraParticleSpeed;
        p.y += Math.cos(time * 0.3 + idx * 0.7) * extraParticleSpeed;
        p.z += Math.sin(time * 0.4 + idx * 1.1) * extraParticleSpeed;
      });

      if (extraParticles.length > 0) {
        const extraGeometry = new THREE.BufferGeometry().setFromPoints(extraParticles);
        extraGeometry.setAttribute(
          'color',
          new THREE.Float32BufferAttribute(
            extraParticles.map((_, i) => {
              const hue = (time * 0.01 + i / extraParticles.length) % 1;
              const col = new THREE.Color().setHSL(hue, 0.85, 0.6);
              return [col.r, col.g, col.b];
            }).flat(),
            3
          )
        );

        let extraPoints = group.getObjectByName('extra');
        if (!extraPoints) {
          extraPoints = new THREE.Points(extraGeometry, extraParticleMaterial);
          extraPoints.name = 'extra';
          group.add(extraPoints);
        } else {
          extraPoints.geometry.dispose();
          extraPoints.geometry = extraGeometry;
        }
      }
    }

    // ---- Rotate group ----
    group.rotation.y = Math.sin(time * 0.06) * 0.6;
    group.rotation.x = Math.sin(time * 0.03) * 0.35;
    group.rotation.z = Math.sin(time * 0.02) * 0.3;

    // ---- Light & material pulse ----
    light.intensity = 0.8 + (stopping ? 0 : freqAvg(dataArray) * 0.015);
    material.opacity = stopping ? Math.max(0, material.opacity - 0.02) : 0.75 + Math.sin(time * 0.25) * 0.05;
    extraParticleMaterial.opacity = stopping ? Math.max(0, extraParticleMaterial.opacity - 0.02) : 0.65 + Math.sin(time * 0.2) * 0.05;

    // ---- Tornado exit ----
    if (stopping) {
      const radius = 5;
      for (let i = 0; i < positions.length / 3; i++) {
        const angle = i * 0.1 + time * 2;
        positions[i * 3] = Math.cos(angle) * radius * (1 - i / positions.length);
        positions[i * 3 + 2] = Math.sin(angle) * radius * (1 - i / positions.length);
        positions[i * 3 + 1] += 0.1;
      }
      geometry.attributes.position.needsUpdate = true;

      extraParticles.forEach((p, idx) => {
        const angle = idx * 0.1 + time * 2;
        const r = 5 * (1 - idx / extraParticles.length);
        p.x = Math.cos(angle) * r;
        p.z = Math.sin(angle) * r;
        p.y += 0.1;
      });
      const extraPoints = group.getObjectByName('extra');
      if (extraPoints) extraPoints.geometry.attributes.position.needsUpdate = true;
    }
  }

  animate();

  /* ---------- STOP FUNCTION ---------- */
  return function stop() {
    stopping = true;
    audio.pause();
    audio.currentTime = 0;

    setTimeout(() => {
      scene.remove(group);
      scene.remove(light);
      geometry.dispose();
      material.dispose();
    }, 2500);
  };
}

/* ---------- UTILS ---------- */
function freqAvg(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  return sum / arr.length;
}
