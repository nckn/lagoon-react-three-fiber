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
    this.setupKeyPresses()
    this.syncThemeUI()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.backgroundColor?.value !== this.props.backgroundColor?.value) {
      this.syncThemeUI()
    }
  }

  syncThemeUI() {
    const themeBtn = document.querySelector('[name="icon-theme-scene"]')
    if (!themeBtn) return
    const isNight = this.props.backgroundColor?.value === 1
    if (isNight) {
      themeBtn.classList.add('theme--dark')
      document.body.classList.add('body--night')
    } else {
      themeBtn.classList.remove('theme--dark')
      document.body.classList.remove('body--night')
    }
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
    const target = e.target
    const name = target.getAttribute('name')

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
      // Toggle between day (0) and night (1)
      const nextValue = this.props.backgroundColor?.value === 1 ? 0 : 1
      this.props.setBackground(nextValue)
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
