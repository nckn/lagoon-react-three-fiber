import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setParam } from "../actions/actions.js";
// import { connect } from "react-redux";

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
// import { DragControls } from 'three/examples/jsm/controls/DragControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Post-processing
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';

import gsap, { 
  TweenMax,
  // TimelineMax,
  Sine,
  // Power3,
  Power4,
  Expo
} from 'gsap'
import styled from "styled-components";
import './ThreeView.css'
import { map } from '../helpers.js'

import SplashScreen from "../components/SplashScreen";

// volumetric / godrays shaders
import godRaysShaders from '../assets/js/volumetric/godrays-shaders.js'
// const vertexShader = require('../assets/js/volumetric/vertexShader.glsl')
// const fragmentShader = require('../assets/js/volumetric/fragmentShader.glsl')

// TODO - merging blender names with lagoon more readable names

// Commented out due to build
// const informationlabels = require('../static/json/informationlabels.json')

// const SPECTOR = require('spectorjs')
// const spector = new SPECTOR.Spector()
// spector.displayUI()

const Container = styled.div`
  z-index: 11;
`;

const lightZ = 0.182 // 0.832, -1.662

// let toneFreq = [
//   130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185.00, 196.00,
//   207.65, 220.00, 233.08, 246.94, 261.63, 277.18, 293.66,
//   311.13
// ];
let toneFreq = [
  'C3', 'Db3', 'D3', 'Eb3', 'E3', 'F3', 'Gb3', 'G3',
  'Ab3', 'A3', 'Bb3', 'B3', 'C4', 'Db4', 'D4',
  'Eb4', 'E4'
];

// This is essential in order to control the granularity of the sliders, min and max... sort of
const sliderMinRange = -0.575 // The min value for the 4 sliders A, D, S and R
const sliderMinSteps = -0.3 // The wavetype switch interval
const sliderMinRangeMasterGain = -0.3 // The min value for the master gain slider

const textureDiffusePath = '/textures/cabinet/lagoon_2.2.0_cabinet_baked_w_text.jpg'
const textureEmissivePath = '/textures/cabinet/lagoon_2.2.0_cabinet_baked_w_text_emissive.jpg'
// const modelPath = '/models/Keyboard/new/lagoon-3D-synth-2.2.2.gltf'
const modelPath = '/models/Keyboard/new/lagoon-3D-synth-2.2.3.gltf'

// global variables
// const use_orbit_controls = false
// const isBrowser = () => typeof window !== "undefined"

