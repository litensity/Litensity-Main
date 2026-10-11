import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { makeFood, type FoodType } from "./models";

export interface SceneObject {
  type: FoodType;
  label: string;
  href?: string;
  /** Brand colour used for the rim light accent. */
  accent: string;
}

export interface SceneOptions {
  objects: SceneObject[];
  /** "hero" spreads several objects; "single" centres one larger object. */
  layout: "hero" | "single";
  onHover?: (label: string | null, x: number, y: number) => void;
  onSelect?: (href: string) => void;
}

const LAYOUTS: Record<number, [number, number, number, number][]> = {
  // x, y, z, scale
  1: [[0, 0, 0, 1.25]],
  2: [
    [-1.1, 0.35, 0, 0.95],
    [1.15, -0.45, -0.4, 0.95],
  ],
  3: [
    [-1.55, 0.85, -0.6, 0.78],
    [1.45, 0.45, -0.2, 0.86],
    [-0.15, -1.15, 0.3, 0.8],
  ],
};

/**
 * Builds a small, self-contained Three.js scene in `container`.
 * Returns a cleanup function that releases every GPU resource.
 */
export function createFoodScene(container: HTMLElement, options: SceneOptions): () => void {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "default" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 8.2);

  // Warm key + brand-coloured rim light.
  const key = new THREE.DirectionalLight("#fff1dc", 2.4);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(options.objects[0]?.accent ?? "#e0461b", 3);
  rim.position.set(-4, 2, -3);
  scene.add(rim);
  scene.add(new THREE.AmbientLight("#ffffff", 0.35));

  const stage = new THREE.Group();
  scene.add(stage);

  const items = options.objects.slice(0, 3).map((obj, i) => {
    const layout = options.layout === "single" ? LAYOUTS[1][0] : (LAYOUTS[options.objects.length] ?? LAYOUTS[3])[i];
    const holder = new THREE.Group();
    const model = makeFood(obj.type);
    holder.add(model);
    holder.position.set(layout[0], layout[1], layout[2]);
    holder.userData = { base: layout, obj, phase: i * 1.7, hover: 0, intro: 0, model };
    holder.scale.setScalar(0.001);
    stage.add(holder);
    return holder;
  });

  /* ---------------------------------------------------------- sizing */
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the composition inside narrow containers.
    camera.position.z = options.layout === "single" ? 8.4 : w / h < 0.9 ? 10.5 : 8.2;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  /* --------------------------------------------------------- pointer */
  const pointer = new THREE.Vector2(0, 0);
  const target = new THREE.Vector2(0, 0);
  const raycaster = new THREE.Raycaster();
  let hovered: THREE.Group | null = null;

  const onWindowMove = (e: PointerEvent) => {
    target.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  };
  const onMove = (e: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(items, true)[0];
    let next: THREE.Group | null = null;
    if (hit) {
      let o: THREE.Object3D | null = hit.object;
      while (o && !items.includes(o as THREE.Group)) o = o.parent;
      next = (o as THREE.Group) ?? null;
    }
    hovered = next;
    container.style.cursor = hovered?.userData.obj.href ? "pointer" : "";
    options.onHover?.(hovered ? hovered.userData.obj.label : null, e.clientX - rect.left, e.clientY - rect.top);
  };
  const onLeave = () => {
    hovered = null;
    container.style.cursor = "";
    options.onHover?.(null, 0, 0);
  };
  const onClick = () => {
    const href = hovered?.userData.obj.href;
    if (href) options.onSelect?.(href);
  };
  window.addEventListener("pointermove", onWindowMove, { passive: true });
  container.addEventListener("pointermove", onMove);
  container.addEventListener("pointerleave", onLeave);
  container.addEventListener("click", onClick);

  /* ---------------------------------------------------------- render */
  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(container);

  let frame = 0;
  const timer = new THREE.Timer();
  const tick = (timestamp: number) => {
    frame = requestAnimationFrame(tick);
    timer.update(timestamp);
    if (!visible || document.hidden) return;
    const t = timer.getElapsed();

    // Gentle parallax towards the cursor + a twist driven by scroll position.
    const rect = container.getBoundingClientRect();
    const scroll = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight));
    stage.rotation.y += (target.x * 0.35 - scroll * 0.5 - stage.rotation.y) * 0.05;
    stage.rotation.x += (target.y * 0.2 + scroll * 0.15 - stage.rotation.x) * 0.05;
    stage.position.y += (scroll * 0.6 - stage.position.y) * 0.05;

    for (const item of items) {
      const d = item.userData;
      // Springy entrance, staggered.
      const introT = Math.max(0, Math.min(1, (t - 0.15 - d.phase * 0.12) / 0.9));
      const back = 1 + 2.2 * Math.pow(introT - 1, 3) + 1.2 * Math.pow(introT - 1, 2);
      d.hover += ((hovered === item ? 1 : 0) - d.hover) * 0.12;
      item.scale.setScalar(d.base[3] * back * (1 + d.hover * 0.1));
      item.position.y = d.base[1] + Math.sin(t * 0.9 + d.phase) * 0.12;
      // Sway the holder; spin the food around its own axis.
      item.rotation.y = Math.sin(t * 0.5 + d.phase) * 0.35 + d.hover * 0.4;
      item.rotation.z = Math.sin(t * 0.6 + d.phase) * 0.1;
      const spinner = d.model.userData.spinner as THREE.Object3D;
      spinner.rotation[d.model.userData.axis as "y" | "z"] = t * 0.4 + d.phase;
    }
    renderer.render(scene, camera);
  };
  tick(performance.now());

  return () => {
    cancelAnimationFrame(frame);
    timer.dispose();
    ro.disconnect();
    io.disconnect();
    window.removeEventListener("pointermove", onWindowMove);
    container.removeEventListener("pointermove", onMove);
    container.removeEventListener("pointerleave", onLeave);
    container.removeEventListener("click", onClick);
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    envTexture.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
