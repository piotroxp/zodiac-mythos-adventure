import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
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
  const characterMovementRef = useRef({
    walking: false,
    direction: new THREE.Vector3(0, 0, 0),
    speed: 1.5,
    targetPosition: new THREE.Vector3(0, 0, 0),
    waitTime: 0,
    maxWaitTime: 3 + Math.random() * 3,
    keyboardControls: {
      forward: false,
      backward: false,
      left: false,
      right: false
    }
  });
  const animationStateRef = useRef({
    leftLegForward: true,
    animationTime: 0,
    cycleSpeed: 1.5
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0f2fe);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    updateDayNightCycle(gameState.dayNightCycle);

    createOlympusTerrain();

    createHumanoidCharacter();

    createGreekGods();

    const handleKeyDown = (event: KeyboardEvent) => {
      switch(event.key) {
        case 'ArrowUp':
        case 'w':
          characterMovementRef.current.keyboardControls.forward = true;
          break;
        case 'ArrowDown':
        case 's':
          characterMovementRef.current.keyboardControls.backward = true;
          break;
        case 'ArrowLeft':
        case 'a':
          characterMovementRef.current.keyboardControls.left = true;
          break;
        case 'ArrowRight':
        case 'd':
          characterMovementRef.current.keyboardControls.right = true;
          break;
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      switch(event.key) {
        case 'ArrowUp':
        case 'w':
          characterMovementRef.current.keyboardControls.forward = false;
          break;
        case 'ArrowDown':
        case 's':
          characterMovementRef.current.keyboardControls.backward = false;
          break;
        case 'ArrowLeft':
        case 'a':
          characterMovementRef.current.keyboardControls.left = false;
          break;
        case 'ArrowRight':
        case 'd':
          characterMovementRef.current.keyboardControls.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const animate = () => {
      const delta = clockRef.current.getDelta();
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (characterRef.current) {
        animateCharacter(delta);
      }

      animateGreekGods(delta);

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

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
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    
    updateDayNightCycle(gameState.dayNightCycle);
  }, [gameState.dayNightCycle]);

  const animateCharacter = (delta: number) => {
    if (!characterRef.current) return;
    
    const character = characterRef.current;
    const movementData = characterMovementRef.current;
    const animState = animationStateRef.current;
    
    animState.animationTime += delta * animState.cycleSpeed;
    
    const keyControls = movementData.keyboardControls;
    const isUsingKeyboard = keyControls.forward || keyControls.backward || 
                            keyControls.left || keyControls.right;
    
    if (isUsingKeyboard) {
      movementData.walking = true;
      
      const moveDirection = new THREE.Vector3(0, 0, 0);
      
      if (keyControls.forward) moveDirection.z -= 1;
      if (keyControls.backward) moveDirection.z += 1;
      if (keyControls.left) moveDirection.x -= 1;
      if (keyControls.right) moveDirection.x += 1;
      
      if (moveDirection.length() > 0) {
        moveDirection.normalize();
        
        const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
        character.rotation.y = targetRotation;
        
        character.position.add(moveDirection.multiplyScalar(movementData.speed * delta));
        animateWalkCycle(character, animState.animationTime);
      } else {
        resetCharacterPose(character);
        movementData.walking = false;
      }
      
      const maxDistance = 6.5;
      if (character.position.length() > maxDistance) {
        character.position.normalize().multiplyScalar(maxDistance);
      }
    } else {
      if (movementData.waitTime > 0) {
        movementData.waitTime -= delta;
        resetCharacterPose(character);
      } else {
        const direction = new THREE.Vector3().subVectors(
          movementData.targetPosition, 
          character.position
        ).normalize();
        
        character.position.add(direction.clone().multiplyScalar(movementData.speed * delta));
        
        if (direction.length() > 0.01) {
          const targetRotation = Math.atan2(direction.x, direction.z);
          character.rotation.y = targetRotation;
          
          movementData.walking = true;
          movementData.direction = direction;
        }
        
        if (movementData.walking) {
          animateWalkCycle(character, animState.animationTime);
        }
        
        if (character.position.distanceTo(movementData.targetPosition) < 0.5) {
          movementData.targetPosition.set(
            (Math.random() - 0.5) * 5,
            0,
            (Math.random() - 0.5) * 5
          );
          
          movementData.waitTime = movementData.maxWaitTime;
          movementData.walking = false;
          
          resetCharacterPose(character);
        }
      }
    }
    
    character.children.forEach(child => {
      if (child.name === "aura") {
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
  };

  const resetCharacterPose = (character: THREE.Group) => {
    character.children.forEach(part => {
      if (part.name === "leftLeg" || part.name === "rightLeg") {
        part.rotation.x = 0;
      }
      if (part.name === "leftArm" || part.name === "rightArm") {
        part.rotation.x = 0;
      }
    });
  };

  const animateWalkCycle = (character: THREE.Group, time: number) => {
    const legAmplitude = Math.PI / 8;
    const armAmplitude = Math.PI / 10;
    
    character.children.forEach(part => {
      if (part.name === "leftLeg") {
        part.rotation.x = Math.sin(time * Math.PI) * legAmplitude;
      }
      if (part.name === "rightLeg") {
        part.rotation.x = Math.sin(time * Math.PI + Math.PI) * legAmplitude;
      }
      if (part.name === "leftArm") {
        part.rotation.x = Math.sin(time * Math.PI + Math.PI) * armAmplitude;
      }
      if (part.name === "rightArm") {
        part.rotation.x = Math.sin(time * Math.PI) * armAmplitude;
      }
    });
  };

  const createGreekGods = () => {
    if (!sceneRef.current) return;

    const gods = [
      { name: "Zeus", color: 0xffd700, position: [5, 0, 0], scale: 1.2 },
      { name: "Poseidon", color: 0x1e90ff, position: [-5, 0, 0], scale: 1.1 },
      { name: "Athena", color: 0x808080, position: [0, 0, 5], scale: 1.0 },
      { name: "Apollo", color: 0xffa500, position: [4, 0, 4], scale: 1.05 },
      { name: "Artemis", color: 0x98fb98, position: [-4, 0, -4], scale: 0.95 },
      { name: "Hermes", color: 0xb0c4de, position: [-3, 0, 3], scale: 0.9 }
    ];

    gods.forEach(god => {
      const godGroup = createGod(god.name, god.color, god.scale);
      godGroup.position.set(god.position[0], god.position[1], god.position[2]);
      sceneRef.current?.add(godGroup);
      
      godsRef.current.push(godGroup);
      
      addGodLabel(godGroup, god.name);
    });
  };

  const createGod = (name: string, color: number, scale: number): THREE.Group => {
    const god = new THREE.Group();
    
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
    
    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffe0bd,
      roughness: 0.8
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.1;
    head.castShadow = true;
    god.add(head);
    
    const robeGeometry = new THREE.CylinderGeometry(0.6, 0.8, 1.5, 8);
    const robeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7
    });
    const robe = new THREE.Mesh(robeGeometry, robeMaterial);
    robe.position.y = 0.6;
    robe.castShadow = true;
    god.add(robe);
    
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
      
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 0.8 + Math.random() * 0.4;
      
      particle.position.x = radius * Math.sin(theta) * Math.cos(phi);
      particle.position.y = 1.5 + Math.random() * 1;
      particle.position.z = radius * Math.sin(theta) * Math.sin(phi);
      
      particle.userData = {
        initialPosition: particle.position.clone(),
        speed: 0.01 + Math.random() * 0.03,
        amplitude: 0.1 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2
      };
      
      auraGroup.add(particle);
    }
    
    god.add(auraGroup);
    
    god.scale.set(scale, scale, scale);
    
    if (name === "Zeus") {
      const boltGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 5, 1, false);
      const boltMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const bolt = new THREE.Mesh(boltGeometry, boltMaterial);
      bolt.rotation.z = Math.PI / 4;
      bolt.position.set(0.5, 1.5, 0);
      god.add(bolt);
    } else if (name === "Poseidon") {
      const tridentGroup = new THREE.Group();
      
      const staffGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
      const staffMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const staff = new THREE.Mesh(staffGeometry, staffMaterial);
      tridentGroup.add(staff);
      
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
    label.rotation.x = -Math.PI / 4;
    
    god.add(label);
    
    god.userData.updateLabel = (camera: THREE.Camera) => {
      label.quaternion.copy(camera.quaternion);
    };
  };

  const animateGreekGods = (delta: number) => {
    if (!cameraRef.current) return;
    
    godsRef.current.forEach(god => {
      const data = god.userData;
      
      if (data.updateLabel) {
        data.updateLabel(cameraRef.current!);
      }
      
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
      
      if (data.waitTime > 0) {
        data.waitTime -= delta;
      } else {
        const direction = new THREE.Vector3().subVectors(data.targetPosition, god.position).normalize();
        god.position.add(direction.multiplyScalar(data.moveSpeed * delta));
        
        if (direction.length() > 0.01) {
          const targetRotation = Math.atan2(direction.x, direction.z);
          let currentRotation = god.rotation.y;
          
          const rotDiff = targetRotation - currentRotation;
          const shortestRotation = ((rotDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
          god.rotation.y += shortestRotation * data.rotateSpeed * delta;
        }
        
        if (god.position.distanceTo(data.targetPosition) < 0.5) {
          data.targetPosition.set(
            (Math.random() - 0.5) * 10,
            0,
            (Math.random() - 0.5) * 10
          );
          
          data.waitTime = data.maxWaitTime;
        }
      }
    });
  };

  const createOlympusTerrain = () => {
    if (!sceneRef.current) return;

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
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 10;
      cloud.position.x = Math.cos(angle) * distance;
      cloud.position.y = Math.random() * 5 - 2;
      cloud.position.z = Math.sin(angle) * distance;
      
      const scale = 0.5 + Math.random() * 1;
      cloud.scale.set(scale, scale * 0.6, scale);
      
      cloudGroup.add(cloud);
    }
    sceneRef.current.add(cloudGroup);

    const animateClouds = () => {
      cloudGroup.children.forEach((cloud, i) => {
        cloud.position.y += Math.sin(Date.now() * 0.001 + i) * 0.005;
      });
      requestAnimationFrame(animateClouds);
    };
    animateClouds();

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

  const createHumanoidCharacter = () => {
    if (!sceneRef.current || !profile) return;

    const character = new THREE.Group();
    characterRef.current = character;

    let bodyColor, accentColor;
    
    switch (profile.element) {
      case "Fire":
        bodyColor = 0xff5e5b;
        accentColor = 0xff7f50;
        break;
      case "Earth":
        bodyColor = 0x8cb369;
        accentColor = 0x3a5311;
        break;
      case "Air":
        bodyColor = 0xd4f1f9;
        accentColor = 0xffffff;
        break;
      case "Water":
        bodyColor = 0x75b9be;
        accentColor = 0x00bfff;
        break;
      default:
        bodyColor = 0xffffff;
        accentColor = 0xf6bd60;
    }
    
    const torsoGeometry = new THREE.CapsuleGeometry(0.4, 0.8, 8, 16);
    const torsoMaterial = new THREE.MeshStandardMaterial({ 
      color: bodyColor,
      roughness: 0.5,
      metalness: 0.2
    });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.y = 1;
    torso.castShadow = true;
    torso.name = "torso";
    character.add(torso);
    
    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.4,
      metalness: 0.3
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.85;
    head.castShadow = true;
    head.name = "head";
    character.add(head);
    
    const symbolGeometry = new THREE.CircleGeometry(0.1, 16);
    const symbolMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf6bd60,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xf6bd60,
      emissiveIntensity: 0.5
    });
    const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
    symbol.position.z = 0.3;
    symbol.position.y = 1.9;
    symbol.name = "symbol";
    character.add(symbol);
    
    const armGeometry = new THREE.CapsuleGeometry(0.15, 0.7, 8, 16);
    const armMaterial = new THREE.MeshStandardMaterial({ 
      color: bodyColor,
      roughness: 0.6
    });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(0.6, 1.1, 0);
    leftArm.rotation.z = -0.2;
    leftArm.castShadow = true;
    leftArm.name = "leftArm";
    character.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(-0.6, 1.1, 0);
    rightArm.rotation.z = 0.2;
    rightArm.castShadow = true;
    rightArm.name = "rightArm";
    character.add(rightArm);
    
    const legGeometry = new THREE.CapsuleGeometry(0.18, 0.8, 8, 16);
    const legMaterial = new THREE.MeshStandardMaterial({ 
      color: bodyColor,
      roughness: 0.6
    });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(0.25, 0.45, 0);
    leftLeg.castShadow = true;
    leftLeg.name = "leftLeg";
    character.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(-0.25, 0.45, 0);
    rightLeg.castShadow = true;
    rightLeg.name = "rightLeg";
    character.add(rightLeg);
    
    const aura = new THREE.Group();
    aura.name = "aura";
    
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({ 
        color: accentColor, 
        transparent: true, 
        opacity: 0.7
      });
      
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 0.8 + Math.random() * 0.3;
      
      particle.position.x = radius * Math.sin(theta) * Math.cos(phi);
      particle.position.y = 1 + Math.random() * 1;
      particle.position.z = radius * Math.sin(theta) * Math.sin(phi);
      
      particle.userData = {
        initialPosition: particle.position.clone(),
        speed: 0.01 + Math.random() * 0.05,
        amplitude: 0.1 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2
      };
      
      aura.add(particle);
    }
    
    character.add(aura);
    
    addCompanion(profile.chineseSign, character);

    sceneRef.current.add(character);
  };

  const addCompanion = (chineseSign: string, character: THREE.Group) => {
    if (!character) return;
    
    const companion = new THREE.Group();
    
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
    
    companion.position.set(1.5, 0.5, 0);
    
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
