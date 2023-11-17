/* eslint-disable */
// ts-check
import * as THREE from 'three'
import React, { useState, useRef, useEffect } from 'react';
import { MeshStandardMaterial, TextureLoader } from 'three';
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from "@react-three/drei";
// import { MeshCollider, RigidBody } from '@react-three/rapier'
import gsap, { Sine } from 'gsap'

const textureLoader = new THREE.TextureLoader()

// Load the cabinet baked texture
const textureDiffusePath = '/textures/cabinet/lagoon_2.2.0_cabinet_baked_w_text.jpg'

// import carHit3 from '../../public/sounds/car-hit-3.mp3'
// import bowlingPin1Sound from '../../public/sounds/bowling/pin-1.mp3'

export default function Synth({ url, position, rotation, scale = 1, hasCollider = false }) {
  const { scene, animations } = useGLTF( url );
  const [ characterMeshes, setCharacterMeshes ] = useState([])
  const [ separateMesh ] = useState(true)
  const [ rotX, setRotX ] = useState( 0 )

  const timeOfBarPress = 0.2
  const keyRot = Math.PI / 20
  let pianoKeyTest = null

  // The bars
  const meshRefs = useRef([]);
  const rigidRefs = useRef([]);

  const textureLoader = new TextureLoader();
  const texture = textureLoader.load('/textures/lagoon_2.2.0_cabinet_baked_red.jpg');
  // const texture = textureLoader.load('/textures/lagoon_2.2.0_cabinet_baked.jpg');

  useEffect(() => {
    console.log('useEffect')
    
    setupScene()

    setupKeyListeners()
  }, [])

  const setupScene = ( obj ) => {
    console.log(scene)
    const sceneMeshes = scene.children[ 0 ]
    // Add to characters
    // characters.push(sceneMeshes)
    let characterParts = []
    scene.traverse((object) => {
        // console.log(object)
        // if (object.isMesh) {
        //     characterParts.push(object);
        // }
        console.log(object.name)

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
          characterParts.push(object);
          // Add a ref for this mesh
          meshRefs.current.push(React.createRef());
          rigidRefs.current.push(React.createRef());
        }

        // object.visible = false;
        if (object.name === 'Key@2-D3') {
          // object.visible = false;
          // characterParts.push(object);
          // Add a ref for this mesh
          // meshRefs.current.push(React.createRef());
          // alert('found key')
        }

    });

    pianoKeyTest = scene.getObjectByName( 'Key@2-D3' )

    setCharacterMeshes(characterParts);
  }

  const setupKeyListeners = ( obj ) => {
    document.addEventListener('keydown', (event) => {
      console.log('keydown')
      console.log(pianoKeyTest)
      // gsap.to(pianoKeyTest.rotation, { duration: 0.2, x: -Math.PI / 2, ease: "expo.out" })
      pianoKeyTest.visible = false

      gsap.to(meshRefs.current[ 0 ].current.rotation, { duration: 0.2, x: -Math.PI / 2, ease: "expo.out" })
      // meshRefs.current[ 0 ].current.visible = false
      // meshRefs.current.forEach((mesh, index) => {}
    })
  }

  const onKeyEnter = ( obj ) => {
    console.log('onKeyEnter')
    console.log(obj)
    // playSound( obj.soundURL )
  }

  const onKeyExit = ( obj ) => {
    console.log('onKeyExit')
    console.log(obj)
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
    console.log( 'onClick' )
    console.log( event )
    console.log( event.object.name )
    console.log( event.eventObject )
  }
  
  const onPointerOver = (event) => {
    event.stopPropagation()
    // console.log( 'onPointerOver' )
  }
  
  const onPointerEnter = (event, mesh) => {
    event.stopPropagation()
    console.log( event.object )
    console.log( mesh )
    // console.log( event.object.name )
    console.log( 'onPointerEnter' )

    if (mesh.name.includes('Key')) {
      playKey( event )
    }
  }

  const onPointerLeave = (event, mesh) => {
    event.stopPropagation()
    console.log( 'onPointerLeave' )

    liftKey( event )
  }
  
  const onPointerMove = (event) => {
    event.stopPropagation()
    console.log( 'onPointerMove' )
    console.log( event )
  }

  // *** Play the key
  const playKey = (obj) => {
    // const obj = event.object
    
    // if (obj === null) {
    //   props.playTone('empty')
    //   return
    // }
    // else {
    //   props.playTone(toneFreq[parseInt(obj.keyIndex)])
    // }

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
    console.log('- - - leave - - -')
    console.log(obj)
    
    // AudioEngine related
    // props.playTone('empty')

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
          {characterMeshes.map((mesh, index) => (
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
      <group rotation={rotation} position={position} scale={scale}>
        <primitive object={scene}></primitive>
      </group>
    </>
  )
}
