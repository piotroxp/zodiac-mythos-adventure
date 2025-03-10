
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ZodiacProfile, GameState } from "@/types/zodiac";

interface ThreeSceneProps {
  profile: ZodiacProfile;
  gameState: GameState;
}

export default function ThreeScene({ profile, gameState }: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const characterRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const godsRef = useRef<THREE.Group[]>([]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0f2fe); // Light blue sky
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);
    cameraRef.current = camera;

    // Create controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Create lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Setup day/night cycle
    updateDayNightCycle(gameState.dayNightCycle);

    // Add Olympus terrain
    createOlympusTerrain();

    // Add character based on zodiac
    createCharacter();

    // Add Greek gods
    createGreekGods();

    // Animation loop
    const animate = () => {
      const delta = clockRef.current.getDelta();
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Animate character if it exists
      if (characterRef.current) {
        characterRef.current.rotation.y += delta * 0.5;
      }

      // Animate gods walking around
      animateGreekGods(delta);

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update scene when gameState changes
  useEffect(() => {
    if (!sceneRef.current) return;
    
    updateDayNightCycle(gameState.dayNightCycle);
  }, [gameState.dayNightCycle]);

  // Helper function to create Greek gods
  const createGreekGods = () => {
    if (!sceneRef.current) return;

    // Define gods with their colors and names
    const gods = [
      { name: "Zeus", color: 0xffd700, position: [5, 0, 0], scale: 1.2 },      // Gold
      { name: "Poseidon", color: 0x1e90ff, position: [-5, 0, 0], scale: 1.1 },  // Deep blue
      { name: "Athena", color: 0x808080, position: [0, 0, 5], scale: 1.0 },     // Gray (wisdom)
      { name: "Apollo", color: 0xffa500, position: [4, 0, 4], scale: 1.05 },    // Orange (sun)
      { name: "Artemis", color: 0x98fb98, position: [-4, 0, -4], scale: 0.95 }, // Light green
      { name: "Hermes", color: 0xb0c4de, position: [-3, 0, 3], scale: 0.9 }     // Light steel blue
    ];

    gods.forEach(god => {
      const godGroup = createGod(god.name, god.color, god.scale);
      godGroup.position.set(god.position[0], god.position[1], god.position[2]);
      sceneRef.current?.add(godGroup);
      
      // Add to refs array for animation
      godsRef.current.push(godGroup);
      
      // Add name label above god
      addGodLabel(godGroup, god.name);
    });
  };
  
  // Helper function to create a single god
  const createGod = (name: string, color: number, scale: number): THREE.Group => {
    const god = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: color,
      metalness: 0.3,
      roughness: 0.6
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    god.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffe0bd, // Skin tone
      roughness: 0.8
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.1;
    head.castShadow = true;
    god.add(head);
    
    // Robe/Toga
    const robeGeometry = new THREE.CylinderGeometry(0.6, 0.8, 1.5, 8);
    const robeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7
    });
    const robe = new THREE.Mesh(robeGeometry, robeMaterial);
    robe.position.y = 0.6;
    robe.castShadow = true;
    god.add(robe);
    
    // Add godly aura (particles)
    const auraGroup = new THREE.Group();
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.7
        })
      );
      
      // Position particles in a sphere around the god
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 0.8 + Math.random() * 0.4;
      
      particle.position.x = radius * Math.sin(theta) * Math.cos(phi);
      particle.position.y = 1.5 + Math.random() * 1;
      particle.position.z = radius * Math.sin(theta) * Math.sin(phi);
      
      // Store initial position for animation
      particle.userData = {
        initialPosition: particle.position.clone(),
        speed: 0.01 + Math.random() * 0.03,
        amplitude: 0.1 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2
      };
      
      auraGroup.add(particle);
    }
    
    god.add(auraGroup);
    
    // Scale god
    god.scale.set(scale, scale, scale);
    
    // Add god-specific attribute
    if (name === "Zeus") {
      // Add lightning bolt
      const boltGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 5, 1, false);
      const boltMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const bolt = new THREE.Mesh(boltGeometry, boltMaterial);
      bolt.rotation.z = Math.PI / 4;
      bolt.position.set(0.5, 1.5, 0);
      god.add(bolt);
    } else if (name === "Poseidon") {
      // Add trident
      const tridentGroup = new THREE.Group();
      
      // Staff
      const staffGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
      const staffMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const staff = new THREE.Mesh(staffGeometry, staffMaterial);
      tridentGroup.add(staff);
      
      // Prongs
      for (let i = -1; i <= 1; i++) {
        const prongGeometry = new THREE.CylinderGeometry(0.03, 0.01, 0.5, 8);
        const prong = new THREE.Mesh(prongGeometry, staffMaterial);
        prong.position.set(i * 0.1, 1.1, 0);
        tridentGroup.add(prong);
      }
      
      tridentGroup.position.set(0.5, 0.8, 0);
      tridentGroup.rotation.z = Math.PI * 0.1;
      god.add(tridentGroup);
    } else if (name === "Athena") {
      // Add shield
      const shieldGeometry = new THREE.CircleGeometry(0.3, 16);
      const shieldMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xb87333,
        metalness: 0.5,
        roughness: 0.3
      });
      const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
      shield.position.set(-0.5, 1.2, 0.1);
      shield.rotation.y = Math.PI * 0.1;
      god.add(shield);
    }
    
    // Setup god movement pattern
    god.userData = {
      moveSpeed: 0.3 + Math.random() * 0.3,
      rotateSpeed: 0.2 + Math.random() * 0.3,
      targetPosition: new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        0,
        (Math.random() - 0.5) * 10
      ),
      waitTime: 0,
      maxWaitTime: 2 + Math.random() * 3
    };
    
    return god;
  };
  
  // Add text label above god
  const addGodLabel = (god: THREE.Group, name: string) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    
    canvas.width = 128;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.font = '24px serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(name, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    });
    
    const geometry = new THREE.PlaneGeometry(1, 0.5);
    const label = new THREE.Mesh(geometry, material);
    
    label.position.y = 3;
    label.rotation.x = -Math.PI / 4; // Angle toward camera
    
    god.add(label);
    
    // Ensure label always faces camera
    god.userData.updateLabel = (camera: THREE.Camera) => {
      label.quaternion.copy(camera.quaternion);
    };
  };
  
  // Animate Greek gods moving around
  const animateGreekGods = (delta: number) => {
    if (!cameraRef.current) return;
    
    godsRef.current.forEach(god => {
      const data = god.userData;
      
      // Update label orientation
      if (data.updateLabel) {
        data.updateLabel(cameraRef.current!);
      }
      
      // Animate particles/aura
      god.children.forEach(child => {
        if (child instanceof THREE.Group) {
          child.children.forEach(particle => {
            if (particle.userData && particle.userData.initialPosition) {
              const pData = particle.userData;
              const time = Date.now() * 0.001;
              
              particle.position.x = pData.initialPosition.x + Math.sin(time * pData.speed + pData.phase) * pData.amplitude;
              particle.position.y = pData.initialPosition.y + Math.cos(time * pData.speed + pData.phase) * pData.amplitude;
              particle.position.z = pData.initialPosition.z + Math.sin(time * pData.speed * 0.5) * pData.amplitude * 0.5;
            }
          });
        }
      });
      
      // Handle movement
      if (data.waitTime > 0) {
        data.waitTime -= delta;
      } else {
        // Move towards target
        const direction = new THREE.Vector3().subVectors(data.targetPosition, god.position).normalize();
        god.position.add(direction.multiplyScalar(data.moveSpeed * delta));
        
        // Rotate to face movement direction
        if (direction.length() > 0.01) {
          const targetRotation = Math.atan2(direction.x, direction.z);
          let currentRotation = god.rotation.y;
          
          // Smoothly rotate
          const rotDiff = targetRotation - currentRotation;
          // Handle wrapping around 2PI
          const shortestRotation = ((rotDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
          god.rotation.y += shortestRotation * data.rotateSpeed * delta;
        }
        
        // Check if close to target
        if (god.position.distanceTo(data.targetPosition) < 0.5) {
          // Set new target
          data.targetPosition.set(
            (Math.random() - 0.5) * 10,
            0,
            (Math.random() - 0.5) * 10
          );
          
          // Wait a bit before moving to new target
          data.waitTime = data.maxWaitTime;
        }
      }
    });
  };

  // Helper function to create Olympus terrain
  const createOlympusTerrain = () => {
    if (!sceneRef.current) return;

    // Create marble platform
    const platformGeometry = new THREE.CylinderGeometry(7, 7, 0.5, 32);
    const platformMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf8f9fa,
      roughness: 0.1,
      metalness: 0.1
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -0.25;
    platform.receiveShadow = true;
    sceneRef.current.add(platform);

    // Create golden trims
    const rimGeometry = new THREE.TorusGeometry(7, 0.2, 16, 100);
    const goldMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf6bd60,
      roughness: 0.2,
      metalness: 0.8
    });
    const rim = new THREE.Mesh(rimGeometry, goldMaterial);
    rim.position.y = 0;
    rim.rotation.x = Math.PI / 2;
    sceneRef.current.add(rim);

    // Create clouds
    const cloudGroup = new THREE.Group();
    for (let i = 0; i < 10; i++) {
      const cloudGeometry = new THREE.SphereGeometry(1 + Math.random() * 2, 8, 8);
      const cloudMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        roughness: 1
      });
      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
      
      // Random positions around the platform
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 10;
      cloud.position.x = Math.cos(angle) * distance;
      cloud.position.y = Math.random() * 5 - 2;
      cloud.position.z = Math.sin(angle) * distance;
      
      // Random scale
      const scale = 0.5 + Math.random() * 1;
      cloud.scale.set(scale, scale * 0.6, scale);
      
      cloudGroup.add(cloud);
    }
    sceneRef.current.add(cloudGroup);

    // Animate clouds
    const animateClouds = () => {
      cloudGroup.children.forEach((cloud, i) => {
        cloud.position.y += Math.sin(Date.now() * 0.001 + i) * 0.005;
      });
      requestAnimationFrame(animateClouds);
    };
    animateClouds();

    // Create distant mountains
    const mountainGeometry = new THREE.ConeGeometry(5, 10, 4);
    const mountainMaterial = new THREE.MeshStandardMaterial({ color: 0xb7c4cf });
    
    for (let i = 0; i < 6; i++) {
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
      const angle = (i / 6) * Math.PI * 2;
      const distance = 30;
      mountain.position.x = Math.cos(angle) * distance;
      mountain.position.y = -5;
      mountain.position.z = Math.sin(angle) * distance;
      mountain.rotation.y = Math.random() * Math.PI;
      sceneRef.current.add(mountain);
    }
  };

  // Helper function to create a character based on zodiac sign
  const createCharacter = () => {
    if (!sceneRef.current || !profile) return;

    const character = new THREE.Group();
    characterRef.current = character;

    // Create character based on zodiac element
    const bodyGeometry = new THREE.SphereGeometry(1, 32, 32);
    let bodyMaterial;
    
    // Choose character color based on element
    switch (profile.element) {
      case "Fire":
        bodyMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xff5e5b,
          emissive: 0x601700,
          emissiveIntensity: 0.3
        });
        break;
      case "Earth":
        bodyMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x8cb369,
          roughness: 0.8
        });
        break;
      case "Air":
        bodyMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xd4f1f9,
          transparent: true,
          opacity: 0.9
        });
        break;
      case "Water":
        bodyMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x75b9be,
          metalness: 0.2,
          roughness: 0.3
        });
        break;
      default:
        bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    }

    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    character.add(body);

    // Add zodiac symbol
    const symbolGeometry = new THREE.TorusGeometry(0.3, 0.1, 16, 32);
    const symbolMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf6bd60,
      metalness: 0.8,
      roughness: 0.2
    });
    const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
    symbol.position.z = 1;
    symbol.rotation.x = Math.PI / 2;
    character.add(symbol);

    // Add particle effects based on zodiac
    const particleCount = 50;
    const particles = new THREE.Group();
    
    for (let i = 0; i < particleCount; i++) {
      let particleGeometry, particleMaterial;
      
      // Choose particle type based on element
      switch (profile.element) {
        case "Fire":
          particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
          particleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff7f50, 
            transparent: true, 
            opacity: 0.7
          });
          break;
        case "Earth":
          particleGeometry = new THREE.OctahedronGeometry(0.1);
          particleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x3a5311, 
            transparent: true, 
            opacity: 0.8
          });
          break;
        case "Air":
          particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
          particleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.5
          });
          break;
        case "Water":
          particleGeometry = new THREE.SphereGeometry(0.08, 8, 8);
          particleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00bfff, 
            transparent: true, 
            opacity: 0.6
          });
          break;
        default:
          particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
          particleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.5
          });
      }
      
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      // Position particles in a sphere around character
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 1.2 + Math.random() * 0.3;
      
      particle.position.x = radius * Math.sin(theta) * Math.cos(phi);
      particle.position.y = radius * Math.sin(theta) * Math.sin(phi);
      particle.position.z = radius * Math.cos(theta);
      
      // Store initial position for animation
      particle.userData = {
        initialPosition: particle.position.clone(),
        speed: 0.01 + Math.random() * 0.05,
        amplitude: 0.1 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2
      };
      
      particles.add(particle);
    }
    
    character.add(particles);
    
    // Animate particles
    const animateParticles = () => {
      const time = Date.now() * 0.001;
      
      particles.children.forEach((particle: THREE.Object3D) => {
        const data = particle.userData;
        
        // Orbital motion
        particle.position.x = data.initialPosition.x + Math.sin(time * data.speed + data.phase) * data.amplitude;
        particle.position.y = data.initialPosition.y + Math.cos(time * data.speed + data.phase) * data.amplitude;
        particle.position.z = data.initialPosition.z + Math.sin(time * data.speed * 0.5) * data.amplitude * 0.5;
      });
      
      requestAnimationFrame(animateParticles);
    };
    
    animateParticles();
    
    // Add companion based on Chinese zodiac
    addCompanion(profile.chineseSign, character);

    sceneRef.current.add(character);
  };
  
  // Helper function to add a companion based on Chinese zodiac
  const addCompanion = (chineseSign: string, character: THREE.Group) => {
    if (!character) return;
    
    const companion = new THREE.Group();
    
    // Create companion base geometry based on Chinese zodiac
    let companionGeometry, companionMaterial;
    
    switch (chineseSign) {
      case "Dragon":
        companionGeometry = new THREE.ConeGeometry(0.3, 1, 5);
        companionMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x7e1671,
          emissive: 0x310a2d,
          emissiveIntensity: 0.3
        });
        break;
      case "Tiger":
        companionGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        companionMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xdaa03d,
          roughness: 0.7
        });
        break;
      case "Rabbit":
        companionGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        companionMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xf5f5f5,
          roughness: 0.9
        });
        break;
      default:
        // Default companion for other signs
        companionGeometry = new THREE.TetrahedronGeometry(0.3);
        companionMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xf6bd60,
          metalness: 0.6,
          roughness: 0.4
        });
    }
    
    const companionBody = new THREE.Mesh(companionGeometry, companionMaterial);
    companionBody.castShadow = true;
    companion.add(companionBody);
    
    // Position companion floating near the character
    companion.position.set(1.5, 0.5, 0);
    
    // Animate companion in orbit around character
    const animateCompanion = () => {
      const time = Date.now() * 0.001;
      companion.position.x = 1.5 * Math.sin(time * 0.5);
      companion.position.z = 1.5 * Math.cos(time * 0.5);
      companion.position.y = 0.5 + Math.sin(time) * 0.2;
      
      companion.rotation.y = time * 2;
      
      requestAnimationFrame(animateCompanion);
    };
    
    animateCompanion();
    
    character.add(companion);
  };

  // Helper function to update day/night cycle
  const updateDayNightCycle = (cycle: "dawn" | "day" | "dusk" | "night") => {
    if (!sceneRef.current) return;

    switch (cycle) {
      case "dawn":
        sceneRef.current.background = new THREE.Color(0xffdbac);
        break;
      case "day":
        sceneRef.current.background = new THREE.Color(0xe0f2fe);
        break;
      case "dusk":
        sceneRef.current.background = new THREE.Color(0xffa07a);
        break;
      case "night":
        sceneRef.current.background = new THREE.Color(0x1a237e);
        break;
    }
  };

  return (
    <div ref={containerRef} className="game-canvas w-full h-full">
      {/* ThreeJS canvas will be appended here */}
    </div>
  );
}
