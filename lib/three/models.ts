import * as THREE from "three";

/*
 * Procedural food models — generated from maths, no downloaded assets.
 * Each returns a Group centred at the origin, roughly 2.4 units across.
 */

export type FoodType = "chicken" | "waffle" | "donut";

/** Deterministic pseudo-random so models look the same on every load. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ------------------------------------------------------------------ Donut */
export function makeDonut(): THREE.Group {
  const group = new THREE.Group();
  const R = 1;
  const r = 0.44;
  const rand = rng(7);

  const dough = new THREE.TorusGeometry(R, r, 48, 120);
  // Slightly lumpy, hand-made dough.
  const pos = dough.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = 1 + 0.015 * Math.sin(v.x * 9) * Math.sin(v.y * 8) + 0.01 * Math.sin(v.z * 15);
    v.multiplyScalar(n);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  dough.computeVertexNormals();
  group.add(new THREE.Mesh(dough, new THREE.MeshPhysicalMaterial({ color: "#c88645", roughness: 0.62, sheen: 0.4, sheenColor: new THREE.Color("#f3c98b") })));

  // Icing: a slightly fatter torus whose lower vertices are pulled inside the dough,
  // leaving a wavy drip line.
  const icing = new THREE.TorusGeometry(R, r * 1.07, 64, 160);
  const ip = icing.attributes.position as THREE.BufferAttribute;
  const centre = new THREE.Vector3();
  for (let i = 0; i < ip.count; i++) {
    v.fromBufferAttribute(ip, i);
    const u = Math.atan2(v.y, v.x);
    centre.set(Math.cos(u) * R, Math.sin(u) * R, 0);
    const off = v.clone().sub(centre);
    const height = off.z / (r * 1.07);
    const edge = -0.25 + 0.16 * Math.sin(u * 7) + 0.08 * Math.sin(u * 13 + 1.3);
    // Smooth roll-off at the drip line (no jagged steps).
    const k = smooth(edge - 0.14, edge + 0.04, height);
    off.multiplyScalar(0.86 + 0.14 * k + 0.015 * smooth(edge, edge + 0.4, height));
    v.copy(centre).add(off);
    ip.setXYZ(i, v.x, v.y, v.z);
  }
  icing.computeVertexNormals();
  group.add(new THREE.Mesh(icing, new THREE.MeshPhysicalMaterial({ color: "#e8508a", roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.15 })));

  // Sprinkles.
  const count = 110;
  const sprinkle = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.022, 0.08, 3, 6), new THREE.MeshStandardMaterial({ roughness: 0.4 }), count);
  const palette = ["#fff4d6", "#ffcf3f", "#5ad1ff", "#7be07b", "#ffffff", "#ff7a3d"].map((c) => new THREE.Color(c));
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  for (let i = 0; i < count; i++) {
    const u = rand() * Math.PI * 2;
    const tube = 0.35 + rand() * 1.0; // angle around the tube, top half only
    const c = new THREE.Vector3(Math.cos(u) * R, Math.sin(u) * R, 0);
    const outward = new THREE.Vector3(Math.cos(u) * Math.cos(tube), Math.sin(u) * Math.cos(tube), Math.sin(tube));
    const p = c.clone().add(outward.clone().multiplyScalar(r * 1.1));
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize());
    m.compose(p, q, new THREE.Vector3(1, 1, 1));
    sprinkle.setMatrixAt(i, m);
    sprinkle.setColorAt(i, palette[i % palette.length]);
  }
  group.add(sprinkle);
  group.rotation.x = -0.75;
  return group;
}

/* ----------------------------------------------------------------- Waffle */
export function makeWaffle(): THREE.Group {
  const group = new THREE.Group();
  const radius = 1.15;
  const shape = new THREE.Shape();
  shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
  const cell = 0.25;
  const gap = 0.1;
  const step = cell + gap;
  for (let x = -3; x <= 3; x++) {
    for (let y = -3; y <= 3; y++) {
      const cx = x * step;
      const cy = y * step;
      if (Math.hypot(cx, cy) + cell * 0.75 > radius - 0.1) continue;
      const hole = new THREE.Path();
      const h = cell / 2;
      hole.moveTo(cx - h, cy - h);
      hole.lineTo(cx + h, cy - h);
      hole.lineTo(cx + h, cy + h);
      hole.lineTo(cx - h, cy + h);
      hole.closePath();
      shape.holes.push(hole);
    }
  }
  const golden = new THREE.MeshPhysicalMaterial({ color: "#c27526", roughness: 0.5, sheen: 0.6, sheenColor: new THREE.Color("#ffcf7a") });
  const grid = new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.035, bevelSegments: 3, curveSegments: 48 });
  grid.translate(0, 0, 0.02);
  group.add(new THREE.Mesh(grid, golden));
  const base = new THREE.CylinderGeometry(radius - 0.02, radius - 0.02, 0.12, 64);
  base.rotateX(Math.PI / 2);
  group.add(new THREE.Mesh(base, new THREE.MeshPhysicalMaterial({ color: "#8a4f1c", roughness: 0.7 })));

  // Chocolate drizzle.
  const rand = rng(3);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    pts.push(new THREE.Vector3(-0.95 + t * 1.9, (i % 2 ? 0.6 : -0.6) * (0.6 + rand() * 0.4), 0.27 + rand() * 0.03));
  }
  const drizzle = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 220, 0.04, 10, false);
  group.add(new THREE.Mesh(drizzle, new THREE.MeshPhysicalMaterial({ color: "#3a1c0f", roughness: 0.18, clearcoat: 1 })));

  // Strawberries.
  const berryGeo = new THREE.SphereGeometry(0.17, 24, 16);
  berryGeo.scale(1, 1.25, 1);
  const berry = new THREE.MeshPhysicalMaterial({ color: "#d5232f", roughness: 0.25, clearcoat: 0.8 });
  for (const [x, y] of [
    [0.35, 0.3],
    [-0.25, 0.45],
    [0.05, -0.35],
  ]) {
    const mesh = new THREE.Mesh(berryGeo, berry);
    mesh.position.set(x, y, 0.36);
    mesh.rotation.set(rand(), rand(), rand());
    group.add(mesh);
  }
  group.rotation.x = -0.45;
  return group;
}

