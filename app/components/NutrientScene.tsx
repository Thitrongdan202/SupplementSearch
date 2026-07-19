"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const ORBIT_COLORS = [0x2e6b4f, 0xe76f51, 0xb38b35, 0x3857e8];

export default function NutrientScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !window.WebGLRenderingContext) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 9.4);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    root.rotation.set(-0.12, -0.3, -0.08);
    scene.add(root);

    const orbitGeometry = new THREE.TorusGeometry(2.25, 0.017, 5, 120);
    ORBIT_COLORS.forEach((color, index) => {
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: index === 3 ? 0.68 : 0.38,
      });
      const orbit = new THREE.Mesh(orbitGeometry, material);
      orbit.rotation.set(
        0.35 + index * 0.58,
        0.15 + index * 0.47,
        index * 0.34,
      );
      orbit.scale.setScalar(0.82 + index * 0.12);
      root.add(orbit);
    });

    const nodeGeometry = new THREE.IcosahedronGeometry(0.13, 1);
    const nodeMaterial = new THREE.MeshBasicMaterial({
      color: 0xf3f0e8,
      transparent: true,
      opacity: 0.92,
    });
    const nodes = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, 36);
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();

    for (let index = 0; index < 36; index += 1) {
      const ring = index % 4;
      const angle = (index / 36) * Math.PI * 8 + ring * 0.9;
      const radius = 1.65 + ring * 0.35;
      position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.08) * radius * 0.72,
        Math.sin(angle) * (0.6 + ring * 0.19),
      );
      const scale = 0.72 + ((index * 17) % 10) / 16;
      matrix.compose(
        position,
        new THREE.Quaternion(),
        new THREE.Vector3(scale, scale, scale),
      );
      nodes.setMatrixAt(index, matrix);
    }
    root.add(nodes);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.63, 32, 24),
      new THREE.MeshBasicMaterial({
        color: 0x151a18,
        transparent: true,
        opacity: 0.94,
      }),
    );
    root.add(core);

    const coreRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.82, 0.1, 12, 64),
      new THREE.MeshBasicMaterial({ color: 0xe6ff5c }),
    );
    coreRing.rotation.set(Math.PI / 2.7, 0.2, -0.45);
    root.add(coreRing);

    let pointerX = 0;
    let pointerY = 0;
    let frame = 0;
    let isVisible = true;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { rootMargin: "120px" },
    );
    visibilityObserver.observe(mount);

    const handlePointer = (event: PointerEvent) => {
      const bounds = mount.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.28;
      pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.18;
    };
    mount.addEventListener("pointermove", handlePointer, { passive: true });

    const render = () => {
      if (isVisible) {
        root.rotation.y +=
          (pointerX - root.rotation.y * 0.12) * 0.012 +
          (reducedMotion ? 0 : 0.0015);
        root.rotation.x +=
          (-pointerY - root.rotation.x * 0.08) * 0.012;
        coreRing.rotation.z += reducedMotion ? 0 : 0.003;
        renderer.render(scene, camera);
      }
      if (!reducedMotion) frame = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      visibilityObserver.disconnect();
      mount.removeEventListener("pointermove", handlePointer);
      orbitGeometry.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      coreRing.geometry.dispose();
      (coreRing.material as THREE.Material).dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const material = object.material;
          if (Array.isArray(material)) {
            material.forEach((item) => item.dispose());
          } else {
            material.dispose();
          }
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="nutrient-scene" ref={mountRef} aria-hidden="true" />;
}
