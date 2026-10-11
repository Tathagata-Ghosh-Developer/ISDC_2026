"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { SHIRT } from "@/lib/merch";

/* ================================================================
   The official T-shirt, in 3D.

   Not a modelled shirt with a decal on it: the committee's own flat
   mockup, front and back, inflated into a soft garment. The print is
   mapped one to one from the Canva export, so every logo sits exactly
   where the designer put it and nothing is redrawn. The assets come
   from scripts/merch-assets.py; the grid it used is SHIRT in
   src/lib/merch.ts.
   ================================================================ */

const { nx: NX, ny: NY, hmax: HMAX, aspect: ASPECT } = SHIRT;
const BASE = "/media/merch/";
// /media is cached for a year as immutable; bump this when the script's
// output changes, or phones keep the old shirt.
const V = "?v=1";

/** Smootherstep, for turns that start and stop without a jolt. */
const ease = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

export default function ShirtViewer({
  onReady,
  onFail,
  still = false,
}: {
  onReady?: () => void;
  onFail?: () => void;
  /** No auto-rotation or bobbing: reduced motion, or a poster capture. */
  still?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const ready = useRef(onReady);
  const fail = useRef(onFail);
  useEffect(() => {
    ready.current = onReady;
    fail.current = onFail;
  });

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      fail.current?.();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Neutral keeps the print's colours honest: the reds and golds of
    // the logos should come out as the designer chose them.
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;touch-action:pan-y;cursor:grab";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    scene.add(new THREE.HemisphereLight(0xd8ecff, 0xf3e6c4, 0.9));
    const key = new THREE.DirectionalLight(0xfff3e0, 2.1);
    key.position.set(-2.5, 3, 4);
    const rim = new THREE.DirectionalLight(0xc6e0ff, 1.4);
    rim.position.set(3, 1.5, -3.5);
    scene.add(key, rim);

    const manager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(manager);
    const textures: THREE.Texture[] = [];
    const tex = (file: string, colour = true) => {
      const t = loader.load(BASE + file + V);
      if (colour) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      textures.push(t);
      return t;
    };
    const fabric = tex("fabric-normal.png", false);
    fabric.wrapS = fabric.wrapT = THREE.RepeatWrapping;
    fabric.repeat.set(26, 24);

    const material = (map: string, mask: string) =>
      new THREE.MeshPhysicalMaterial({
        map: tex(map),
        alphaMap: tex(mask, false),
        alphaTest: 0.5,
        alphaToCoverage: true,
        roughness: 0.84,
        metalness: 0,
        sheen: 0.55,
        sheenRoughness: 0.7,
        sheenColor: new THREE.Color("#8fb4d6"),
        normalMap: fabric,
        normalScale: new THREE.Vector2(0.22, 0.22),
      });
    const frontMat = material("front.jpg", "mask-front.png");
    const backMat = material("back.jpg", "mask-back.png");

    const shirt = new THREE.Group();
    scene.add(shirt);
    const geometries: THREE.BufferGeometry[] = [];

    function surface(h: Uint16Array, mirror: boolean) {
      const g = new THREE.PlaneGeometry(2, 2 * ASPECT, NX - 1, NY - 1);
      const pos = g.attributes.position;
      for (let j = 0; j < NY; j++) {
        for (let i = 0; i < NX; i++) {
          const src = j * NX + (mirror ? NX - 1 - i : i);
          pos.setZ(j * NX + i, (h[src] / 65535) * HMAX * 2);
        }
      }
      g.computeVertexNormals();
      geometries.push(g);
      return g;
    }

    let disposed = false;
    let heightsReady = false;
    let texturesReady = false;
    const announce = () => {
      if (heightsReady && texturesReady && !disposed) ready.current?.();
    };
    manager.onLoad = () => {
      texturesReady = true;
      announce();
    };
    manager.onError = () => fail.current?.();

    fetch(BASE + "shirt.bin" + V)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.arrayBuffer();
      })
      .then((buf) => {
        if (disposed) return;
        const h = new Uint16Array(buf);
        if (h.length !== NX * NY) throw new Error("height field size");
        const front = new THREE.Mesh(surface(h, false), frontMat);
        // The back is the same surface turned round, so its silhouette
        // is the front's mirrored and its print reads the right way.
        const back = new THREE.Mesh(surface(h, true), backMat);
        back.rotation.y = Math.PI;
        shirt.add(front, back);
        heightsReady = true;
        announce();
      })
      .catch(() => fail.current?.());

    // ---- size ----
    const fit = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const half = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      // the whole shirt, with room to turn and bob
      const byHeight = (2 * ASPECT * 1.32) / (2 * half);
      const byWidth = (2 * 1.22) / (2 * half * camera.aspect);
      camera.position.set(0, 0, Math.max(byHeight, byWidth));
      camera.updateProjectionMatrix();
    };
    const resize = new ResizeObserver(fit);
    resize.observe(el);
    fit();

    // ---- drag to turn ----
    let offset = 0;
    let dragX: number | null = null;
    let lastDrag = -Infinity;
    const canvas = renderer.domElement;
    const down = (e: PointerEvent) => {
      dragX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (dragX === null) return;
      offset += (e.clientX - dragX) * 0.012;
      dragX = e.clientX;
      lastDrag = performance.now();
    };
    const up = () => {
      dragX = null;
      canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    // ---- the float ----
    // Five seconds on each face, swaying, then a half turn. The clock
    // only runs while nobody is dragging, so the shirt picks up from
    // wherever it was left.
    let auto = 0;
    let last = performance.now();
    let frame = 0;
    let visible = true;
    const DWELL = 5;
    const TURN = 2.2;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const idle = dragX === null && now - lastDrag > 2500;
      if (!still && idle) auto += dt;
      const cycle = DWELL + TURN;
      const k = Math.floor(auto / cycle);
      const f = auto % cycle;
      const turn = f < DWELL ? 0 : ease((f - DWELL) / TURN);
      const t = now / 1000;
      const sway = still ? 0 : Math.sin(t * 0.8) * 0.28 * (1 - Math.sin(turn * Math.PI));
      shirt.rotation.y = (k + turn) * Math.PI + sway + offset;
      shirt.rotation.x = still ? 0 : Math.sin(t * 0.7) * 0.05;
      shirt.rotation.z = still ? 0 : Math.sin(t * 0.5) * 0.025;
      shirt.position.y = still ? 0 : Math.sin(t * 1.1) * 0.05;
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(tick);

    // Off screen or in a background tab, stop drawing.
    const seen = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    seen.observe(el);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      seen.disconnect();
      resize.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      geometries.forEach((g) => g.dispose());
      textures.forEach((t) => t.dispose());
      frontMat.dispose();
      backMat.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [still]);

  return (
    <div
      ref={host}
      className="absolute inset-0"
      role="img"
      aria-label="The official T-shirt in 3D, turning slowly. Drag to turn it."
    />
  );
}
