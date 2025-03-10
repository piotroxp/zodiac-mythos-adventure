
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