class ThreeView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.test = 'Yes'

    // tooltip
    this.INTERSECTED = ''
    this.intS = null
    this.intersectedObject = null
    this.intersectedObjectOld = null
    
    this.showAnnotation = false
    
    this.meshes = []
    // this.popover = document.querySelector('.popover')

    // 3D Synth
    // Loaders
    this.gltfLoader = new GLTFLoader()
    this.cubeTextureLoader = new THREE.CubeTextureLoader()
    this.environmentMap = null
    // dat.gui
    this.sizes = {width: '', height: ''}
    this.gui = new dat.GUI({hideable: false, closed: true})
    
    // Start by hiding dat.gui
    this.gui.hide()
    
    this.debugObject = {}
    this.canvas = null
    this.scene = new THREE.Scene()
    this.camera = null
    this.controls = null
    this.controlsTransform = null
    this.renderer = null
    this.directionalLight = null
    // Raycaster
    this.raycaster = new THREE.Raycaster()
    this.currentIntersect = {object: ''}
    this.INTERSECTS = null

    this.mouse = {x: 0, y: 0}
    this.realMouse = {x: 0, y: 0}

    this.objectsToTest = []
    this.allKeys = []
    this.hasNotStartedOsc = true
    this.hasRunANoteYet = false
    // Baked shadow textures and light
    this.textureLoader = new THREE.TextureLoader()
    
    // For send
    this.keyNameNew = 0
    this.keyNameOld = 0
    // Logic btw AudioEngine key press and ThreeView, via App.js
    this.oldKeyPressed = 0
    
    this.bakedShadow = null
    this.materialFloor = null
    // New synth
    this.osc = new Array(3)
    this.oscGain = new Array(3)
    this.canSpawnATone = true
    this.timeOfBarPress = 0.4
    this.keyRot = Math.PI / 20

    // Turning knobs and moving sliders
    this.mouseIsDown = false
    // this.isDragging = false

    this.curGuiObjects = []
    this.curGuiObject = null

    this.objectOriginals = [20] // To store the initial values for the Blender scene children
    this.stepSliderOriginals = [10] // To store the initial values for the Blender scene children
    this.draggableObjects = []

    // Rotating knobs
    this.targetRotation = 0
    this.targetRotationOnPointerDown = 0
    this.pointerY = 0
    this.pointerYOnPointerDown = 0    

    this.plane = new THREE.Plane();
    this.pNormal = new THREE.Vector3(0, 1, 0); // plane's normal
    this.planeIntersect = new THREE.Vector3(); // point of intersection with the plane
    this.pIntersect = new THREE.Vector3(); // point of intersection with an object (plane's point)
    this.shift = new THREE.Vector3(); // distance between position of an object and points of intersection with the object
    this.isDragging = false;

    this.currentX = 0
    this.dragDir = 0

    // Effect composer
    this.AfterimagePass = null
    this.enablePostProcessing = false // Formerly known as reflectSoundInVisuals

    this.dragPower = 0.1

    // Theme related
    this.theme = {
      dark: {
        fogColor: new THREE.Color(0x000000)
      },
      light: {
        fogColor: new THREE.Color(0xffffff)
      }
    }

    this.screenTouchShape = null
    this.screenArea = null

    // Post processing
    this.effectComposer = null
    this.renderTarget = null
  }
  
  componentDidMount() {
    let _this = this
    // console.log('mounting')
    // if (this.props.show) this.show();

    _this.makeShaderMaterial()
    
    _this.setTheScene()
    _this.makeFloorMaterial()
    _this.set3DScene()
    _this.setOrbitControls()
    // _this.setTransformControls()
    _this.load3Dobjects()
    
    // Tooltip animation *
    _this.initTooltipAnim()
    
    // Setup the spot light
    _this.setupVolumetricLight()

    _this.initPostprocessing()

    // _this.setDragControls()
    _this.setupEventTracking()
    _this.setupKeyPresses()
    _this.tickTock()
  }

  initPostprocessing() {
    var self = this
    // Post processing
    let RenderTargetClass = null

    if(self.renderer.getPixelRatio() === 1 && self.renderer.capabilities.isWebGL2) {
      RenderTargetClass = THREE.WebGLMultisampleRenderTarget
      console.log('Using WebGLMultisampleRenderTarget')
    }
    else {
      RenderTargetClass = THREE.WebGLRenderTarget
      console.log('Using WebGLRenderTarget')
    }

    self.renderTarget = new RenderTargetClass(
      800,
      600, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding
      }
    )

    // FXAA to avoid pixelated
    let fxaaPass = new ShaderPass( FXAAShader );

    // After-image
    // self.afterimagePass = new AfterimagePass();
    // self.composer.addPass( self.afterimagePass )

    // Effect composer
    self.effectComposer = new EffectComposer(self.renderer, self.renderTarget)
    self.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    self.effectComposer.setSize(self.sizes.width, self.sizes.height)

    // FXAA shader
    self.effectComposer.addPass( fxaaPass ) 

    // Render pass
    const renderPass = new RenderPass(self.scene, self.camera)
    self.effectComposer.addPass(renderPass)

    // var bokehPass = new BokehPass(scene, camera, {
    //   focus: 1.0,
    //   aperture: 0.025,
    //   maxblur: 0.01,
    //   width: self.window.w,
    //   height: self.window.h,
    // });

    // effectComposer.addPass( bokehPass )

    // self.filmPass = new FilmPass(
    //   0.00,   // noise intensity. org: 0.35
    //   0.25,   // scanline intensity
    //   648,    // scanline count
    //   false,  // grayscale
    // )
    // self.filmPass.renderToScreen = true
    // self.effectComposer.addPass(self.filmPass)

    // Antialias pass
    if (self.renderer.getPixelRatio() === 1 && !self.renderer.capabilities.isWebGL2) {
        const smaaPass = new SMAAPass()
        self.effectComposer.addPass(smaaPass)

        console.log('Using SMAA')
    }

    // Unreal Bloom pass
    const unrealBloomPass = new UnrealBloomPass()
    // unrealBloomPass.enabled = false
    self.effectComposer.addPass(unrealBloomPass)

    // unrealBloomPass.strength = 0.622
    unrealBloomPass.strength = 0.1 // 1, or 0.4
    // unrealBloomPass.radius = 1
    unrealBloomPass.radius = 1
    unrealBloomPass.threshold = 0.6

    // self.composer = new EffectComposer(self.renderer)
    // self.composer.addPass(new RenderPass(self.scene, self.camera))

    // gui.add(unrealBloomPass, 'enabled')
    // gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001)
    // gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001)
    // gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001)
  }

  setScreenTouchShapePosition() {
    let self = this
    // console.log( 'self.INTERSECTS[0].object.name')
    // console.log( self.INTERSECTS[0].object.name)
    const intersect = self.INTERSECTS[0]
    // console.log( 'self.intersect' )
    // console.log( self.INTERSECTS[0] )
    if (
      (self.INTERSECTS !== null || self.INTERSECTS !== undefined) &&
      self.INTERSECTS.length > 1 &&
      self.INTERSECTS[0].object.name === 'ScreenArea'
    ) {
      // console.log('self.INTERSECTS')
      // console.log(self.INTERSECTS)
      self.screenTouchShape.position.copy( self.INTERSECTS[0].point )

      const xVal = self.INTERSECTS[0].point.x
      const zVal = self.INTERSECTS[0].point.z
      // console.log( 'xVal' )
      // console.log( xVal )
      // console.log( 'zVal' )
      // console.log( zVal )

      // KnobFilterCutoff
      // var filterFreq = map(xVal, -0.191, 0.25, 100, 20000)
      var filterFreq = map(xVal, -0.191, 0.25, 1, 4000)
      // // this.props.reverb.value = reverbVal
      this.props.filter.frequency = filterFreq
      
      // // KnobFilterResonance
      var filterRes = map(zVal, -0.29, -0.61, 0, 100)
      // // this.props.reverb.value = reverbVal
      this.props.filter.resonance = filterRes
      // console.log('it should change alright: ', filterRes)
    }
  }

  createScreenTouchShape() {
    let self = this
    const geometry = new THREE.CylinderBufferGeometry(0.02, 0.02, 0.009, 24)
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 10, metalness: 1, roughness: 0 })
    // const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    self.screenTouchShape = new THREE.Mesh( geometry, material )
    // self.screenTouchShape.position.copy( self.screenArea.position )
    // self.screenTouchShape.position.copy( new THREE.Vector3(0, 2, 0) )
    console.log( 'self.screenArea.position' )
    console.log( self.screenArea )
    self.screenTouchShape.position.copy( self.screenArea.position )
    self.scene.add( this.screenTouchShape )
  }

  colorTo(target, value) {
    let self = this
    // var target = scene.getObjectByName(target);
    console.log(target.background)
    var value = target.background
    // return
    var initial = new THREE.Color(target.background.getHex());
    // var value = new THREE.Color(value.color.getHex());
    gsap.to(initial, 1, {
      r: value.r,
      g: value.g,
      b: value.b,
      
      // onUpdate: function () {
      //   target.material.color = initial;
      // }
      onUpdate: function () {
        target.background = initial;
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    let self = this

    // console.log('something happened')
    // console.log('something happened: ', nextProps)
    
    // New state entity
		// Change background color
    // Button was clicked from GUIPanel
		if (nextProps.backgroundColor !== this.props.backgroundColor) {
			// this.powerOn();
      console.log('something happened')
      console.log(nextProps.backgroundColor)
      if (nextProps.backgroundColor.value === 1) {
        // Init the object and fog here
        this.scene.background = this.theme.dark.fogColor;
        // self.colorTo(self.scene, self.theme.light.fogColor)
        this.coneMesh.visible = true
      }
      else if (nextProps.backgroundColor.value === 0) {
        this.scene.background = this.theme.light.fogColor;
        this.coneMesh.visible = false
      }
		}
		
    // if (nextProps.resetCam !== this.props.resetCam) {
    if (nextProps.settings.resetCam !== this.props.settings.resetCam) {
			// this.powerOn();
      console.log('something happened - settings')
      self.onResetCamera()
		}

    // else if (!nextProps.backgroundColor && this.props.backgroundColor) {
    //   console.log('something else happened')
		// 	// this.powerOff();
		// }
	}

  setupVolumetricLight() {
    var self = this
    // add spot light
    self.lookAtPoint = new THREE.Vector3(0, 0, -0.25)
    var coneRadius = 5.5
    var lightAngle = coneRadius / 12
    var cone = new THREE.CylinderGeometry( 0.1, coneRadius, 10, 32 * 2, 20, true);
    // var geometry	= new THREE.CylinderGeometry( 0.1, 5*Math.cos(Math.PI/3)/1.5, 5, 32*2, 20, true);
    cone.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, -cone.parameters.height/2, 0 ) );
    cone.applyMatrix4( new THREE.Matrix4().makeRotationX( -Math.PI / 2 ) );
    // geometry.computeVertexNormals()
    // var geometry	= new THREE.BoxGeometry( 3, 1, 3 );
    // var material	= new THREE.MeshNormalMaterial({
    // 	side	: THREE.DoubleSide
    // });
    // var material	= new THREE.MeshPhongMaterial({
    // 	color		: 0x000000,
    // 	wireframe	: true,
    // })
    self.coneMesh = new THREE.Mesh( cone, self.materialVolumetric );
    
    self.coneMesh.position.set(0, 2.8, -0.6)
    
    // self.coneMesh.rotation.x = Math.PI / 2
    self.coneMesh.lookAt(self.lookAtPoint)
    // self.materialVolumetric.uniforms.lightColor.value.set('white')
    // self.materialVolumetric.uniforms.lightColor.value.set('0xff2222')
    self.materialVolumetric.uniforms.spotPosition.value	= self.coneMesh.position
    self.scene.add( self.coneMesh )
    // Now hide it as default
    this.coneMesh.visible = false
  }

  makeShaderMaterial() {
    var self = this
    self.params = {
      anglePower: 0.01,
      attenuation: 3.1, // length of light cone
    }
    self.materialVolumetric = new THREE.ShaderMaterial({
      uniforms: { 
        attenuation	: {
          type	: 'f',
          value	: self.params.attenuation
        },
        anglePower	: {
          type	: 'f',
          value	: 1.2
        },
        spotPosition		: {
          type	: 'v3',
          value	: new THREE.Vector3( 0, 0, 0 )
        },
        lightColor	: {
          type	: 'c',
          value	: new THREE.Color('grey')
        },
      },
      vertexShader: godRaysShaders.godrayVShader,
      fragmentShader: godRaysShaders.godrayFShader,
      // side		: THREE.DoubleSide,
      // blending	: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    })
  }

	componentDidUpdate(props) {
		if (props.keyPressed === this.oldKeyPressed) {
      // console.log('same')
      // setFreq(val)
    }
    else {
      // console.log('a new one')
      this.oldKeyPressed = props.keyPressed
      this.pressDownKey(props.keyPressed)
      // this.playKey({keyIndex: props.keyPressed})
    }
    // TODO: Listen to onKeyUp
    
    // buttonCommand
    // console.log('buttonCommand')
    if (props.buttonCommand === this.oldKeyPressed) {
      // console.log('same')
      // setFreq(val)
    }
	}

  setupEventTracking() {
    var self = this
    // Start
    this.canvas.addEventListener('pointerdown', (e) => {
      self.onMouseDown(e)
    });
    this.canvas.addEventListener('touchstart', (e) => {
      self.onMouseDown(e)
    });
    
    // On moving
    window.addEventListener('touchmove', (e) => {
      self.onMouseMove(e)
    }, false);
    window.addEventListener('pointermove', (e) => {
      self.onMouseMove(e)
    }, false);
    
    // End
    this.canvas.addEventListener('pointerup', (e) => {
      self.onMouseUp(e)
    });
    this.canvas.addEventListener('touchend', (e) => {
      self.onMouseUp(e)
    });

    // window.addEventListener('touchstart', self.onMouseMove.bind(this), false);
    // window.addEventListener('touchstart', self.onMouseMove.bind(this), false);
  }

  setTheScene() {
    var self = this
    // let { cubeTextureLoader canvas, environmentMap, scene, gui, debugObject } = this.state
    this.canvas = document.querySelector('.webgl')
    // this.environmentMap = this.cubeTextureLoader.load([
    //     '/textures/environmentMaps/0/px.jpg',
    //     '/textures/environmentMaps/0/nx.jpg',
    //     '/textures/environmentMaps/0/py.jpg',
    //     '/textures/environmentMaps/0/ny.jpg',
    //     '/textures/environmentMaps/0/pz.jpg',
    //     '/textures/environmentMaps/0/nz.jpg'
    // ])
    // this.environmentMap.encoding = THREE.sRGBEncoding

    // self.scene.background = self.environmentMap
    // this.scene.environment = this.environmentMap

    // Add fog
    this.scene.background = this.theme.light.fogColor;
    // this.scene.fog = new THREE.Fog(fogColor, 0.0025, 20);

    // this.scene.
    // self.renderer.clearColor(0x000000)

    this.debugObject.envMapIntensity = 0 // 0.301
    this.gui.add(this.debugObject, 'envMapIntensity').min(0).max(10).step(0.001).onChange(self.updateAllMaterials)
  }

  // Load the scene
  // Here we put all the buttons and sliders into interactable objects
  load3Dobjects() {
    var self = this
    // const { gltfLoader, scene, gui, objectsToTest, allKeys } = this.state
    self.gltfLoader.load(
      // '/models/Keyboard/lagoon-3D-synth-1.0.gltf',
      
      // Old and working
      // '/models/Keyboard/3D-synth-1k.gltf',
      
      // New
      // '/models/Keyboard/new/lagoon-3D-synth-2.0.gltf',
      // '/models/Keyboard/new/lagoon-3D-synth-2.0.1.gltf',
      // '/models/Keyboard/new/lagoon-3D-synth-2.1.1.gltf',
      // '/models/Keyboard/new/lagoon-3D-synth-2.2.0.gltf',
      // '/models/Keyboard/new/lagoon-3D-synth-2.2.0_modifier_applied_n_baked.gltf',

      modelPath,

      // parse through gltf file
      (gltf) => {
        // console.log(gltf.scene.children)
        // gltf.scene.scale.set(10, 10, 10)
        // gltf.scene.position.set(0, 0, 0.5)
        // gltf.scene.rotation.y = Math.PI * 0.5
        self.scene.add(gltf.scene)

        // Add each object to array of objects that are tracked
        // objectsToTest.push(scene)

        self.gui.add(gltf.scene.rotation, 'y').min(- Math.PI).max(Math.PI).step(0.001).name('rotation')

        self.updateAllMaterials()
        
        const children = [...gltf.scene.children]
        // for (const child of children) {
        // let keyIncrement = 0
        children.forEach( (child, index) => {
          // Log all children
          console.log(child.name)

          if (
            child.name.includes('SwitchWave1Cutout') ||
            child.name.includes('capsule') ||
            child.name.includes('SwitchPowerCutout')
          ) {
            child.visible = false
          }

          if (child.name.includes('cabinet')) {
            
            console.log('it is a cabinet')
            // child.visible = false
            console.log('before')
            console.log(child.material.map)
            
            // console.log(child.name)
            
            const keys = [...child.children]
            // let image = self.textureLoader.load('/textures/cabinet/cabinet-new-1.1.png')
            // let image = self.textureLoader.load('/textures/cabinet/lagoon_2.1.1_cabinet_baked.jpg')
            
            // let image = self.textureLoader.load('/textures/cabinet/lagoon_2.1.1_cabinet_baked_w_text.jpg')
            // let textureEmissive = self.textureLoader.load('/textures/cabinet/lagoon_2.1.1_cabinet_baked_w_text_emissive.jpg')

            let image = self.textureLoader.load( textureDiffusePath )
            let textureEmissive = self.textureLoader.load( textureEmissivePath )
            
            // image.encoding = THREE.sRGBEncoding;

            image.flipY = false;
            textureEmissive.flipY = false;
            
            // Add image to material
            child.material.map = image
            child.material.emissiveMap = textureEmissive
            child.material.emissive = new THREE.Color(0xffffff)
            
            // console.log('after')
            // console.log(child.material)

            // Set emmisive map

            
            // console.log(child)
            for (const key of keys) {
              //
              self.objectsToTest.push(key)
              
              // Lets print each mesh name
              // console.log('key')
              // Log all scene names
              // console.log(key.name)

              // Parse all the key names from Blender and format
              // them so they are understood by the audio engine
              if (key.name.includes('Key')) {
                // child.castShadow = false
                var keyIndex = key.name.split(/[@-]/);
                // console.log(keyIndex)
                key.keyIndex = parseInt(keyIndex[1])
                key.noteName = keyIndex[2]
                // console.log('key index: ', key.keyIndex)
                self.allKeys.push(key)
                // keyIncrement++
              }

              if (key.name.includes('ScreenArea')) {
                self.screenArea = key
    
                console.log(' - - - - - - got a ScreenArea - - - - - - ')
                // now that we have the screen area we can make the touch indicator
                self.createScreenTouchShape()
              }

              // Slider range
              if (
                key.name.includes('SliderHandle')
              ) {
                let sliderIndex = parseInt(key.name.slice(12)) - 1
                // console.log('checks out: ', sliderIndex)
                // Store the original in order to make rules when moving it around
                self.objectOriginals[ sliderIndex ] = {name: key.name, obj: key, orgPos: key.position.clone()}
                self.curGuiObjects.push( key )
              }
              else if (
                key.name.includes('SwitchWave')
              ) {
                // Add 4 because numbering can not start from zero
                // let sliderIndex = (parseInt(key.name.slice(10)) - 1) + 4
                let sliderIndex = parseInt(key.name.slice(10)) - 1
                // console.log('sliderIndex')
                // console.log(sliderIndex)
                self.stepSliderOriginals[ sliderIndex ] = {name: key.name, obj: key, orgPos: key.position.clone()}
                self.curGuiObjects.push( key )
                // console.log('self.stepSliderOriginals')
                // console.log(self.stepSliderOriginals)
              }
              
              // KnobGlide
              // if (key.name === 'KnobGlide') {
              //   // Store the original in order to make rules when moving it around
              //   self.objectOriginals[2] = {name: key.name, obj: key, orgPos: key.position.clone()}
              // }

              // KnobFilterCutoff
              if (key.name === 'KnobFilterCutoff') {
                // Store the original in order to make rules when moving it around
                self.objectOriginals[2] = {name: key.name, obj: key, orgPos: key.position.clone()}
                // self.curGuiObjects.push( key )
              }
              
              // KnobFilterResonance
              if (key.name === 'KnobFilterResonance') {
                self.objectOriginals[2] = {name: key.name, obj: key, orgPos: key.position.clone()}
              }
              
              // KnobFilterEGInt
              if (key.name === 'KnobFilterEGInt') {
                self.objectOriginals[2] = {name: key.name, obj: key, orgPos: key.position.clone()}
              }

              if (
                key.name === 'KnobFilterCutoff_big'
              ) {
                key.visible = false
              }

              // self.setDragControls()
              // console.log('child name')
              // console.log(child.name)
            }
          }
          // If test sphere hide it
          if (child.name === 'Sphere') {
            child.visible = false              
          }
          // If test sphere hide it
          if (child.name === 'cabinet') {
            child.castShadow = false          
          }
          if (
            child.name === 'Floor'
          ) {
            child.visible = false
            // child.material = new THREE.MeshStandardMaterial({ color: 0xff0000 })
            // alert(child)
          }
        })
      }
    )
  }

  set3DScene() {
    var self = this
    // let { directionalLight, ambientLight, camera, canvas, scene, sizes, renderer, gui } = this.state
    /**
     * Lights
     */
    self.directionalLight = new THREE.DirectionalLight('#ffffff', 3.7)
    // self.directionalLight = new THREE.DirectionalLight('#ffffff', 10)
    self.directionalLight.castShadow = true
    self.directionalLight.shadow.camera.far = 15
    self.directionalLight.shadow.mapSize.set(512, 512)
    self.directionalLight.shadow.normalBias = 0.05
    self.directionalLight.position.set(0, 3, lightZ)
    self.scene.add(self.directionalLight)
    
    self.ambientLight = new THREE.AmbientLight('#ff0000', 1)
    // self.scene.add(self.ambientLight)

    // gui.addColor(ambientLight, 'color').name('amb light color')
    // gui.add(ambientLight, 'intensity').min(0).max(1).step(0.01).name('amb light Intensity')
    self.gui.add(self.directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')
    self.gui.add(self.directionalLight.position, 'x').min(- 5).max(5).step(0.001).name('lightX')
    self.gui.add(self.directionalLight.position, 'y').min(- 5).max(5).step(0.001).name('lightY')
    self.gui.add(self.directionalLight.position, 'z').min(- 5).max(5).step(0.001).name('lightZ')

    window.addEventListener('resize', this.onResize.bind(this))

    window.addEventListener('pointermove', self.pointerEventHappens.bind(this), false)

    self.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    /**
     * Camera
     */
    // Base camera
    self.camera = new THREE.PerspectiveCamera(35, self.sizes.width / self.sizes.height, 0.1, 100)
    // camera = new THREE.OrthographicCamera( sizes.width / - 2, sizes.width / 2, sizes.height / 2, self.sizes.height / - 2, 1, 1000 );
    // camera = new THREE.PerspectiveCamera(75, 1280 / 720, 0.1, 100)
    // camera.position.set(4, 1, - 4) // Helmet
    // camera.position.set(1, 2, -1)

    self.camera.position.set(0, 4, 0)
    
    // camera.rotation.y = Math.PI / 2
    // camera.lookAt(new THREE.Vector3(0,0,0))
    self.scene.add(self.camera)

    /**
     * Renderer
     */
    
    self.renderer = new THREE.WebGLRenderer({
      canvas: self.canvas,
      // canvas: document.querySelector('.webgl'),
      antialias: true
    })

    // alert(renderer)
    // console.log('renderer')
    // console.log(self.renderer)
    
    self.renderer.physicallyCorrectLights = true
    self.renderer.outputEncoding = THREE.sRGBEncoding
    self.renderer.toneMapping = THREE.ACESFilmicToneMapping
    self.renderer.toneMappingExposure = 1.28
    // Shadow enable - start
    // self.renderer.shadowMap.enabled = true
    // self.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // Shadow enable - end
    self.renderer.setSize(self.sizes.width, self.sizes.height)
    self.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // if (use_orbit_controls) {
    // }

    self.gui
      .add(self.renderer, 'toneMapping', {
        No: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping
      })
      .onFinishChange(() => {
          self.renderer.toneMapping = Number(self.renderer.toneMapping)
          self.updateAllMaterials()
      })
    self.gui.add(self.renderer, 'toneMappingExposure').min(0).max(10).step(0.001)

    // For purpose of testing raycast
    // const object1 = new THREE.Mesh(
    //   new THREE.SphereGeometry(0.5, 16, 16),
    //   new THREE.MeshBasicMaterial({ color: '#ff0000' })
    // )
    // object1.position.x = - 2
    // self.scene.add(object1)
    // self.objectsToTest.push(object1) 

    // window.requestAnimationFrame(self.tick)
  }

  makeFloorMaterial() {
    var self = this
    // let { bakedShadow, textureLoader, materialFloor, scene } = this.state
    self.bakedShadow = self.textureLoader.load('/textures/bakedShadows/plane-bake-1.png')
    const bakedFloorTextureAlphaMap = self.textureLoader.load( '/textures/bakedFloor_alphaMap.png' ) // Mine from landscape-playground.blend
    const aoMap = self.textureLoader.load('/textures/ao/plane-bake-ao.jpg')
    self.materialFloor = new THREE.MeshStandardMaterial({
      map: self.bakedShadow,
      alphaMap: bakedFloorTextureAlphaMap,
      aoMap: aoMap,
      aoMapIntensity: 1,
      transparent: true
    })
    self.materialFloor.roughness = 0.7
    const plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(5, 5),
      self.materialFloor
    )
    // plane.receiveShadow = true
    plane.scale.set(1.2,1.2,1.2)
    plane.rotation.x = - Math.PI * 0.5
    plane.position.x = 0.01
    plane.position.z = 0.01
    // plane.position.z = 2
    self.scene.add(plane)
  }

  updateAllMaterials() {
    var self = this
    // var { debugObject, scene } = this.state
    self.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        // child.material.envMap = environmentMap
        child.material.envMapIntensity = self.debugObject.envMapIntensity
        child.material.needsUpdate = true
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }

  setOrbitControls() {
    var self = this
    // console.log(self)
    // const { controls, camera, renderer } = this.state
    // Controls
    // alert(renderer)
    self.controls = new OrbitControls(self.camera, self.renderer.domElement)
    self.controls.enableDamping = true
    self.controls.enablePan = false
    self.controls.minDistance = 2
    self.controls.maxDistance = 12
    // Set max polar angle
    self.controls.maxPolarAngle = (Math.PI * 0.5) * 0.99
    self.controls.zoomSpeed = 0.4
    // self.controls.enabled = false
    // Disable
    // self.controls.enabled = use_orbit_controls ? true : false
    self.controls.addEventListener('change', () => {
      // self.props.resetCam = 1
      // self.tickTock()
      // console.log('camPos: ', self.camera.position)
    });
    
    // self.controls.addEventListener('mousedown', () => {
    //   console.log('check this out')
    // }, false)
  }

  checkIfTouch(e) {
    var thisX, thisY
    if (e.touches !== undefined) {
      thisX = e.touches[0].pageX
      thisY = e.touches[0].pageY
    }
    else {
      thisX = e.clientX
      thisY = e.clientY
    }
    return { x: thisX, y: thisY }
  }

  select(type, moduleIndex) {
		const { module } = this.props;
		// const audio = new Audio("/sounds/switch.mp3");
		// audio.play();
    console.log(module)
    // this.props.vco[1].type = 'sine'
		this.props.setParam(module, moduleIndex, "type", type);
	}

  // setRules(r) {
  //   var self = this
  //   let control = self.controlsTransform
  //   control.setMode( "translate" )
  //   control.showX = r.sX ? r.sX : true
  //   control.showY = r.sY ? r.sY : true
  //   control.showZ = r.sZ ? r.sZ : true
  // }
  
  onMouseDown(e) {
    var self = this
    console.log('pointer down')
    // console.log(self.INTERSECTS.length)
    self.mouseIsDown = true
    // console.log('self.INTERSECTS[0].object.name')
    // console.log(self.INTERSECTS[0].object.name)
    if (self.INTERSECTS.length > 0) {
      this.controls.enabled = false

      console.log('self.INTERSECTS[0].object')
      console.log(self.INTERSECTS[0].object)

      if (self.INTERSECTS[0].object.name === 'ScreenArea') {
        // self.setScreenTouchShapePosition( self.INTERSECTS[0].object )
        self.setScreenTouchShapePosition()
      }

      if (
        self.INTERSECTS[0].object.name.includes('SliderHandle') ||
        self.INTERSECTS[0].object.name.includes('SwitchWave')
      ) {
        // console.log('contains SwitchWave')
        // console.log(self.INTERSECTS[0].point)
        self.curGuiObject = self.INTERSECTS[0].object
        self.pIntersect.copy(self.INTERSECTS[0].point);
        self.plane.setFromNormalAndCoplanarPoint(self.pNormal, self.pIntersect);
        self.shift.subVectors(self.INTERSECTS[0].object.position, self.INTERSECTS[0].point);
        self.isDragging = true;
        self.dragObject = self.curGuiObject
      }
      else if (
        self.INTERSECTS[0].object.name === 'KnobOsc1Detune' ||
        self.INTERSECTS[0].object.name === 'KnobOsc1Semitones' ||
        self.INTERSECTS[0].object.name === 'KnobOsc2Detune' ||
        self.INTERSECTS[0].object.name === 'KnobOsc2Semitones' ||
        self.INTERSECTS[0].object.name === 'KnobGlide' ||
        self.INTERSECTS[0].object.name === 'KnobOctave' ||
        self.INTERSECTS[0].object.name === 'KnobFilterCutoff' ||
        self.INTERSECTS[0].object.name === 'KnobFilterResonance' ||
        self.INTERSECTS[0].object.name === 'KnobFilterEGInt' ||
        self.INTERSECTS[0].object.name === 'KnobFXsReverb' ||
        self.INTERSECTS[0].object.name === 'KnobFXsDelay' ||
        self.INTERSECTS[0].object.name === 'KnobFXsFlanger' ||
        self.INTERSECTS[0].object.name === 'KnobFXsDistort' ||
        self.INTERSECTS[0].object.name === 'KnobWave2' ||
        self.INTERSECTS[0].object.name === 'KnobWave2.001' ||
        self.INTERSECTS[0].object.name === 'Pitchbend' ||
        self.INTERSECTS[0].object.name === 'ScreenArea'
      ) {
        self.curGuiObject = self.INTERSECTS[0].object
      }

      // Set dragpower to either sensitive or less sensitive
      this.dragPower = self.INTERSECTS[0].object.name === 'Pitchbend' ? 0.04 : 0.1
      
    }
  }
  
  onMouseUp(e) {
    let self = this
    console.log('mouse up')
    console.log('self.curGuiObject')
    console.log(self.curGuiObject)

    const resetOnMouseUpLocal = () => {
      self.mouseIsDown = false
      self.isDragging = false
      // Empty the curGuiObject
      self.curGuiObject = null
      self.controls.enabled = true

      // self.INTERSECTS.object.name = self.INTERSECTS ?? ''
      // self.INTERSECTS != null || self.INTERSECTS != undefined 
      if (
        self.INTERSECTS.hasOwnProperty('object')
      ) {
        self.INTERSECTS.object.name = ''
      }
    }

    if (self.curGuiObject != null || self.curGuiObject != undefined) {
      // Tween Pitchbend back to zero
      if (self.curGuiObject.name === 'Pitchbend') {
        gsap.to(self.curGuiObject.rotation, 0.3, {
          z: 0,
          onUpdate: () => {
            // Set the pitchbend
            // const zVal = Math.round(gsap.getProperty(this.targets()[0], "z"))
            // var pitchBendVal = map(zVal, -2.4, 2.4, -40, 40)
            var pitchBendVal = map(self.curGuiObject.rotation.z, -2.4, 2.4, -40, 40)
            self.props.pitchbend.value = pitchBendVal
            console.log('tweening back: ', pitchBendVal)
          },
          onComplete: () => {
            resetOnMouseUpLocal()
          }
        })
      }
      else {
        resetOnMouseUpLocal()
      }
    }
  }

  // onMouseMove
  onMouseMove(e) {
    var self = this

    // https://stackoverflow.com/questions/38314521/change-color-of-mesh-using-mouseover-in-three-js
    // Get the picking ray from the point. https://jsfiddle.net/wilt/52ejur45/
    self.realMouse.x = e.touches ? e.touches[0].pageX : e.clientX
    self.realMouse.y = e.touches ? e.touches[0].pageY : e.clientY

    self.mouse.x = self.realMouse.x / window.innerWidth * 2 - 1
    self.mouse.y = - (self.realMouse.y / window.innerHeight) * 2 + 1

    self.raycaster.setFromCamera(self.mouse, self.camera);
		
    // The rules for how the GUI behave when dragged
    if (self.mouseIsDown && self.curGuiObject !== null) {
      // console.log(self.curGuiObject.name)
      // Its the SliderHandle1
      let sliderIndex
      let sliderArray = []

      // The 4 ADSR sliders
      if (self.curGuiObject.name.includes('SliderHandle')) {
        sliderIndex = parseInt(self.curGuiObject.name.slice(12)) - 1
        sliderArray = self.objectOriginals
      }
      // The 4 ADSR sliders
      // else if (self.curGuiObject.name.includes('SliderHandle')) {
      //   sliderIndex = parseInt(self.curGuiObject.name.slice(12)) - 1
      //   sliderArray = self.objectOriginals
      // }
      else if (self.curGuiObject.name.includes('SwitchWave')) {
        sliderIndex = parseInt(self.curGuiObject.name.slice(10)) - 1
        sliderArray = self.stepSliderOriginals
        // console.log('sliderArray')
        // console.log(sliderArray)
      }
      
      // If ScreenArea
      if (self.INTERSECTS != null && self.INTERSECTS != undefined) {
        console.log('ScreenArea')

        self.setScreenTouchShapePosition()
        // if (self.INTERSECTS[0].object.name === 'ScreenArea' && self.INTERSECTS[0].object != undefined) {
        // }
      }
      // console.log('SwitchWave')
      // console.log(self.curGuiObject.name.includes('SwitchWave'))
      
      // **********************************
      // It is a Slider or a Switch - start
      if (
        self.curGuiObject.name.includes('SliderHandle') ||
        self.curGuiObject.name.includes('SwitchWave')
      ) {
        // console.log(sliderIndex)
        var object = self.curGuiObject
        if (self.isDragging) {
          self.raycaster.ray.intersectPlane(self.plane, self.planeIntersect);
          object.position.addVectors(self.planeIntersect, self.shift);
        }
        // object.position.z = pos.z;
        // console.log(sliderArray)
        
        // console.log('sliderArray[ sliderIndex ].orgPos.z')
        // console.log(sliderArray[ sliderIndex ].orgPos.z)
        
        // return
        object.position.x = sliderArray[ sliderIndex ].orgPos.x
        object.position.y = sliderArray[ sliderIndex ].orgPos.y
        // object.position.z = self.mouse.y
        
        // Check if it includes SliderHandle,
        // the ADSR slider, but not the master gain.
        if (
          self.curGuiObject.name.includes('SliderHandle') &&
          !self.curGuiObject.name.includes('SliderHandle1SliderMasterGain')
        ) {
          // Min max logic - Range slider - start
          if (object.position.z < sliderArray[ sliderIndex ].orgPos.z) {
            object.position.z = sliderArray[ sliderIndex ].orgPos.z
          }
          if (object.position.z > sliderMinRange) {
            object.position.z = sliderMinRange
          }
          // Min max logic - Range slider - end
        }
        
        if (self.curGuiObject.name.includes('SliderHandle1SliderMasterGain')) {
          // Min max logic - Range slider - start
          if (object.position.z < sliderArray[ sliderIndex ].orgPos.z) {
            object.position.z = sliderArray[ sliderIndex ].orgPos.z
          }
          if (object.position.z > sliderMinRangeMasterGain) {
            object.position.z = sliderMinRangeMasterGain
          }
          console.log('object.position.z')
          console.log(object.position.z)
          // Min max logic - Range slider - end
        }
        
        // Logic for SwitchWave - stepSliders. What wavetype
        if (self.curGuiObject.name.includes('SwitchWave')) {

          // Min max logic - Switch - start
          if (object.position.z < sliderArray[ sliderIndex ].orgPos.z) {
            object.position.z = sliderArray[ sliderIndex ].orgPos.z
          }
          if (object.position.z > sliderMinSteps) {
            object.position.z = sliderMinSteps
          }
          // Min max logic - Switch - end

          let startPosZ = sliderArray[ sliderIndex ].orgPos.z
          let interval = sliderMinSteps - sliderArray[ sliderIndex ].orgPos.z

          console.log('interval')
          console.log(interval)

          // let sumP = interval + startPosZ
          // Divide the distance in three steps
          let steps = [
            (interval / 4) + startPosZ,
            (interval / 2) + startPosZ,
            ((interval / 2) + (interval / 3)) + startPosZ
          ]
          const extra = 0.025 // A little extra until a better calc is made
          // console.log('sumP / 4 : ', (interval / 4).toFixed(2))
          // console.log('position z: ', object.position.z.toFixed(2))
          if (object.position.z < steps[0]) {
            object.position.z = startPosZ
            // TweenMax.to(object.position, 0.2, {z: startPosZ})
            // console.log('sine')
            this.select('sine', sliderIndex)
          }
          else if ( object.position.z > steps[0] && object.position.z < steps[1] ) {
            object.position.z = steps[0] + extra
            // TweenMax.to(object.position, 0.2, {z: steps[0] + extra})
            // console.log('triangle')
            this.select('triangle', sliderIndex)
          }
          else if ( object.position.z > steps[1] && object.position.z < steps[2] ) {
            object.position.z = steps[1] + extra
            // TweenMax.to(object.position, 0.2, {z: steps[1] + extra})
            // console.log('square')
            this.select('square', sliderIndex)
          }
          else if ( object.position.z > steps[2] ) {
            object.position.z = steps[2] + extra
            // TweenMax.to(object.position, 0.2, {z: steps[2] + extra})
            // console.log('sawtooth')
            this.select('sawtooth', sliderIndex)
          }
          // if (object.position.z > sliderMin) {
          //   object.position.z = sliderMin
          // }
        }

        var min, max
        // Is it the filter slider
        if (self.curGuiObject.name === 'SliderHandle1SliderMasterGain') {
          min = 0.001
          max = 10
        }
        else if (self.curGuiObject.name === 'SliderHandle2EnvelopeA'
              || self.curGuiObject.name === 'SliderHandle3EnvelopeD'
              || self.curGuiObject.name === 'SliderHandle5EnvelopeR'
        ) {
          min = 0.001
          max = 10
        }
        else if (self.curGuiObject.name === 'SliderHandle4EnvelopeS') {
          min = 0
          max = 100
        }
        // Is it the wavetype 1
        else if (self.curGuiObject.name === 'SwitchWave1Osc1WavetypeThumb') {
          min = 0
          max = 3
        }

        // Now make the remapped value
        let mappedValue
        // console.log(object.position.z)
        // SliderHandle
        if (self.curGuiObject.name.includes('SliderHandle')) {
          mappedValue = map(
            object.position.z,
            sliderMinRange,
            self.objectOriginals[ sliderIndex ].orgPos.z,
            min,
            max
          )
        }
        // SwitchWave
        else if (self.curGuiObject.name.includes('SwitchWave')) {
          mappedValue = map(
            object.position.z,
            0.3,
            self.stepSliderOriginals[ sliderIndex ].orgPos.z,
            min,
            max
          )
        }

        if (self.curGuiObject.name === 'SliderHandle1SliderMasterGain')
          this.props.filter.frequency = mappedValue
        if (self.curGuiObject.name === 'SliderHandle2EnvelopeA')
          this.props.envelope.attack = mappedValue
        if (self.curGuiObject.name === 'SliderHandle3EnvelopeD')
          this.props.envelope.decay = mappedValue
        if (self.curGuiObject.name === 'SliderHandle4EnvelopeS')
          this.props.envelope.sustain = mappedValue
        if (self.curGuiObject.name === 'SliderHandle5EnvelopeR')
          this.props.envelope.release = mappedValue
        // Is it the wavetype 1
        if (self.curGuiObject.name === 'SwitchWave1Osc1WavetypeThumb')
          this.props.vco[ 0 ].type = 'sine'
        // console.log(this.props.envelope)
        // console.log(mappedValue2)
      }
      // **********************************
      // It is a Slider or a Switch - end
      
      // **********************************
      // Its a 'Knob' - start
      if (
        self.curGuiObject.name === 'KnobOsc1Detune' ||
        self.curGuiObject.name === 'KnobOsc1Semitones' ||
        self.curGuiObject.name === 'KnobOsc2Detune' ||
        self.curGuiObject.name === 'KnobOsc2Semitones' ||
        self.curGuiObject.name === 'KnobGlide' ||
        self.curGuiObject.name === 'KnobOctave' ||
        self.curGuiObject.name === 'KnobFilterCutoff' ||
        self.curGuiObject.name === 'KnobFilterResonance' ||
        self.curGuiObject.name === 'KnobFilterEGInt' ||
        // Not yet working
        self.curGuiObject.name === 'KnobOsc3Detune' ||
        self.curGuiObject.name === 'KnobOsc3Semitones' ||
        self.curGuiObject.name === 'KnobFXsReverb' ||
        self.curGuiObject.name === 'KnobFXsDelay' ||
        self.curGuiObject.name === 'KnobFXsFlanger' ||
        self.curGuiObject.name === 'KnobFXsDistort' ||
        self.curGuiObject.name === 'KnobFXsTremolo1' ||
        self.curGuiObject.name === 'KnobFXsTremolo2' ||
        self.curGuiObject.name === 'Pitchbend'
      ) {
        if (this.currentX < self.realMouse.x) {
          console.log('up')
          self.dragDir = -self.dragPower
        }
        else if (this.currentX > self.realMouse.x) {
          console.log('down')
          self.dragDir = self.dragPower
        }
        this.currentX = self.realMouse.x
        // self.curGuiObject.rotation.y -= rotValue

        // Rotate the TUI
        if (self.curGuiObject.name === 'Pitchbend') {
          self.curGuiObject.rotation.z += self.dragDir

          // Set the pitchbend
          var pitchBendVal = map(self.curGuiObject.rotation.z, -2.4, 2.4, -40, 40)
          this.props.pitchbend.value = pitchBendVal
        }
        else {
          self.curGuiObject.rotation.y += self.dragDir
        }
        // self.curGuiObject.rotation.y += self.dragDir

        // console.log('rotation x: ', self.curGuiObject.rotation.y)
        // console.log(self.curGuiObject.rotation.y)
        
        var reverbVal = map(self.curGuiObject.rotation.y, -2.4, 2.4, 0, 1)
        this.props.reverb.value = reverbVal

        // Set min and max limit for knob
        // Rotate the TUI
        if (self.curGuiObject.name === 'Pitchbend') {
          if (self.curGuiObject.rotation.z < -0.6) {
            self.curGuiObject.rotation.z = -0.6;
          } else if (self.curGuiObject.rotation.z > 0.6) {
            self.curGuiObject.rotation.z = 0.6;
          }
        }
        else {
          if (self.curGuiObject.rotation.y < -2.4) {
            self.curGuiObject.rotation.y = -2.4;
          } else if (self.curGuiObject.rotation.y > 2.4) {
            self.curGuiObject.rotation.y = 2.4;
          }
        }
        
        // *TODO: decide what each should control
        
        // - - - - - Detune and Semitones
        // KnobOsc1Detune -
        if (self.curGuiObject.name === 'KnobOsc1Detune') {
          var knobOsc1DetuneVal = map(self.curGuiObject.rotation.y, -2.4, 2.4, 50, -50)
          this.props.vco[0].detune = knobOsc1DetuneVal
        }

        // KnobOsc1Semitones -
        if (self.curGuiObject.name === 'KnobOsc1Semitones') {
          var semitoneVal1 = map(self.curGuiObject.rotation.y, -2.4, 2.4, 24, -24)
          this.props.vco[0].semitones = semitoneVal1
        }
        
        // KnobOsc1Detune -
        if (self.curGuiObject.name === 'KnobOsc2Detune') {
          var knobOsc2DetuneVal = map(self.curGuiObject.rotation.y, -2.4, 2.4, 50, -50)
          this.props.vco[1].detune = knobOsc2DetuneVal
        }

        // KnobOsc1Semitones -
        if (self.curGuiObject.name === 'KnobOsc2Semitones') {
          var semitoneVal2 = map(self.curGuiObject.rotation.y, -2.4, 2.4, 24, -24)
          this.props.vco[1].semitones = semitoneVal2
        }

        // - - - - -
        
        // KnobGlide - glide
        if (self.curGuiObject.name === 'KnobGlide') {
          var glideVal = map(self.curGuiObject.rotation.y, -2.4, 2.4, 3, 0)
          this.props.general.glide = glideVal
        }
        
        if (self.curGuiObject.name === 'KnobOctave') {
          var octaveVal = Math.floor(map(self.curGuiObject.rotation.y, -2.4, 2.4, 3, -2))
          this.props.general.octave = octaveVal
        }
        
        // KnobFilterCutoff
        if (self.curGuiObject.name === 'KnobFilterCutoff') {
          var filterFreq = map(self.curGuiObject.rotation.y, -2.4, 2.4, 4000, 1)
          // this.props.reverb.value = reverbVal
          this.props.filter.frequency = filterFreq
        }
        
        // KnobFilterResonance
        if (self.curGuiObject.name === 'KnobFilterResonance') {
          var filterRes = map(self.curGuiObject.rotation.y, -2.4, 2.4, 100, 0)
          // this.props.reverb.value = reverbVal
          this.props.filter.resonance = filterRes
          console.log('it should change alright: ', filterRes)
        }
        
        // KnobFilterResonance
        // if (self.curGuiObject.name === 'KnobFilterResonance') {
        //   var filterRes = map(self.curGuiObject.rotation.y, -2.4, 2.4, 100, 0)
        //   // this.props.reverb.value = reverbVal
        //   this.props.filter.resonance = filterRes
        //   console.log('it should change alright: ', filterRes)
        // }

        // KnobFXsReverb
        if (self.curGuiObject.name === 'KnobFXsReverb') {
          var fxReverb = map(self.curGuiObject.rotation.y, -2.4, 2.4, 1, 0)
          this.props.fxs.reverb.dry = 1.0 - fxReverb
          this.props.fxs.reverb.wet = fxReverb
          // console.log('it should change alright: ', fxReverb)
        }
        
        // KnobFXsDelay
        if (self.curGuiObject.name === 'KnobFXsDelay') {
          var fxDelay = map(self.curGuiObject.rotation.y, -2.4, 2.4, 1.5, 0)
          this.props.fxs.delay.time = fxDelay
          console.log('it should change delay alright: ', fxDelay)
        }

        // KnobFXsFlanger
        if (self.curGuiObject.name === 'KnobFXsFlanger') {
          var fxFlanger = map(self.curGuiObject.rotation.y, -2.4, 2.4, 5, 0)
          // this.props.reverb.value = reverbVal
          // this.props.fxs.flanger.delay = fxFlanger
          this.props.fxs.flanger.speed = fxFlanger
          // console.log('it should change alright: ', fxFlanger)
        }
        
        // KnobFXsDistort
        if (self.curGuiObject.name === 'KnobFXsDistort') {
          var distortionValue = map(self.curGuiObject.rotation.y, -2.4, 2.4, 1, 0)
          this.props.fxs.distortion.gain.dry = 1.0 - distortionValue
          this.props.fxs.distortion.gain.wet = distortionValue
          // console.log('it should change alright: ', 'distortionValue')
        }
      }
      // **********************************
      // Its a 'Knob' - end

      // Its a 'Knob' - start
      if (
        self.curGuiObject.name === 'ScreenArea'
      ) {
        // console.log('we should play the ScreenArea')
      }
    }
  }

  // Function that returns a raycaster to use to find intersecting objects
  // in a scene given screen pos and a camera, and a projector
  getRayCasterFromScreenCoord(screenX, screenY, camera) {
    // var self = this
    var raycaster = new THREE.Raycaster()
    var mouse3D = new THREE.Vector3()
    // Get 3D point form the client x y
    mouse3D.x = (screenX / window.innerWidth) * 2 - 1
    mouse3D.y = -(screenY / window.innerHeight) * 2 + 1
    mouse3D.z = 0.5
    raycaster.setFromCamera(mouse3D, camera)
    return raycaster
  }

  // Add event listener
  pointerEventHappens(e) {
    var self = this
    var mouseCoords = self.checkIfTouch(e)
    if (self.gplane && self.mouseConstraint) {
      var pos = self.projectOntoPlane(mouseCoords.x, mouseCoords.y, self.gplane, self.camera)
      if (pos) {
        var yDiff = self.mouseDownPos.y - pos.y
        self.setClickMarker(pos.x - yDiff ** 2, pos.y, pos.z, self.scene)
        self.moveJointToPoint(pos.x - yDiff ** 2, pos.y, pos.z)
      }
    }
    // return
    // var mouseCoords = self.checkIfTouch(e)
    this.raycaster = self.getRayCasterFromScreenCoord(mouseCoords.x, mouseCoords.y, self.camera)
    // Find the closest intersecting object
    // Now, cast the ray all render objects in the scene to see if they collide. Take the closest one.
    var intersects = this.raycaster.intersectObjects(self.scene.children);

    // Intersected object
    self.intS = self.INTERSECTED
    // self.intersectedObject = self.INTERSECTED // Because intS follows specific hover rules

    // Update particles
    // this.updateParticles()

    // This is where an intersection is detected
    if (intersects.length > 0) {
      if (self.intS !== intersects[0].object) {

        // console.log('there is a hit')
        // console.log(intersects[0].object.name)

        // title_POWER
        if (intersects[0].object.name === 'title_POWER') {
          this.tweenObject(this.camera, 'move camdown')
        }
        // graph1_c
        if (intersects[0].object.name === 'graph1_c') {
          this.tweenObject(this.camera, 'move cam-reset')
        }
        //

        // Tween the raycast hit object
        // self.tweenObject(intersects[ 0 ].object, 'scale')

        // if ( self.intS ) {
        //   self.intS.material.emissive.setHex( self.intS.currentHex );
        // }

        // If it is the plane then nevermind
        if (intersects[0].object.name === 'floor') {
          self.intS = null;
          if (self.showAnnotation) {
            // Here we make everything normal again
            // tooltip *
            // self.popover.classList.remove('visible')
            document.querySelector('.popover').classList.remove('visible')
            self.playAnnotationAnim('backward')
            this.pointerOverWhiteBoard = false
            // Pumpestok
            this.pointerOverPumpeStok = false
            this.groupCoffee.visible = false
          }
          return
        }

        // // If it is the plane then nevermind
        // if (intersects[ 0 ].object.name === 'whiteboard-screen') {
        //   this.pointerOverWhiteBoard = true
        //   return
        // }
        // else {
        //   this.pointerOverWhiteBoard = false
        // }

        self.intS = intersects[0].object;
        // self.intS.currentHex = self.intS.material.emissive.getHex();
        // self.intS.material.emissive.setHex( 0xffffff ); // Hover / highlight material
        // Store the intersected id
        // self.currentId = self.intS.userData.id
        // self.currentObj = sounds[self.currentId]

        if (self.showAnnotation) {
          // tooltip *
          // self.popover.classList.add('visible')
          document.querySelector('.popover').classList.add('visible')
          self.playAnnotationAnim('forward')
        }

      }

      self.intersectedObject = self.intS
      // console.log('self.intersectedObject')
      // console.log(self.intersectedObject)

      // Change cursor
      document.body.style.cursor = 'pointer'
    }
    else {
      // if ( self.intS ) {
      //   self.intS.material.emissive.setHex( self.intS.currentHex );
      // }
      self.intS = null

      if (self.showAnnotation) {
        // alert('should remove')

        // tooltip *
        // self.popover.classList.remove('visible')
        document.querySelector('.popover').classList.remove('visible')
        self.playAnnotationAnim('backward')
      }

      // Change cursor
      document.body.style.cursor = 'default'
    }
    // loop all meshes
    // self.meshes.forEach(element => {
    //   // if (element != self.intS) {
    //   //   element.material.emissive.setHex( 0x000000 );
    //   // }
    //   // console.log(element.currentHex)
    // });
  }

  initTooltipAnim () {
    var self = this
    self.tlTooltip = new gsap.timeline()
      // .to('.info-line', this.stdTime, {height: '100%', ease: Power3.easeInOut}, 'start')
      // .staggerFrom(".lineChild", 0.75, {y:50}, 0.25)
      .staggerFrom('.anim', this.stdTime, {y: 20, autoAlpha: 0, ease: Power4.easeInOut}, 0.1, `start`)
      .pause()
  }

  playAnnotationAnim (kind) {
    var self = this      
    if (kind === 'forward') {
      self.tlTooltip.play()
    }
    else if (kind === 'backward') {
      self.tlTooltip.reverse()
    }      
    // .staggerTo(`#${self.content.id} .anim-selfaware`, 2, {autoAlpha: 1, ease: Sine.easeOut}, 0.25)
  }

  updateScreenPosition() {
    var self = this
    // console.log('update screen position')
    if (
      self.intersectedObject === null ||
      self.intersectedObject.name === ''
    ) {
      return
    }
    var mesh = self.intersectedObject
    // var mesh = self.meshes[0];
    const vector = mesh.position.clone()
    const canvas = self.renderer.domElement
  
    vector.project(self.camera)
  
    vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio))
    vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio))
  
    if (self.showAnnotation) {
      // console.log('update screen position')
      // self.annotation.innerHTML = sounds[self.currentId].name;
      // Place little popover
      // var popoverAttr = self.popover.getBoundingClientRect()
      let popover = document.querySelector('.popover')
      var popoverAttr = popover.getBoundingClientRect()
  
      let extraHeight = -80
      // let extraHeight = mesh.geometry.parameters.height
      // console.log('mesh height')
      // console.log(mesh.geometry)
      // console.log(mesh)

      // Find the right tooltip content
      // const meshInfo = {
      //   title: information.find(child => child.blenderObjectName === 'graph1_b').title,
      // }
      
      // document.querySelector('.annotation__title').innerHTML = information.find(child => child.blenderObjectName === `${mesh.name}`).title
      
      popover.style.top = `${vector.y - (popoverAttr.height / 2) + extraHeight}px`
      popover.style.left = `${vector.x - (popoverAttr.width / 2)}px`

      // if (
      //   self.intersectedObject.name === ''
      // ) {
      //   return
      // }

      const theProperInformation = {
        title: mesh.name
      }
      // const theProperInformation = information.find(child => child.blenderObjectName === `${mesh.name}`)
      // console.log('theProperInformation')
      // console.log(theProperInformation)
      
      // If we are hovering the same old object or there is not mathcing info then leave this method
      if (
        this.intersectedObjectOld === this.intersectedObject ||
        theProperInformation === undefined
      ) {
        return
      }
      document.querySelector('.annotation__textwrapper').innerHTML = 
      '<label class="annotation__title__text bold-it anim-type-axis-y anim">' + theProperInformation.title + '</label>'
      // '</h2>' +
      // '<p class="annotation__subtitle__text anim-type-axis-y anim text-grey">' +
      //   theProperInformation.subtitle +
      // '</p>' +
      // '<p class="annotation__number anim-type-axis-y anim">' +
      //   theProperInformation.number
      // '</p>'

      this.intersectedObjectOld = self.intersectedObject
    }
  }

  tickTock() {
    var self = this
    // console.log('tickTock')

    // Make sure to update the orbit controls
    self.controls.update()

    // Render
    // console.log('rendererrrrrrrrrrr')
    // console.log(self.renderer)
    // return
    // Call tick again on the next frame

    if (self.renderer !== null) {

      self.camera.lookAt(new THREE.Vector3(0,0,0))

      // FXs or not
      // Post-processing
      if (self.enablePostProcessing) {
        self.effectComposer.render()
      }
      else {
        self.renderer.render(self.scene, self.camera)
      }

      // Check intersections
      // Cast a ray from the mouse and handle events
      self.raycaster.setFromCamera(self.mouse, self.camera)

      // objectsToTest = [object1, object2, object3]
      const intersects = self.raycaster.intersectObjects(self.objectsToTest)
      self.INTERSECTS = intersects
      
      // console.log(self.objectsToTest)

      if (intersects.length) {
        // console.log('intersect')
        if (!self.currentIntersect) {
          // console.log('mouse enter')
          // console.log(intersects[0].object)
        }
        self.currentIntersect = intersects[0]
        // self.tweenObject(currentIntersect.object, 1, Math.PI / 2)
        // Set the intersected one
        let obj = self.currentIntersect.object
        // Set material to emissive
        // self.currentHex = obj.material.emissive.getHex();
        // obj.material.emissive.setHex( 0xffffff );

        // console.log(obj.name)
        // console.log(obj)
        self.keyNameNew = obj.name
        // First reset all keys
        for (const key of self.allKeys) {
          TweenMax.to(key.rotation, 1, {x: 0, ease: Expo.easeOut});
        }

        // Set the intersectedObject
        self.intersectedObject = obj

        // console.log(obj.keyIndex)
        // Is it the knob filter
        if (obj instanceof THREE.Mesh && obj.name.includes('KnobFilter')) {
          // TweenMax.to(obj.rotation, 1, {y: Math.PI / 2, ease: Expo.easeOut});
          // console.log('yup')
        }
        // Is it the SliderHandle1
        if (obj instanceof THREE.Mesh && obj.name.includes('SliderHandle1')) {
          // TweenMax.to(obj.rotation, 1, {y: Math.PI / 2, ease: Expo.easeOut});
          // console.log('SliderHandle1')
        }
        // Is it a key
        if (obj instanceof THREE.Mesh && self.keyNameNew.includes('Key')) {
          // console.log('mouse enter')
          // TODO: play key here
          // Temp fix for avoiding playing key when dragging slider
          if (!self.mouseIsDown) {
            self.playKey(obj)
          }
          // console.log(obj)
        }
        else {
          // Stop oscillators as no keys are hovered
          // TODO: stop note
          // self.stopNote()
        }
        if (self.keyNameOld !== self.keyNameNew) {
          self.keyNameOld = self.keyNameNew
          self.hasNotStartedOsc = true
        }
      }
      else {
        if (self.currentIntersect) {
          // console.log('mouse leave')
          for (const key of self.allKeys) {
            TweenMax.to(key.rotation, self.timeOfBarPress, {x: 0, ease: Expo.easeOut});
            // key.material.emissive.setHex( 0x000000 );
          }
          // Tell the synth to stop
          self.playKey(null)
        }
        self.currentIntersect = null
        // console.log('no intersect')
      }

      // Set color of hover
      // for(const intersect of intersects)
      // {
      //     // intersect.object.material.color.set('#0000ff')
      // }
    }

    // Tooltip
    if (self.intersectedObject) {
      self.updateScreenPosition()
      // console.log('we have a hit')
    }

    window.requestAnimationFrame( () => {
      self.tickTock()
    })
  }

  playKey(obj) {
    var self = this
    // console.log('play key')
    if (obj === null) {
      this.props.playTone('empty')
      return
    }
    else {
      this.props.playTone(toneFreq[parseInt(obj.keyIndex)])
    }
    // We receive an order to play key and it comes from the raycaster
    TweenMax.to(obj.rotation, self.timeOfBarPress, {x: self.keyRot, ease: Sine.easeOut});
     // We receive an order to play key and it comes from a key
    if (obj.keyCode) {
      // console.log('is keyboard')
    }
    // Play the one with the keyIndex
    else if (obj.keyIndex) {
      // TODO: Play tone here
      // for (const key of self.allKeys) {
      //   if (obj.keyIndex === 2) {
      //     TweenMax.to(key.rotation, self.timeOfBarPress, {x: 0, ease: Expo.easeOut});
      //   }
      // }
    }   
  }
  
  pressDownKey(obj) {
    var self = this
    // console.log('key pressed: ', obj)
    // Loop through all keys and set their rotation
    self.allKeys.forEach( (key, index) => {
      // This is the one that matches the hit keystroke
      if (obj.noteName === key.noteName) {
        // It is a keyDown event from AudioEngine.js
        if (obj.dir === 'down') {
          TweenMax.to(key.rotation, 0.1, {x: self.keyRot, ease: Sine.easeOut});
        }
        // It is a keyUp event
        else if (obj.dir === 'up') {
          TweenMax.to(key.rotation, 0.1, {x: 0, ease: Sine.easeOut});
        }
      }
      // It is all the others, so make sure to rotate the x back to zero
      else {
        TweenMax.to(key.rotation, self.timeOfBarPress, {x: 0, ease: Sine.easeOut});
      }
    });
  }

  onResetCamera() {
    let self = this
    gsap.to(self.camera.position, 1.4, {x: 0.0, y: 4, z: 0.02, ease: Sine.ease})
  }

  setupKeyPresses() {
    var self = this
    // var { camera } = this.state
    document.addEventListener('keyup', (e) => {
      // console.log('yes: ', e)
      if (e.code === 'KeyR') {
        self.onResetCamera()
      }
      if (e.code === 'Digit1') {
        TweenMax.to(self.camera.position, 1.4, {x: 0.0, y: 2, z: 4, ease: Sine.ease})
      }
      if (e.code === 'Digit2') {
        // x: -0.0008392728285532768, y: 2.4405211221371332, z: 1.9550521244880288
        TweenMax.to(self.camera.position, 1.4, {x: -0.00083, y: 2.44052, z: 1.95505, ease: Sine.ease})
      }
      // If keypress === Å or å
      // Hide or show the 2d version
      if (e.key === 'å') {
        // document.querySelector('.webgl').classList.toggle('webgl--hidden')
      }
      if (e.key === 'o') {
        this.controls.enabled = !this.controls.enabled
      }
      // Setup keyboard keys as keys
      // this.playKey({keyCode: e.code})
      // if (e.code === 'KeyA') {
      // }
    })
  }

  onResize() {
    var self = this
    // var { camera, renderer, sizes } = this.state
    // Update sizes
    if (typeof window !== "undefined") {
      self.sizes = {
        width: window.innerWidth,
        height: window.innerHeight
      }
  
      // Update camera
      self.camera.aspect = self.sizes.width / self.sizes.height
      self.camera.updateProjectionMatrix()
  
      // Update renderer
      self.renderer.setSize(self.sizes.width, self.sizes.height)
      self.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
  }

	render() {
		// const { test } = this.state;
    const { props } = this;
		return (
			<Container>
        <canvas className="webgl" ref="canvas"></canvas>
        <SplashScreen module={"power"} value={props.power.active} />
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		...state.state,
	};
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({setParam}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ThreeView);

// const mapStateToProps = (state) => {
// 	return {
// 		...state.state.onboarding,
// 	};
// };
// const mapDispatchToProps = (dispatch) => {
// 	return bindActionCreators({ onboardingAnimationComplete }, dispatch);
// };

// export default ThreeView
// export default connect(mapStateToProps, mapDispatchToProps)(ThreeView);
