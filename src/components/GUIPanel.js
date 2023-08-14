import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
// New state entity
import { setParam, setBackground, setPower } from "../actions/actions.js";

import { 
  // TweenMax,
  // TimelineMax,
  // Sine,
  // Power3,
  // Power4,
  // Expo
} from 'gsap'

// import styled from "styled-components";

// import './GUIPanel.scss'

// import { map } from '../helpers.js'

// global variables
// const use_orbit_controls = false
// const isBrowser = () => typeof window !== "undefined"

class GUIPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.test = 'Yes'
    // 3D Synth
    // Loaders
    this.buttons = {}
  }
  
  componentDidMount() {
    // console.log('mounting')
    this.setupKeyPresses()
  }

	componentDidUpdate(props) {

    // console.log('props')
    // console.log(props)
    // this.props = props
    // console.log(this.props)

		// if (props.keyPressed === this.oldKeyPressed) {
    //   // console.log('same')
    //   // setFreq(val)
    // }
    // else {
    //   // console.log('a new one')
    //   this.oldKeyPressed = props.keyPressed
    //   this.pressDownKey(props.keyPressed)
    //   // this.playKey({keyIndex: props.keyPressed})
    // }
    // TODO: Listen to onKeyUp
	}

  // setupEventTracking() {
  //   var self = this
  //   // Start
  //   this.canvas.addEventListener('pointerdown', (e) => {
  //     self.onMouseDown(e)
  //   });
  //   this.canvas.addEventListener('touchstart', (e) => {
  //     self.onMouseDown(e)
  //   });
    
  //   // On moving
  //   window.addEventListener('touchmove', (e) => {
  //     self.onMouseMove(e)
  //   }, false);
  //   window.addEventListener('pointermove', (e) => {
  //     self.onMouseMove(e)
  //   }, false);
    
  //   // End
  //   this.canvas.addEventListener('pointerup', (e) => {
  //     self.onMouseUp(e)
  //   });
  //   this.canvas.addEventListener('touchend', (e) => {
  //     self.onMouseUp(e)
  //   });

  //   // window.addEventListener('touchstart', self.onMouseMove.bind(this), false);
  //   // window.addEventListener('touchstart', self.onMouseMove.bind(this), false);
  // }

  // checkIfTouch(e) {
  //   var thisX, thisY
  //   if (e.touches !== undefined) {
  //     thisX = e.touches[0].pageX
  //     thisY = e.touches[0].pageY
  //   }
  //   else {
  //     thisX = e.clientX
  //     thisY = e.clientY
  //   }
  //   return { x: thisX, y: thisY }
  // }

  setupKeyPresses() {
    // var self = this
    // var { camera } = this.state
    document.addEventListener('keyup', (e) => {
      // console.log('yes: ', e)
      // if (e.code === 'KeyR') {
      //   // console.log(camera)
      //   TweenMax.to(self.camera.position, 1.4, {x: 0.0, y: 4, z: 0.02, ease: Sine.ease})
      // }
    })
  }

  onResize() {
    //
  }

  onClick(e) {
    console.log('we be clicking')
    const target = e.target
    const name = target.getAttribute('name')
    // console.log(name)
    // console.log(this.props)
    const { value } = this.props;
    // New state entity
    // this.props.setPower(!value);
    // return

    if (name === 'icon-lock') {
      const panel = document.querySelector('.gui-panel-master')
      if (panel.classList.contains('panel--locked')) {
        target.classList.remove('lock-on')
        panel.classList.remove('panel--locked')
      }
      else {
        target.classList.add('lock-on')
        panel.classList.add('panel--locked')
      }
    }

    if (name === 'icon-reset') {
      this.props.onButtonPressed('icon-reset')
    }

    if (name === 'icon-theme-scene') {
      if (this.props.backgroundColor === undefined) {
        this.props.setBackground(1)
        target.classList.add('theme--dark')
        document.body.classList.add('body--night')
        return
      }
      // If the theme is light, make it dark
      if (this.props.backgroundColor.value === 1) {
        this.props.setBackground(0)
        target.classList.remove('theme--dark')
        document.body.classList.remove('body--night')
        console.log('theme--dark remove')
      }
      // If the theme is dark, make it light
      // else if (this.props.backgroundColor.value === 0) {
      else {
        this.props.setBackground(1)
        target.classList.add('theme--dark')
        document.body.classList.add('body--night')
        console.log('theme--dark add')
      }
    }

  }

	render() {
		// const { props } = this;
		return (
			<div className="gui-panel-master">
        <div className="btn btn-icon toggle icon icon-theme-scene" name="icon-theme-scene" onClick={this.onClick.bind(this)}></div>
        <div className="btn btn-icon icon icon-reset" name="icon-reset" onClick={this.onClick.bind(this)}></div>

        {/* <div className="btn btn-icon icon icon-lock" name="icon-lock" onClick={this.onClick.bind(this)}></div>
        <div className="btn btn-icon toggle icon icon-theme-ui" name="icon-theme-ui" onClick={this.onClick.bind(this)}>
          <div className="btn btn-icon middle-step-icon toggle icon icon-sync-link" name="icon-sync-link" onClick={this.onClick.bind(this)}></div>
        </div>        
        <div className="btn btn-icon toggle icon icon-vfx-bloom" name="icon-vfx-bloom" onClick={this.onClick.bind(this)}></div> */}
        {/* <div className="btn btn-icon toggle icon icon-tooltip-on" name="icon-tooltip-on" onClick={this.onClick.bind(this)}></div> */}
			</div>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		...state.state,
	};
};

// New state entity
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({setParam, setBackground, setPower}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(GUIPanel);
