import * as THREE from 'three'
import gsap, { Sine } from 'gsap'
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Canvas, useThree } from '@react-three/fiber'
// import React, { useMemo, useState, useRef } from 'react'
import React, { useMemo, useState, useRef, useEffect, useContext } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, useGLTF, OrbitControls, MeshReflectorMaterial } from '@react-three/drei'
// import { MeshReflectorMaterial } from '@react-three/drei/MeshReflectorMaterial'

import Effects from './Effects.js'
import Lights from './Lights.js'

// import SplashScreen from "./components/SplashScreen";

THREE.ColorManagement.legacyMode = false

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const textureLoader = new THREE.TextureLoader()

// Load the cabinet baked texture
const textureDiffusePath = '/textures/cabinet/lagoon_2.2.0_cabinet_baked_w_text.jpg'

const floor1Material = new THREE.MeshStandardMaterial({ color: '#111111', metalness: 0, roughness: 0 })
const floor2Material = new THREE.MeshStandardMaterial({ color: '#222222', metalness: 0, roughness: 0 })
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: '#ff0000', metalness: 0, roughness: 1 })
const wallMaterial = new THREE.MeshStandardMaterial({ color: '#887777', metalness: 0, roughness: 0 })

let toneFreq = [
  'C3', 'Db3', 'D3', 'Eb3', 'E3', 'F3', 'Gb3', 'G3',
  'Ab3', 'A3', 'Bb3', 'B3', 'C4', 'Db4', 'D4',
  'Eb4', 'E4'
];

export function SynthScene( {props} ) {
  // const [hamburger, setHamburger] = useState( useGLTF('/lagoon-3D-synth-2.2.3.glb') )
  const hamburger = useGLTF('/lagoon-3D-synth-2.2.3.glb')
  const timeOfBarPress = 0.2
  const keyRot = Math.PI / 20

  // const themeContext = useContext(React.ThemeContext);
  // console.log('themeContext')
  // console.log(themeContext)
  // const hamburger = useGLTF('/models/Keyboard/new/lagoon-3D-synth-2.2.3.gltf')
  // const hamburger = useGLTF('/hamburger.glb')

  // console.log('SynthScene')
  console.log('props')
  console.log(props)

  useEffect(() => {
    console.log('SynthScene - useEffect')

    setupScene()

    // return hamburger

    // hamburger
  // }, [hamburger])
  }, [])

  function setupScene() {
    console.log('setupScene')
    // const tempHamburger = useGLTF('/lagoon-3D-synth-2.2.3.glb')
    // setHamburger( tempHamburger )
    hamburger.scene.children.forEach( (mesh, index) => {
      mesh.castShadow = true
  
      console.log('mesh: ', mesh.name)
  
      // If it is the cabinet
      if (mesh.name === 'cabinet') {
        let image = textureLoader.load( textureDiffusePath )
        // let textureEmissive = self.textureLoader.load( textureEmissivePath )
        // image.encoding = THREE.sRGBEncoding
        image.flipY = false;
        mesh.material.map = image
      }
      // If it is the cabinet
      if (mesh.name === 'Floor') {
        mesh.visible = false
      }
  
    })
  }

  const playKey = (obj) => {
    // const obj = event.object
    if (obj === null) {
      props.playTone('empty')
      return
    }
    else {
      props.playTone(toneFreq[parseInt(obj.keyIndex)])
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

  const liftKey = (event) => {
    const obj = event.object
    console.log('- - - leave - - -')
    console.log(obj)
    props.playTone('empty')
    // if (obj === null) {
    //   props.playTone('empty')
    //   return
    // }
    // else {
    //   props.playTone(toneFreq[parseInt(obj.keyIndex)])
    // }
    // We receive an order to play key and it comes from the raycaster
    gsap.to(obj.rotation, timeOfBarPress, {x: 0, ease: Sine.easeOut})
  }
  
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
  
  const onPointerEnter = (event) => {
    event.stopPropagation()
    console.log( event.object.name )
    console.log( 'onPointerEnter' )

    if (event.object.name.includes('Key')) {
      playKey( event )
    }
  }
  
  const onPointerOut = (event) => {
    event.stopPropagation()
    // console.log( 'onPointerOut' )

    if (event.object.name.includes('Key')) {
      // liftKey( event )
      // playKey( event )
      playKey( null )
    }
  }
  
  const onPointerLeave = (event) => {
    event.stopPropagation()
    console.log( 'onPointerLeave' )

    liftKey( event )
  }
  
  const onPointerMove = (event) => {
    event.stopPropagation()
    console.log( 'onPointerMove' )
    console.log( event )
  }

  return (
    <>
      {/* <SplashScreen module={"power"} value={props.power.active} /> */}

      <group position={ [0, 0, 0] }>
        {/* <mesh geometry={ boxGeometry } material={ floor1Material } position={ [ 0, - 0.1, 0 ] } scale={ [ 4, 0.2, 4 ] }  receiveShadow /> */}

        <fog attach="fog" args={['#101010', 0, 10]} />
              
        <primitive
          object={hamburger.scene}
          scale={0.2}
          onClick={ event => { onClick(event) }}
          onPointerOver={ event => { onPointerOver(event) }}
          onPointerEnter={ event => { onPointerEnter(event) }}
          onPointerOut={ event => { onPointerOut(event) }}
          onPointerLeave={ event => { onPointerLeave(event) }}
          onPointerMove={ event => { onPointerMove(event) }}
        />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <MeshReflectorMaterial
            blur={[400, 100]}
            resolution={1024}
            mixBlur={1}
            opacity={2}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.25}
            roughness={1}
            color={ 0x000000 }
          />
        </mesh>

        {/* <mesh geometry={boxGeometry} material={floor1Material} position={[0, 0, 0]} scale={[4, 0.2, 4]} receiveShadow /> */}
      </group>
    </>
  )
}

export function Synthesizer({
  count = 5,
  // types = [BlockSpinner, BlockAxe, BlockLimbo],
  seed = 0,
  ...props
}) {

  // console.log('Synthesizer')

  useEffect(() => {
    // return props
  }, [])
  // }, [props])

  const blocks = useMemo(() => {
    // const blocks = []

    // for (let i = 0; i < count; i++) {
    //   const type = types[Math.floor(Math.random() * types.length)]
    //   blocks.push(type)
    // }

    // return blocks
  }, [])
  // }, [count, types, seed])

  return (
    <div className="synthesizer-master">
      {/* {blocks.map((Block, index) => <Block key={index} position={[0, 0, - (index + 1) * 4]} />)} */}
      <Canvas
        shadows
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [0, 1, 0]
        }}
      >
        {/* <CameraController /> */}
        <OrbitControls makeDefault />
        <Lights />

        <SynthScene props={ props }/>

        <Effects />
      </Canvas>
    </div>
  )
}