/* ---------------------------------------------------------------- Chicken */
export function makeChicken(): THREE.Group {
  const group = new THREE.Group();
  const rand = rng(11);

  // Drumstick: a sphere reshaped into a bulb that tapers towards the bone, with crunchy crust noise.
  const meat = new THREE.SphereGeometry(1, 120, 90);
  const pos = meat.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const taper = 1 - 0.72 * smooth(-0.45, 1, v.y);
    v.x *= taper;
    v.z *= taper * 0.92;
    // Chunky, craggy fried crust: large lumps + mid ridges, very little fine noise.
    const crust =
      0.09 * Math.sin(v.x * 4.5 + v.y * 2.1) * Math.sin(v.z * 4 + v.y * 1.7) +
      0.06 * Math.abs(Math.sin(v.x * 9 + 1.2) * Math.sin(v.y * 8) * Math.sin(v.z * 9 + 2)) +
      0.025 * Math.sin(v.x * 17) * Math.sin(v.z * 15 + v.y * 6);
    const n = v.clone().normalize();
    v.addScaledVector(n, crust);
    v.y *= 1.45;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  meat.computeVertexNormals();
  const glaze = new THREE.MeshPhysicalMaterial({ color: "#b5561b", roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.35, sheen: 0.5, sheenColor: new THREE.Color("#ffb067") });
  group.add(new THREE.Mesh(meat, glaze));

  // Bone.
  const ivory = new THREE.MeshStandardMaterial({ color: "#efe4cc", roughness: 0.45 });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.9, 24), ivory);
  shaft.position.y = 1.55;
  group.add(shaft);
  for (const x of [-0.09, 0.09]) {
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 16), ivory);
    knob.position.set(x, 2.02, 0);
    group.add(knob);
  }

  // Sesame seeds on the glaze.
  const count = 70;
  const seedGeo = new THREE.SphereGeometry(0.035, 8, 6);
  seedGeo.scale(1, 0.45, 0.65);
  const seeds = new THREE.InstancedMesh(seedGeo, new THREE.MeshStandardMaterial({ color: "#f6ecd2", roughness: 0.5 }), count);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const ray = new THREE.Raycaster();
  const meatMesh = group.children[0] as THREE.Mesh;
  let placed = 0;
  for (let tries = 0; placed < count && tries < 600; tries++) {
    const dir = new THREE.Vector3(rand() - 0.5, (rand() - 0.65) * 1.6, rand() - 0.5).normalize();
    ray.set(dir.clone().multiplyScalar(4), dir.clone().negate());
    const hit = ray.intersectObject(meatMesh)[0];
    if (!hit?.face) continue;
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), hit.face.normal);
    m.compose(hit.point, q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * Math.PI)), new THREE.Vector3(1, 1, 1));
    seeds.setMatrixAt(placed++, m);
  }
  seeds.count = placed;
  group.add(seeds);

  group.scale.setScalar(0.72);
  group.position.y = -0.35;
  group.rotation.z = -0.55;
  const wrapper = new THREE.Group();
  wrapper.add(group);
  return wrapper;
}

/**
 * Wraps a model so flat foods (donut, waffle) spin around their own face — they
 * never turn edge-on — while the drumstick turns around its vertical axis.
 */
export function makeFood(type: FoodType): THREE.Group {
  const model = type === "chicken" ? makeChicken() : type === "waffle" ? makeWaffle() : makeDonut();
  const tilt = model.rotation.x;
  model.rotation.x = 0;
  const outer = new THREE.Group();
  outer.add(model);
  outer.rotation.x = tilt;
  outer.userData = { spinner: model, axis: type === "chicken" ? "y" : "z" };
  return outer;
}
