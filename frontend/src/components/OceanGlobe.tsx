import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { ArgoFloat } from '../data/mockOceanData';


interface OceanGlobeProps {
  variable: string;
  depth: number;
  timeIndex: number;
  selectedFloat: ArgoFloat | null;
  onSelectFloat: (float: ArgoFloat) => void;
  floats: ArgoFloat[];
  showCurrentVectors: boolean;
  verticalExaggeration: number;
  palette: string[];
}

export const OceanGlobe: React.FC<OceanGlobeProps> = ({
  variable,
  depth,
  timeIndex,
  selectedFloat,
  onSelectFloat,
  floats,
  showCurrentVectors,
  verticalExaggeration,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const oceanLayersGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const particlesGroupRef = useRef<THREE.Points | null>(null);


  // Standard equirectangular spherical coordinate projection for Three.js SphereGeometry:
  // In Three.js SphereGeometry:
  // u = 0..1 corresponds to lon -180..+180 (centered on Greenwich Prime Meridian at u = 0.5)
  // v = 0..1 corresponds to lat +90 (North Pole) down to -90 (South Pole)
  const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };


  // Convert Lon/Lat to Canvas UV coords
  const lonLatToUV = (lon: number, lat: number, w: number, h: number) => {
    const x = ((lon + 180) / 360) * w;
    const y = ((90 - lat) / 180) * h;
    return { x, y };
  };

  // Generate scientific colormapped ocean heat texture with distinct bathymetric contour bands
  const createScientificOceanTexture = (
    varType: string,
    layerDepth: number,
    tIdx: number
  ): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Clear baseline so continents and landmasses on Earth remain crisp and visible
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Depth attenuation factor (at 0m, full warm surface; at 2000m, dark cold deep abyssal water)
    const thermoclineFactor = Math.exp(-layerDepth / 350); // Sharp drop across thermocline (100-300m)


    const timeWave = Math.sin(tIdx * 0.5) * 12;

    // Helper to draw regional oceanographic fields
    const drawBasin = (
      lon: number,
      lat: number,
      rxDeg: number,
      ryDeg: number,
      colorStops: { stop: number; color: string }[]
    ) => {
      const uv = lonLatToUV(lon, lat, canvas.width, canvas.height);
      const rx = (rxDeg / 360) * canvas.width;
      const ry = (ryDeg / 180) * canvas.height;

      const grad = ctx.createRadialGradient(uv.x, uv.y, 4, uv.x, uv.y, Math.max(rx, ry));
      colorStops.forEach((cs) => grad.addColorStop(cs.stop, cs.color));

      ctx.save();
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(uv.x, uv.y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    if (varType === 'sst') {
      // SEA SURFACE / SUBSURFACE TEMPERATURE
      // Warm Arabian Sea Pool (Red -> Orange -> Yellow -> Green as depth increases)
      const surfaceAlpha = Math.max(0.35, thermoclineFactor);
      drawBasin(65 + timeWave * 0.1, 14, 22, 16, [
        { stop: 0.0, color: `rgba(239, 68, 68, ${0.95 * surfaceAlpha})` },    // Hot Red (30°C)
        { stop: 0.4, color: `rgba(245, 158, 11, ${0.9 * surfaceAlpha})` },    // Amber (27°C)
        { stop: 0.7, color: `rgba(16, 185, 129, ${0.75 * surfaceAlpha})` },   // Emerald (23°C)
        { stop: 0.9, color: `rgba(6, 182, 212, ${0.5 * surfaceAlpha})` },    // Cyan (18°C)
        { stop: 1.0, color: 'rgba(2, 11, 24, 0.0)' }
      ]);

      // Bay of Bengal Warm Layer
      drawBasin(88 - timeWave * 0.08, 13, 19, 15, [
        { stop: 0.0, color: `rgba(244, 63, 94, ${0.95 * surfaceAlpha})` },    // Rose Red (31°C)
        { stop: 0.45, color: `rgba(249, 115, 22, ${0.88 * surfaceAlpha})` },  // Orange
        { stop: 0.75, color: `rgba(16, 185, 129, ${0.7 * surfaceAlpha})` },   // Green
        { stop: 1.0, color: 'rgba(2, 11, 24, 0.0)' }
      ]);

      // Equatorial Current Belt
      drawBasin(76, -3, 38, 11, [
        { stop: 0.0, color: `rgba(245, 158, 11, ${0.85 * surfaceAlpha})` },
        { stop: 0.6, color: `rgba(6, 182, 212, ${0.65 * surfaceAlpha})` },
        { stop: 1.0, color: 'rgba(2, 11, 24, 0.0)' }
      ]);
    } else if (varType === 'salinity') {
      // SALINITY FIELD (High in Arabian Sea, Low in Bay of Bengal)
      // High salinity Arabian Sea (Purple / Deep Violet > 36.5 PSU)
      drawBasin(65, 15, 20, 15, [
        { stop: 0.0, color: 'rgba(168, 85, 247, 0.95)' }, // Purple high salinity
        { stop: 0.5, color: 'rgba(99, 102, 241, 0.85)' },
        { stop: 0.8, color: 'rgba(59, 130, 246, 0.6)' },
        { stop: 1.0, color: 'rgba(2, 11, 24, 0.0)' }
      ]);

      // Low salinity Bay of Bengal Ganga/Brahmaputra plume (< 32 PSU Green/Cyan)
      drawBasin(88, 18, 18, 14, [
        { stop: 0.0, color: 'rgba(34, 197, 94, 0.95)' },  // Bright Green low salinity
        { stop: 0.5, color: 'rgba(6, 182, 212, 0.85)' },
        { stop: 0.8, color: 'rgba(59, 130, 246, 0.55)' },
        { stop: 1.0, color: 'rgba(2, 11, 24, 0.0)' }
      ]);
    } else if (varType === 'currents') {
      // OCEAN CURRENTS / VELOCITY
      // Somali current jet & southwest monsoon circulation
      drawBasin(58, 10, 16, 14, [
        { stop: 0.0, color: 'rgba(244, 63, 94, 0.95)' },  // High velocity jet > 1.8 m/s
        { stop: 0.4, color: 'rgba(245, 158, 11, 0.88)' },
        { stop: 0.7, color: 'rgba(56, 189, 248, 0.65)' },
        { stop: 1.0, color: 'rgba(2, 11, 24, 0.0)' }
      ]);
      drawBasin(82, 8, 18, 12, [
        { stop: 0.0, color: 'rgba(245, 158, 11, 0.9)' },
        { stop: 0.6, color: 'rgba(56, 189, 248, 0.7)' },
        { stop: 1.0, color: 'rgba(2, 11, 24, 0.0)' }
      ]);
    } else if (varType === 'chlorophyll') {
      // CHLOROPHYLL-A / PFZ
      // Coastal upwelling along Kerala, Gujarat, and Oman
      drawBasin(74, 11, 8, 10, [
        { stop: 0.0, color: 'rgba(16, 185, 129, 0.98)' }, // Rich emerald chlorophyll
        { stop: 0.6, color: 'rgba(5, 150, 105, 0.7)' },
        { stop: 1.0, color: 'rgba(2, 11, 24, 0.0)' }
      ]);
      drawBasin(58, 18, 9, 8, [
        { stop: 0.0, color: 'rgba(16, 185, 129, 0.98)' },
        { stop: 0.6, color: 'rgba(5, 150, 105, 0.7)' },
        { stop: 1.0, color: 'rgba(2, 11, 24, 0.0)' }
      ]);
    } else {
      // SSH / STORM SURGE
      drawBasin(87, 16, 16, 14, [
        { stop: 0.0, color: 'rgba(239, 68, 68, 0.95)' },  // Surge peak (+0.4m)
        { stop: 0.5, color: 'rgba(245, 158, 11, 0.8)' },
        { stop: 0.8, color: 'rgba(59, 130, 246, 0.5)' },
        { stop: 1.0, color: 'rgba(2, 11, 24, 0.0)' }
      ]);
    }

    // 2. Draw sharp scientific isobath / contour lines across Indian Ocean
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const c = lonLatToUV(66 + i * 8, 12 + i * 2, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(c.x, c.y, 60 + i * 25, 0, Math.PI * 2);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup looking directly at Indian Ocean & Indian subcontinent
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 19);
    camera.lookAt(0, 0, 0);



    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8ee, 2.0);
    sunLight.position.set(20, 15, 25);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-20, -10, -20);
    scene.add(rimLight);

    // 5. Master Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const radius = 8;
    const sphereGeo = new THREE.SphereGeometry(radius, 64, 64);

    // Base NASA Earth Texture (High-Res)
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('/earth_atmos_2048.jpg');
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthMap,
      roughness: 0.7,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(sphereGeo, earthMat);
    globeGroup.add(earthMesh);

    // 6. Multi-Layer Volumetric Ocean Shells (The Key Depth-Slicing Feature from PPT Slide 2/3)
    // We create 3 stacked transparent volumetric depth shells: Surface (0m), Thermocline (200m), Deep Sea (1000m+)
    const oceanLayersGroup = new THREE.Group();
    globeGroup.add(oceanLayersGroup);
    oceanLayersGroupRef.current = oceanLayersGroup;

    // Active Slice Layer Mesh
    const activeSliceOffset = 0.08 + (verticalExaggeration * 0.04);
    const activeSliceGeo = new THREE.SphereGeometry(radius + activeSliceOffset, 64, 64);
    const activeSliceTex = createScientificOceanTexture(variable, depth, timeIndex);
    const activeSliceMat = new THREE.MeshStandardMaterial({
      map: activeSliceTex,
      transparent: true,
      opacity: 0.88,
      roughness: 0.2,
      metalness: 0.2,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const activeSliceMesh = new THREE.Mesh(activeSliceGeo, activeSliceMat);
    oceanLayersGroup.add(activeSliceMesh);

    // Secondary Reference Subsurface Shell (visible underneath to show 3D ocean volume)
    const subGeo = new THREE.SphereGeometry(radius + 0.03, 64, 64);
    const subTex = createScientificOceanTexture(variable, 800, timeIndex);
    const subMat = new THREE.MeshStandardMaterial({
      map: subTex,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const subMesh = new THREE.Mesh(subGeo, subMat);
    oceanLayersGroup.add(subMesh);

    // 7. 3D Water Column Volumetric Extrusion Prism (Focused on Indian Ocean EEZ Basin)
    // Renders physical 3D vertical depth pillars connecting surface to deep sea floor
    const columnGroup = new THREE.Group();
    const indLatsLons = [
      [15, 68], [12, 74], [8, 77], [12, 84], [16, 88], [6, 80], [10, 65]
    ];
    indLatsLons.forEach(([lat, lon]) => {
      const topPos = latLonToVector3(lat, lon, radius + activeSliceOffset);
      const bottomPos = latLonToVector3(lat, lon, radius);

      const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, activeSliceOffset, 8);
      const pillarMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.6
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.copy(topPos.clone().lerp(bottomPos, 0.5));
      pillar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), topPos.clone().normalize());
      columnGroup.add(pillar);
    });
    globeGroup.add(columnGroup);

    // 8. 3D Indian EEZ Boundary Ribbon
    const eezPointsLonLat: [number, number][] = [
      [68.5, 23.5], [66.5, 20.0], [68.0, 15.0], [71.5, 10.0], [74.0, 6.5],
      [77.0, 4.5], [80.0, 5.0], [83.5, 8.5], [87.0, 13.0], [89.0, 19.5],
      [93.5, 14.0], [94.5, 7.0], [92.5, 4.5], [87.5, 4.0], [81.0, 4.0],
      [75.0, 5.0], [67.0, 14.0], [68.5, 23.5]
    ];
    const eezVectors = eezPointsLonLat.map(([lon, lat]) =>
      latLonToVector3(lat, lon, radius + activeSliceOffset + 0.02)
    );
    const eezCurve = new THREE.CatmullRomCurve3(eezVectors, true);
    const eezGeo = new THREE.BufferGeometry().setFromPoints(eezCurve.getPoints(140));
    const eezMat = new THREE.LineBasicMaterial({
      color: 0xfbbf24, // Bright Gold EEZ Line
      linewidth: 3,
    });
    const eezLine = new THREE.Line(eezGeo, eezMat);
    globeGroup.add(eezLine);

    // 9. Atmospheric Halo Glow
    const atmosGeo = new THREE.SphereGeometry(radius * 1.035, 32, 32);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.2, 0.65, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);

    // 10. Ocean Currents Animated Streamlines
    const particleCount = 850;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleCoords: { lat: number; lon: number; speed: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const pLon = 50 + Math.random() * 46;
      const pLat = -15 + Math.random() * 37;
      const speed = 0.05 + Math.random() * 0.09;
      particleCoords.push({ lat: pLat, lon: pLon, speed });
      const vec = latLonToVector3(pLat, pLon, radius + activeSliceOffset + 0.04);
      particlePositions[i * 3] = vec.x;
      particlePositions[i * 3 + 1] = vec.y;
      particlePositions[i * 3 + 2] = vec.z;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.06,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particleSystem);

    particlesGroupRef.current = particleSystem;

    // 11. In-situ Floats Markers Group
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Center view directly onto Indian Ocean (Lon ~78°E, Lat ~15°N)
    const initialYRot = -((78 * Math.PI) / 180) - Math.PI / 2;
    globeGroup.rotation.y = initialYRot;
    globeGroup.rotation.x = -0.28; // Tilt Northern hemisphere down towards center of screen!



    // 12. Mouse Drag & Orbit Controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;
      globeGroup.rotation.x = Math.max(-1.1, Math.min(1.1, globeGroup.rotation.x));

      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.015;
      camera.position.z = Math.max(11, Math.min(38, camera.position.z));
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markersGroup.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.floatId && obj.parent) {
          obj = obj.parent;
        }
        if (obj?.userData?.floatId) {
          const matched = floats.find((f) => f.id === obj?.userData?.floatId);
          if (matched) onSelectFloat(matched);
        }
      }
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('click', handleClick);

    // 13. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Keep focus steady on Indian Ocean basin so user can clearly analyze layers


      // Animate current particle drift
      if (showCurrentVectors && particleSystem) {
        particleSystem.visible = true;
        const positions = particleSystem.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const p = particleCoords[i];
          p.lon += p.speed * 0.22;
          p.lat += Math.sin(p.lon * 0.12) * 0.06;
          if (p.lon > 98) p.lon = 50;
          if (p.lat > 24) p.lat = -15;

          const v = latLonToVector3(p.lat, p.lon, radius + activeSliceOffset + 0.04);
          positions[i * 3] = v.x;
          positions[i * 3 + 1] = v.y;
          positions[i * 3 + 2] = v.z;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
      } else if (particleSystem) {
        particleSystem.visible = false;
      }

      // Pulse selected marker pin
      markersGroup.children.forEach((child) => {
        if (child.userData?.isSelected) {
          const s = 1 + Math.sin(elapsedTime * 6) * 0.35;
          child.scale.set(s, s, s);
        } else {
          child.scale.set(1, 1, 1);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Dynamic Ocean Layer & Physical Height Offset when Depth/Variable changes
  useEffect(() => {
    if (oceanLayersGroupRef.current) {
      const activeMesh = oceanLayersGroupRef.current.children[0] as THREE.Mesh;
      if (activeMesh) {
        const newTex = createScientificOceanTexture(variable, depth, timeIndex);
        (activeMesh.material as THREE.MeshStandardMaterial).map = newTex;
        (activeMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;

        // Visually displace the layer shell according to chosen depth slice & exaggeration!
        // At 0m (Surface), elevated above seafloor; at 2000m, plunges down into deep sea floor
        const radius = 8;
        const depthHeightOffset = Math.max(0.02, 0.16 - (depth / 2000) * 0.14 * verticalExaggeration);
        activeMesh.scale.setScalar((radius + depthHeightOffset) / (radius + 0.08));
      }
    }
  }, [variable, depth, timeIndex, verticalExaggeration]);

  // Update In-Situ Sensor Markers
  useEffect(() => {
    if (!markersGroupRef.current) return;
    const group = markersGroupRef.current;

    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const radius = 8;
    const activeSliceOffset = 0.08 + (verticalExaggeration * 0.04);

    floats.forEach((f) => {
      const isSel = selectedFloat?.id === f.id;
      const pos = latLonToVector3(f.lat, f.lon, radius + activeSliceOffset + 0.05);

      const pinColor =
        f.platform === 'Argo' ? 0xf59e0b : f.platform === 'Glider' ? 0x10b981 : 0xec4899;

      const pinGroup = new THREE.Group();
      pinGroup.userData = { floatId: f.id, isSelected: isSel };

      // Sensor buoy sphere
      const headGeo = new THREE.SphereGeometry(isSel ? 0.32 : 0.22, 16, 16);
      const headMat = new THREE.MeshBasicMaterial({ color: isSel ? 0xef4444 : pinColor });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      headMesh.position.copy(pos);
      pinGroup.add(headMesh);

      // Sounding profile stem dipping down through the depth layers into the seabed
      const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      stemMesh.position.copy(pos.clone().multiplyScalar(0.97));
      pinGroup.add(stemMesh);

      group.add(pinGroup);
    });
  }, [floats, selectedFloat, verticalExaggeration]);

  return (
    <div className="relative w-full h-full select-none cursor-grab active:cursor-grabbing">
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating 3D Water Column Depth HUD */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-sky-500/40 text-xs shadow-2xl text-sky-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Active 3D Layer: <b className="text-white">{depth === 0 ? 'Sea Surface (0m)' : `Subsurface (-${depth}m)`}</b></span>
          <span className="text-slate-600">|</span>
          <span>Field: <b className="text-sky-400 capitalize">{variable.toUpperCase()}</b></span>
        </div>

        {/* Depth Stratification Badge */}
        <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-[11px] font-mono text-slate-300 flex items-center gap-2 max-w-fit">
          <span className="text-amber-400 font-bold">
            {depth <= 200 ? '● Epipelagic (Sunlight Zone)' : depth <= 1000 ? '● Mesopelagic (Twilight Zone)' : '● Bathypelagic (Midnight Zone)'}
          </span>
          <span className="text-slate-500">•</span>
          <span>Exaggeration: {verticalExaggeration}x</span>
        </div>
      </div>
    </div>
  );
};
