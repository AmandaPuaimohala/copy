import * as THREE from 'three';

export function startGhostEvent(scene, floatObjects = []) {
  const group = new THREE.Group();
  scene.add(group);

  let active = true;
  const orbs = [];
  const floatData = new Map();
  const originalPositions = new Map();
  const originalRotations = new Map();

  floatObjects.forEach(obj => {
    originalPositions.set(obj, obj.position.clone());
    originalRotations.set(obj, obj.rotation.clone());
    floatData.set(obj, {
      offsetX: Math.random() * Math.PI * 2,
      offsetY: Math.random() * Math.PI * 2,
      offsetZ: Math.random() * Math.PI * 2,
      speedX: 0.3 + Math.random() * 0.5,
      speedY: 0.5 + Math.random() * 0.7,
      speedZ: 0.2 + Math.random() * 0.4,
      ampX: 0.2 + Math.random() * 0.3,
      ampY: 0.3 + Math.random() * 0.5,
      ampZ: 0.2 + Math.random() * 0.3,
      rotSpeed: 0.01 + Math.random() * 0.02
    });
  });


  const texture = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(200,255,255,1)');
    gradient.addColorStop(1, 'rgba(200,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();

  
  const ORB_COUNT = 50;
  for (let i = 0; i < ORB_COUNT; i++) {
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: THREE.MathUtils.randFloat(0.4, 0.9),
      depthWrite: false
    });
    const orb = new THREE.Sprite(material);
    const size = THREE.MathUtils.randFloat(0.1, 0.6);
    orb.scale.set(size, size, size);
    orb.position.set(
      THREE.MathUtils.randFloat(-12, 12),
      THREE.MathUtils.randFloat(2, 8),
      THREE.MathUtils.randFloat(-12, 12)
    );
    orb.userData = {
      basePos: orb.position.clone(),
      speed: THREE.MathUtils.randFloat(0.2, 1.2),
      offset: Math.random() * Math.PI * 2
    };
    group.add(orb);
    orbs.push(orb);
  }

  let returning = false; 

  // ---------- ANIMATION ----------
  function animate() {
    requestAnimationFrame(animate);
    const t = performance.now() * 0.001;

    // Move orbs
    orbs.forEach(orb => {
      orb.position.y =
        orb.userData.basePos.y +
        Math.sin(t * orb.userData.speed + orb.userData.offset) * 0.5;
      orb.position.x =
        orb.userData.basePos.x +
        Math.cos(t * 0.4 + orb.userData.offset) * 0.4;
      orb.position.z =
        orb.userData.basePos.z +
        Math.sin(t * 0.3 + orb.userData.offset) * 0.4;
    });

    floatObjects.forEach(obj => {
      const data = floatData.get(obj);

      if (!returning) {
        obj.position.x =
          originalPositions.get(obj).x + Math.sin(t * data.speedX + data.offsetX) * data.ampX;
        obj.position.y =
          originalPositions.get(obj).y + Math.sin(t * data.speedY + data.offsetY) * data.ampY;
        obj.position.z =
          originalPositions.get(obj).z + Math.sin(t * data.speedZ + data.offsetZ) * data.ampZ;

        obj.rotation.x += data.rotSpeed;
        obj.rotation.y += data.rotSpeed * 0.5;
        obj.rotation.z += data.rotSpeed * 0.3;
      } else {

        obj.position.lerp(originalPositions.get(obj), 0.05);
        obj.rotation.x = THREE.MathUtils.lerp(obj.rotation.x, originalRotations.get(obj).x, 0.05);
        obj.rotation.y = THREE.MathUtils.lerp(obj.rotation.y, originalRotations.get(obj).y, 0.05);
        obj.rotation.z = THREE.MathUtils.lerp(obj.rotation.z, originalRotations.get(obj).z, 0.05);
      }
    });
  }

  animate();

  // ---------- STOP ----------
  function stopGhost() {
    returning = true;

    orbs.forEach(o => {
      o.material.dispose();
      group.remove(o);
    });
    texture.dispose();

    const checkReturn = () => {
      let done = true;
      floatObjects.forEach(obj => {
        if (!obj.position.equals(originalPositions.get(obj))) done = false;
      });
      if (done) {
        active = false;
        scene.remove(group);
      } else {
        requestAnimationFrame(checkReturn);
      }
    };
    checkReturn();
  }

  return { stop: stopGhost };
}
