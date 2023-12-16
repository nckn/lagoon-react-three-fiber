/* eslint-disable */
// ts-check
import * as THREE from 'three'
import React, { useState, useRef, useEffect } from 'react';
import { MeshStandardMaterial, TextureLoader } from 'three';
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from "@react-three/drei";
// import { MeshCollider, RigidBody } from '@react-three/rapier'
import gsap, { Sine } from 'gsap'

import useGame from '../store/useGame';

const textureLoader = new THREE.TextureLoader()

// Load the cabinet baked texture
const textureDiffusePath = '/textures/cabinet/lagoon_2.2.0_cabinet_baked_w_text.jpg'

// import carHit3 from '../../public/sounds/car-hit-3.mp3'
// import bowlingPin1Sound from '../../public/sounds/bowling/pin-1.mp3'

let toneFreq = [
  'C3', 'Db3', 'D3', 'Eb3', 'E3', 'F3', 'Gb3', 'G3',
  'Ab3', 'A3', 'Bb3', 'B3', 'C4', 'Db4', 'D4',
  'Eb4', 'E4'
];

export default function Synth({ url, position, rotation, scale = 1, hasCollider = false, ...props }) {
  const { scene, animations } = useGLTF( url );
  const [ keyMeshes, setKeyMeshes ] = useState([])
  const [ knobMeshes, setKnobMeshes ] = useState([])
  const [ separateMesh ] = useState(true)
  const [ rotX, setRotX ] = useState( 0 )

  // Turning knobs and moving sliders
  const [ mouseIsDown, setMouseIsDown ] = useState(false)
  // setters
  const setMouseDown = useGame((state) => state.setMouseDown)

  const timeOfBarPress = 0.2
  const keyRot = Math.PI / 20
  let pianoKeyTest = null

  let mouse = {x: 0, y: 0}
  let realMouse = {x: 0, y: 0}
  let currentX = 0
  let dragDir = 0
  let dragPower = 0.1

  // The bars
  const meshRefs = useRef([]);
  const rigidRefs = useRef([]);

  const textureLoader = new TextureLoader();
  const texture = textureLoader.load('/textures/lagoon_2.2.0_cabinet_baked_red.jpg');
  // const texture = textureLoader.load('/textures/lagoon_2.2.0_cabinet_baked.jpg');

  useEffect(() => {
    console.log('useEffect')

    console.log('props')
    console.log(props)
    
    setupScene()

    setupKeyListeners()
  }, [])

  const setupScene = ( obj ) => {
    console.log(scene)
    const sceneMeshes = scene.children[ 0 ]
    // Add to characters
    // characters.push(sceneMeshes)
    let keyObjects = []
    let knobObjects = []

    scene.traverse((object) => {
        // console.log(object)
        // if (object.isMesh) {
        //     keyObjects.push(object);
        // }
        // console.log(object.name)

        if (object.isMesh && object.name === 'cabinet') {
          object.receiveShadow = true
          object.castShadow = true

          // object.visible = false;
          // console.log('Before:', object.material);

          // add the texture
          object.material = new MeshStandardMaterial({ map: texture });
          object.material.needsUpdate = true

          // let image = textureLoader.load( textureDiffusePath )
          // // let textureEmissive = self.textureLoader.load( textureEmissivePath )
          // // image.encoding = THREE.sRGBEncoding
          // image.flipY = false;
          // object.material.map = image

          // add test color
          // object.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          // console.log('After:', object.material);
        }
        
        // console.log(object.name)
        if (object.isMesh && object.name.includes('Key') && object.name !== 'cabinet') {
          object.visible = false;
          keyObjects.push(object);
          // Add a ref for this mesh
          meshRefs.current.push(React.createRef());
          rigidRefs.current.push(React.createRef());
        }
        
        // console.log(object.name)
        if (
          object.name.includes('Knob') ||
          object.name.includes('Pin')
        ) {
          object.visible = false;
          // knobObjects.push(knobObjects);
          console.log(object.name)
          knobObjects.push(object);
          // Add a ref for this mesh
          // meshRefs.current.push(React.createRef());
          // rigidRefs.current.push(React.createRef());
        }

        // object.visible = false;
        if (object.name === 'Key@2-D3') {
          // object.visible = false;
          // keyObjects.push(object);
          // Add a ref for this mesh
          // meshRefs.current.push(React.createRef());
          // alert('found key')
        }

    });

    pianoKeyTest = scene.getObjectByName( 'Key@2-D3' )

    setKeyMeshes(keyObjects);
    setKnobMeshes(knobObjects);
  }

  const setupKeyListeners = ( obj ) => {
    document.addEventListener('keydown', (event) => {
      // console.log('keydown')
      // console.log(pianoKeyTest)
      // gsap.to(pianoKeyTest.rotation, { duration: 0.2, x: -Math.PI / 2, ease: "expo.out" })
      pianoKeyTest.visible = false

      gsap.to(meshRefs.current[ 0 ].current.rotation, { duration: 0.2, x: -Math.PI / 2, ease: "expo.out" })
      // meshRefs.current[ 0 ].current.visible = false
      // meshRefs.current.forEach((mesh, index) => {}
    })
  }

  const onKeyEnter = ( obj ) => {
    // console.log('onKeyEnter')
    // console.log(obj)
    // playSound( obj.soundURL )
  }

  const onKeyExit = ( obj ) => {
    // console.log('onKeyExit')
    // console.log(obj)
    // playSound( obj.soundURL )
  }

  const playSound = (soundURL) => {
    const audio = new Audio(soundURL);
    audio.play();
  }

  useFrame((state, delta) => {
    // console.log('useFrame')
    // console.log(rigidRefs.current)
    // gameZoneCubeRefs.forEach((zone, index) => {
    //   // zone.current.lookAt(camera.position)
    //   // zone.current.rotation.x = clock.getElapsedTime()
    //   // zone.current.rotation.x = delta
    // })
    if (pianoKeyTest !== null) {
      setRotX( pianoKeyTest.rotation.x )
    }
  })

  const onClick = (event) => {
    event.stopPropagation()
    // console.log( 'onClick' )
    // console.log( event )
    // console.log( event.object.name )
    // console.log( event.eventObject )
  }
  
  const onPointerOver = (event) => {
    event.stopPropagation()
    // console.log( 'onPointerOver' )
  }
  
  const onPointerEnter = (event, mesh) => {
    event.stopPropagation()
    // console.log( event.object )
    // console.log( mesh )
    // console.log( event.object.name )
    // console.log( 'onPointerEnter' )

    if (mesh.name.includes('Key')) {
      // console.log( 'onPointerEnter - Key' )
      // child.castShadow = false
      var keyIndex = mesh.name.split(/[@-]/);
      // console.log(keyIndex)
      mesh.keyIndex = parseInt(keyIndex[1])
      mesh.noteName = keyIndex[2]
      // console.log('key index: ', key.keyIndex)
      // self.allKeys.push(key)

      playKey( event, mesh, mesh.keyIndex )
    }
   
    if (
      mesh.name.includes('Knob')
    ) {
      // console.log( 'onPointerEnter - Knob' )
      // console.log( mesh.name )
      // child.castShadow = false
      // var keyIndex = mesh.name.split(/[@-]/);
      // // console.log(keyIndex)
      // mesh.keyIndex = parseInt(keyIndex[1])
      // mesh.noteName = keyIndex[2]
      // // console.log('key index: ', key.keyIndex)
      // // self.allKeys.push(key)

      // playKey( event, mesh, mesh.keyIndex )
    }
  }

  const onPointerLeave = (event, mesh) => {
    event.stopPropagation()
    // console.log( 'onPointerLeave' )

    liftKey( event )
  }
  
  const onPointerMove = (event) => {
    event.stopPropagation()
    // console.log( 'onPointerMove' )
    // console.log( event )

    if (mouseIsDown) {
      if (currentX < realMouse.x) {
        // console.log('up')
        dragDir = -dragPower
      }
      else if (currentX > realMouse.x) {
        // console.log('down')
        dragDir = dragPower
      
        currentX = realMouse.x
      }
    }
  }
  
  const onPointerDown = (event, mesh) => {
    event.stopPropagation()
    console.log( 'onPointerDown' )
    console.log( mesh.name )
    // console.log( event )

    // setMouseIsDown(true)
    setMouseDown(true) // *** zustand

    if (mesh.name.includes('Knob')) {
      props.toggleControls(false)
    }

  }
  
  const onPointerUp = (event, mesh) => {
    event.stopPropagation()
    // console.log( 'onPointerUp' )
    // console.log( event )

    // setMouseIsDown(false)
    setMouseDown(false) // *** zustand

    props.toggleControls(true)

    // if (mesh.name.includes('Knob')) {
    //   props.toggleControls(false)
    // }

  }

  // *** Play the key
  const playKey = (obj, mesh, keyIndex) => {
    // const obj = event.object
    // console.log( 'playKey' )
    // // console.log( mesh )
    // console.log( keyIndex )
    // console.log( toneFreq[parseInt(keyIndex)] )

    if (obj === null) {
      props.playTone('empty')
      return
    }
    else {
      // props.playTone(toneFreq[parseInt(mesh.keyIndex)])
      props.playTone(toneFreq[parseInt(keyIndex)])
    }

    // We receive an order to play key and it comes from the raycaster
    gsap.to(obj.object.rotation, timeOfBarPress, {x: keyRot, ease: Sine.easeOut});
    // We receive an order to play key and it comes from a key
    if (obj.object.keyCode) {
      // console.log('is keyboard')
    }
    // Play the one with the keyIndex
    else if (obj.object.keyIndex) {
      // TODO: Play tone here
      // for (const key of self.allKeys) {
      //   if (obj.keyIndex === 2) {
      //     TweenMax.to(key.rotation, self.timeOfBarPress, {x: 0, ease: Expo.easeOut});
      //   }
      // }
    }   
  }

  // const liftKey = (event, mesh) => {
  const liftKey = (obj) => {
    // const obj = event.object
    // const obj = mesh
    // console.log('- - - leave - - -')
    // console.log(obj)
    
    // AudioEngine related
    props.playTone('empty')

    // if (obj === null) {
    //   props.playTone('empty')
    //   return
    // }
    // else {
    //   props.playTone(toneFreq[parseInt(obj.keyIndex)])
    // }
    // We receive an order to play key and it comes from the raycaster
    gsap.to(obj.object.rotation, timeOfBarPress * 1.5, {x: 0, ease: Sine.easeOut})
  }

  return (
    <>
      <group
        position={position}
        rotation={rotation}
        // scale={scale}
      >
        separateMesh ? (
          {keyMeshes.map((mesh, index) => (
            mesh.name !== 'cabinet' && (
              <mesh
                ref={meshRefs.current[index]}
                key={`${mesh.name}-${index}`}
                geometry={mesh.geometry}
                position={[mesh.position.x * scale, mesh.position.y * scale, mesh.position.z * scale]}
                receiveShadow
                castShadow
                material={mesh.material}
                scale={scale}
                onPointerEnter={(e) => { onPointerEnter(e, mesh) }}
                onPointerLeave={(e) => { onPointerLeave(e, mesh) }}
              >
              </mesh>
            )
            // <RigidBody
            //   ref={rigidRefs.current[index]}
            //   colliders='hull'
            //   type="kinematicPosition"
            //   key={`rigidbody-${index}`}
            // >
            //   <MeshCollider
            //       mass={0}
            //       sensor
            //       onIntersectionEnter={() => { (mesh) => onKeyEnter(mesh) }}
            //       onIntersectionExit={() => { (mesh) => onKeyExit(mesh) }}
            //   >
            //   </MeshCollider>
            // </RigidBody>
          ))}
        ) : (
          {/* <group rotation={rot} position={pos} scale={scale}>
            <primitive object={scene}></primitive>
          </group> */}
        )
      </group>
      
      {/* Knobs - start */}
      <group
        position={position}
        rotation={rotation}
        // scale={scale}
      >
        separateMesh ? (
          {knobMeshes.map((mesh, index) => (
            mesh.name !== 'cabinet' && (
              <mesh
                // ref={meshRefs.current[index]}
                key={`${mesh.name}-${index}`}
                geometry={mesh.geometry}
                position={[mesh.position.x * scale, mesh.position.y * scale, mesh.position.z * scale]}
                receiveShadow
                castShadow
                material={mesh.material}
                scale={scale}
                onPointerEnter={(e) => { onPointerEnter(e, mesh) }}
                onPointerLeave={(e) => { onPointerLeave(e, mesh) }}
                onPointerDown={(e) => { onPointerDown(e, mesh) }}
                onPointerUp={(e) => { onPointerUp(e, mesh) }}
                // onPointerMove={(e) => { onPointerMove(e, mesh) }}
              >
              </mesh>
            )
          ))}
        ) : null
      </group>
      {/* Knobs - end */}

      <group rotation={rotation} position={position} scale={scale}>
        <primitive object={scene}></primitive>
      </group>
    </>
  )
}
