import * as THREE from '../vendor/three.module.js';

export async function initScene() {
  const host = document.querySelector('#hero-art');
  const canvas = document.querySelector('#gallery-canvas');
  const toggle = document.querySelector('#motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'low-power'});
  } catch { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35,1,0.1,30);
  camera.position.set(0,0,8);
  const group = new THREE.Group();
  scene.add(group);
  scene.add(new THREE.AmbientLight(0xffffff,2));
  const light = new THREE.DirectionalLight(0xffffff,3);
  light.position.set(-3,4,5);
  scene.add(light);

  // Physical image cards turn the actual portfolio into a small floating exhibition.
  const loader = new THREE.TextureLoader();
  const definitions = [
    {file:'gotland-identity.webp', w:1.68,h:2.69,x:-.94,y:.55,z:.15,rz:-.18,ry:.18},
    {file:'edge-riders-identity.webp',w:2.00,h:1.50,x:1.05,y:1.23,z:-.35,rz:.16,ry:-.18},
    {file:'abergs-packaging.webp',w:2.95,h:1.66,x:.6,y:-.89,z:.7,rz:.11,ry:-.12},
    {file:'arrcc-identity.webp',w:1.6,h:1.067,x:-1.15,y:-1.46,z:-.45,rz:-.13,ry:.1}
  ];
  const cards = [];
  const disposable = [];
  const results = await Promise.allSettled(definitions.map(async (item, index) => {
    const texture = await loader.loadAsync(new URL(`../assets/work/${item.file}`,import.meta.url).href);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(),4);
    const card = new THREE.Group();
    const boardGeometry = new THREE.BoxGeometry(item.w+.018,item.h+.018,.035);
    const boardMaterial = new THREE.MeshStandardMaterial({color:0xfafaf5,roughness:.8});
    const board = new THREE.Mesh(boardGeometry,boardMaterial);
    card.add(board);
    const faceGeometry = new THREE.PlaneGeometry(item.w,item.h);
    const faceMaterial = new THREE.MeshBasicMaterial({map:texture});
    const face = new THREE.Mesh(faceGeometry,faceMaterial);
    face.position.z=.022;
    card.add(face);
    // A restrained offset shadow preserves the graphic, paper-like character.
    const shadowMaterial = new THREE.MeshBasicMaterial({color:0x334030,transparent:true,opacity:.09,depthWrite:false});
    const shadow = new THREE.Mesh(faceGeometry,shadowMaterial);
    shadow.position.set(.06,-.09,-.075);
    card.add(shadow);
    card.position.set(item.x,item.y,item.z);
    card.rotation.set(.02,item.ry,item.rz);
    card.userData = {...item, phase:index*1.9};
    cards.push(card);
    group.add(card);
    disposable.push(texture,boardGeometry,boardMaterial,faceGeometry,faceMaterial,shadowMaterial);
  }));
  if (results.some(result => result.status === 'rejected')) {
    disposable.forEach(item => item.dispose());
    renderer.dispose();
    return;
  }
  const ringGeometry = new THREE.RingGeometry(2.02,2.025,100);
  const ringMaterial = new THREE.MeshBasicMaterial({color:0xbec6b4,side:THREE.DoubleSide,transparent:true,opacity:.75});
  const ring = new THREE.Mesh(ringGeometry,ringMaterial);
  ring.position.z=-1.1;
  group.add(ring);
  disposable.push(ringGeometry,ringMaterial);
  const pointer = new THREE.Vector2();
  let paused = reduced.matches;
  let visible = true;
  let modalOpen = false;
  let frame = 0;
  let elapsed = 0;
  let lastTime = 0;
  let disposed = false;
  const running = () => !paused && visible && !document.hidden && !modalOpen && !disposed;
  function render() {renderer.render(scene,camera);}
  function animate(now) {
    frame = 0;
    if (!running()) {lastTime=0;return;}
    const delta = lastTime ? Math.min((now-lastTime)/1000,.05) : 0;
    lastTime=now;
    elapsed += delta;
    group.rotation.y += (pointer.x*.09-group.rotation.y)*.035;
    group.rotation.x += (-pointer.y*.06-group.rotation.x)*.035;
    cards.forEach(card => {
      const item=card.userData;
      card.position.y=item.y+Math.sin(elapsed*.46+item.phase)*.075;
      card.rotation.z=item.rz+Math.sin(elapsed*.3+item.phase)*.025;
    });
    render();
    frame=requestAnimationFrame(animate);
  }
  function sync() {
    toggle.textContent=paused?'Play motion':'Pause motion';
    toggle.setAttribute('aria-pressed',String(paused));
    if (running() && !frame) frame=requestAnimationFrame(animate);
    else if (!running() && frame) {cancelAnimationFrame(frame);frame=0;lastTime=0;}
  }
  function resize() {
    const width=host.clientWidth;
    const height=host.clientHeight;
    if (!width || !height || disposed) return;
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    camera.position.z=Math.max(8,5.2/camera.aspect/ (2*Math.tan(THREE.MathUtils.degToRad(17.5))));
    camera.updateProjectionMatrix();
    render();
  }
  const resizeObserver=new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersection=new IntersectionObserver(entries => {visible=entries[0].isIntersecting;sync();},{threshold:0});
  intersection.observe(host);
  const onPointer=event => {
    if (paused || event.pointerType === 'touch') return;
    const rect=host.getBoundingClientRect();
    pointer.set((event.clientX-rect.left)/rect.width*2-1,(event.clientY-rect.top)/rect.height*2-1);
  };
  const onLeave=()=>pointer.set(0,0);
  const onToggle=()=>{paused=!paused;sync();};
  const onReduced=()=>{paused=reduced.matches;pointer.set(0,0);sync();};
  const onDialog=event=>{modalOpen=event.detail;sync();};
  host.addEventListener('pointermove',onPointer);
  host.addEventListener('pointerleave',onLeave);
  toggle.addEventListener('click',onToggle);
  reduced.addEventListener('change',onReduced);
  document.addEventListener('visibilitychange',sync);
  document.addEventListener('portfolio-dialog',onDialog);
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();
    disposed=true;
    if(frame) cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersection.disconnect();
    host.classList.remove('scene-ready');
    toggle.hidden=true;
  });
  resize();
  host.classList.add('scene-ready');
  toggle.hidden=false;
  sync();
  window.addEventListener('pagehide',event=>{
    if(event.persisted) return;
    disposed=true;
    if(frame) cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersection.disconnect();
    disposable.forEach(item=>item.dispose());
    renderer.dispose();
  },{once:true});
}
