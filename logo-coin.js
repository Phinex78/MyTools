import * as THREE from './three.module.min.js';

export async function createLogoCoin(host, onDismiss = () => {}) {
  const icon = document.querySelector('#brand-logo i');
  const font = getComputedStyle(icon, '::before').fontFamily;
  await document.fonts.load(`160px ${font}`);
  const glyph = getComputedStyle(icon, '::before').content.replace(/^["']|["']$/g, '');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.replaceChildren(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
  const coin = new THREE.Group();
  coin.rotation.set(.16, -.25, Math.PI / 2 - .1);
  scene.add(coin);

  const environment = document.createElement('canvas');
  environment.width = 1024;
  environment.height = 512;
  const environmentContext = environment.getContext('2d');
  const lighting = environmentContext.createLinearGradient(0, 0, 0, 512);
  lighting.addColorStop(0, '#d7e9ef');
  lighting.addColorStop(.45, '#687e82');
  lighting.addColorStop(.6, '#293c3b');
  lighting.addColorStop(1, '#a39265');
  environmentContext.fillStyle = lighting;
  environmentContext.fillRect(0, 0, 1024, 512);
  environmentContext.fillStyle = '#ffffff';
  environmentContext.fillRect(120, 80, 120, 240);
  environmentContext.fillRect(750, 40, 60, 300);
  const environmentTexture = new THREE.CanvasTexture(environment);
  environmentTexture.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(environmentTexture).texture;
  environmentTexture.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xe4f6ff, 0x746044, 2));
  const keyLight = new THREE.DirectionalLight(0xffedc4, 4);
  keyLight.position.set(-3, 4, 5);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xbde7ef, 2);
  fillLight.position.set(3, -1, -3);
  scene.add(fillLight);

  const face = document.createElement('canvas');
  face.width = 1024;
  face.height = 1024;
  const context = face.getContext('2d');
  context.fillStyle = '#1b4142';
  context.fillRect(0, 0, 1024, 1024);
  context.strokeStyle = '#e8cb83';
  context.lineWidth = 12;
  context.beginPath();
  context.arc(512, 512, 459, 0, Math.PI * 2);
  context.stroke();
  context.lineWidth = 3;
  context.beginPath();
  context.arc(512, 512, 421, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = '#ffe5a0';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `440px ${font}`;
  context.fillText(glyph === 'none' ? '' : glyph, 512, 450);
  context.font = 'bold 68px sans-serif';
  context.fillText('Sol Blade', 512, 730);
  context.font = '36px sans-serif';
  context.fillText('LA MASSICOTERIE · 78', 512, 805);
  const texture = new THREE.CanvasTexture(face);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  const metal = new THREE.MeshStandardMaterial({ color: 0xd7b86b, metalness: .88, roughness: .28 });
  const faceMaterial = new THREE.MeshStandardMaterial({ map: texture, metalness: .55, roughness: .36 });
  const bodyGeometry = new THREE.CylinderGeometry(1, 1, .15, 128);
  bodyGeometry.rotateX(Math.PI / 2);
  coin.add(new THREE.Mesh(bodyGeometry, [metal, faceMaterial, faceMaterial]));
  const rimGeometry = new THREE.TorusGeometry(.96, .018, 12, 128);
  for (const depth of [-.082, .082]) {
    const rim = new THREE.Mesh(rimGeometry, metal);
    rim.position.z = depth;
    coin.add(rim);
  }
  const ridges = new THREE.InstancedMesh(new THREE.BoxGeometry(.012, .028, .14), metal, 96);
  const transform = new THREE.Object3D();
  for (let index = 0; index < 96; index++) {
    const angle = index / 96 * Math.PI * 2;
    transform.position.set(Math.cos(angle) * 1.002, Math.sin(angle) * 1.002, 0);
    transform.rotation.z = angle;
    transform.updateMatrix();
    ridges.setMatrixAt(index, transform.matrix);
  }
  coin.add(ridges);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const angularVelocity = new THREE.Vector3(0, reduced.matches ? 0 : 1.7, 0);
  const rotationAxis = new THREE.Vector3();
  const rotationStep = new THREE.Quaternion();
  const rotate = (horizontal, vertical) => {
    rotationAxis.set(vertical, horizontal, 0);
    const angle = rotationAxis.length();
    if (!angle) return;
    rotationStep.setFromAxisAngle(rotationAxis.normalize(), angle);
    coin.quaternion.premultiply(rotationStep);
  };
  const recordMovement = (gesture, event) => {
    gesture.samples.push({ horizontal: event.clientX, vertical: event.clientY, time: event.timeStamp });
    while (gesture.samples.length > 1 && gesture.samples[0].time < event.timeStamp - 100) gesture.samples.shift();
  };
  let frame = null;
  let running = false;
  let previousTime = 0;
  let drag = null;
  let outsidePress = null;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const hitsCoin = event => {
    const bounds = host.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    coin.updateMatrixWorld(true);
    return raycaster.intersectObject(coin, true).length > 0;
  };
  const render = () => renderer.render(scene, camera);
  const resize = () => {
    const bounds = host.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    renderer.setSize(bounds.width, bounds.height, false);
    camera.aspect = bounds.width / bounds.height;
    camera.position.z = 1.4 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / Math.min(camera.aspect, 1);
    camera.updateProjectionMatrix();
    render();
  };
  const animate = time => {
    if (!running || document.hidden) { frame = null; previousTime = 0; return; }
    const elapsed = previousTime ? Math.min((time - previousTime) / 1000, .05) : 0;
    previousTime = time;
    if (!drag) {
      const friction = reduced.matches ? 4 : .65;
      const decay = Math.exp(-elapsed * friction);
      const travel = (1 - decay) / friction;
      rotate(angularVelocity.y * travel, angularVelocity.x * travel);
      angularVelocity.multiplyScalar(decay);
      if (angularVelocity.lengthSq() < .000064) angularVelocity.set(0, 0, 0);
    }
    render();
    frame = requestAnimationFrame(animate);
  };
  const resume = () => {
    if (running && !document.hidden && frame === null) frame = requestAnimationFrame(animate);
  };
  const spin = () => { angularVelocity.set(0, 11, 0); resume(); };
  host.addEventListener('pointerdown', event => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    if (!hitsCoin(event)) {
      outsidePress = { id: event.pointerId, horizontal: event.clientX, vertical: event.clientY, moved: false };
      return;
    }
    outsidePress = null;
    host.focus({ preventScroll: true });
    host.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, horizontal: event.clientX, vertical: event.clientY, distance: 0, samples: [] };
    recordMovement(drag, event);
    angularVelocity.set(0, 0, 0);
  });
  host.addEventListener('pointermove', event => {
    if (outsidePress && outsidePress.id === event.pointerId && Math.hypot(event.clientX - outsidePress.horizontal, event.clientY - outsidePress.vertical) > 6) outsidePress.moved = true;
    if (!drag || drag.id !== event.pointerId) return;
    const horizontal = event.clientX - drag.horizontal;
    const vertical = event.clientY - drag.vertical;
    rotate(horizontal * .012, vertical * .008);
    drag.horizontal = event.clientX;
    drag.vertical = event.clientY;
    drag.distance += Math.abs(horizontal) + Math.abs(vertical);
    recordMovement(drag, event);
    render();
  });
  const release = event => {
    if (outsidePress && outsidePress.id === event.pointerId) {
      const dismiss = event.type === 'pointerup' && !outsidePress.moved && !hitsCoin(event);
      outsidePress = null;
      if (dismiss) onDismiss();
      return;
    }
    if (!drag || drag.id !== event.pointerId) return;
    const gesture = drag;
    recordMovement(gesture, event);
    const tap = gesture.distance < 6;
    drag = null;
    if (event.type === 'pointercancel') angularVelocity.set(0, 0, 0);
    else if (tap) spin();
    else if (!reduced.matches && gesture.samples.length > 1) {
      const first = gesture.samples[0];
      const elapsed = Math.max((event.timeStamp - first.time) / 1000, .008);
      angularVelocity.set((event.clientY - first.vertical) * .008 / elapsed, (event.clientX - first.horizontal) * .012 / elapsed, 0);
      if (angularVelocity.length() > 24) angularVelocity.setLength(24);
    } else angularVelocity.set(0, 0, 0);
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
    resume();
  };
  host.addEventListener('pointerup', release);
  host.addEventListener('pointercancel', release);
  host.addEventListener('lostpointercapture', () => {
    if (drag) { drag = null; angularVelocity.set(0, 0, 0); }
  });
  host.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', ' '].includes(event.key)) return;
    event.preventDefault();
    if (event.key === ' ') spin();
    else if (event.key === 'Home') { coin.rotation.set(.16, -.25, Math.PI / 2 - .1); angularVelocity.set(0, 0, 0); }
    else {
      angularVelocity.set(0, 0, 0);
      if (event.key === 'ArrowLeft') rotate(-.3, 0);
      if (event.key === 'ArrowRight') rotate(.3, 0);
      if (event.key === 'ArrowUp') rotate(0, -.2);
      if (event.key === 'ArrowDown') rotate(0, .2);
    }
    render();
  });
  new ResizeObserver(resize).observe(host);
  document.addEventListener('visibilitychange', resume);
  reduced.addEventListener('change', () => { if (reduced.matches) angularVelocity.set(0, 0, 0); });
  return {
    start() { running = true; previousTime = 0; resize(); resume(); },
    stop() { running = false; cancelAnimationFrame(frame); frame = null; previousTime = 0; drag = null; outsidePress = null; angularVelocity.set(0, 0, 0); },
    spin
  };
}