"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/* ================================================================
   The official T-shirt as a real 3D garment.

   tee.glb is the committee's own artwork on a shirt sewn and draped
   in Blender's cloth solver (scripts/tee3d), so the print folds with
   the fabric. It carries its own six-second float: a slow sway, a
   hover, and sleeves and hem that trail the body. This plays it,
   lights it like the studio render, and lets a visitor turn it.
   ================================================================ */

const GLB = "/media/merch/tee.glb?v=2";

export default function ShirtViewer({
  onReady,
  onFail,
  still = false,
}: {
  onReady?: () => void;
  onFail?: () => void;
  /** Hold the first pose: reduced motion. */
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
    // The studio render used no tone curve, so the print's colours stay the designer's.
    renderer.toneMapping = THREE.NoToneMapping;
    const canvas = renderer.domElement;
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;touch-action:pan-y;cursor:grab";
    el.appendChild(canvas);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.22;

    // Three-point light, as in the render: key top left, fill right, rim behind.
    scene.add(new THREE.HemisphereLight(0xbcd6f2, 0x5f7a4a, 0.55));
    const key = new THREE.DirectionalLight(0xfff4e6, 2.2);
    key.position.set(-1.5, 1.3, 1.7);
    const fill = new THREE.DirectionalLight(0xf2f6ff, 0.7);
    fill.position.set(1.7, 0.15, 1.4);
    const rim = new THREE.DirectionalLight(0xeaf2ff, 2.0);
    rim.position.set(0.35, 1.0, -1.3);
    scene.add(key, fill, rim);

    const camera = new THREE.PerspectiveCamera(23.9, 1, 0.05, 20);
    const turn = new THREE.Group();
    scene.add(turn);

    let mixer: THREE.AnimationMixer | null = null;
    let disposed = false;
    let shirtSize = new THREE.Vector3(0.8, 0.8, 0.3);

    const fit = (size?: THREE.Vector3) => {
      if (size) shirtSize = size;
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const half = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const byHeight = (shirtSize.y * 1.3) / (2 * half);
      const byWidth = (shirtSize.x * 1.25) / (2 * half * camera.aspect);
      camera.position.set(0, 0.01, Math.max(byHeight, byWidth));
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };

    new GLTFLoader().load(
      GLB,
      (gltf) => {
        if (disposed) return;
        const root = gltf.scene;
        // Blender writes the cotton's sheen at full strength, not the 0.15
        // it rendered with; at full strength the blue washes out to grey.
        root.traverse((o) => {
          const mat = (o as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined;
          if (mat?.sheenColor) mat.sheenColor.setScalar(0.15);
        });
        // centre the shirt on the turntable
        const box = new THREE.Box3().setFromObject(root);
        root.position.sub(box.getCenter(new THREE.Vector3()));
        turn.add(root);
        fit(box.getSize(new THREE.Vector3()));
        if (gltf.animations.length) {
          mixer = new THREE.AnimationMixer(root);
          for (const clip of gltf.animations) {
            // Blender starts the clip one frame in; start it at zero so
            // the last pose meets the first with no held frame between.
            for (const track of clip.tracks) track.shift(-track.times[0]);
            clip.resetDuration();
            mixer.clipAction(clip).play();
          }
          mixer.update(0);
        }
        ready.current?.();
      },
      undefined,
      () => fail.current?.(),
    );

    const resize = new ResizeObserver(() => fit());
    resize.observe(el);
    fit();

    // drag to turn; the float keeps playing underneath
    let dragX: number | null = null;
    let velocity = 0;
    const down = (e: PointerEvent) => {
      dragX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (dragX === null) return;
      const dx = (e.clientX - dragX) * 0.01;
      turn.rotation.y += dx;
      velocity = dx;
      dragX = e.clientX;
    };
    const up = () => {
      dragX = null;
      canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    const clock = new THREE.Clock();
    let visible = true;
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible) return;
      if (mixer && !still) mixer.update(dt);
      if (dragX === null) {
        // let go: glide, then ease back to face the camera
        turn.rotation.y += velocity;
        velocity *= 0.92;
        if (Math.abs(velocity) < 1e-4) {
          const r = turn.rotation.y;
          turn.rotation.y += (Math.round(r / (2 * Math.PI)) * 2 * Math.PI - r) * 0.04;
        }
      }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(tick);
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
      mixer?.stopAllAction();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.geometry.dispose();
        for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
          for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
          mat.dispose();
        }
      });
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
      aria-label="The official T-shirt in 3D, floating and turning gently. Drag to turn it."
    />
  );
}
