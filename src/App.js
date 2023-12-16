import React, { createContext } from "react";
import styled from "styled-components";
import AudioEngine from "./components/AudioEngine";
import Base from "./components/Base";

import { Synthesizer } from './components/Synthesizer.js'
import Experience from './Experience.js'
import SplashScreen from "./components/SplashScreen";

import './assets/scss/GUIPanel.scss'
import './assets/scss/index.scss'

// import BottomBar from "./components/BottomBar";
// import Modal from "./components/Modal";

import { motion } from "framer-motion";
import { connect } from "react-redux";
import { createSelector } from 'reselect'

import { setParam } from "./actions/actions.js";
import { bindActionCreators } from "redux";
import { useState, useEffect } from "react";

import useGame from './store/useGame.jsx'
// import AnimatedText from "./components/Onboarding/AnimatedText";

import Controls from "./components/Controls";

import ThreeView from "./components/ThreeView";
import Tooltip from "./components/Tooltip";
import GUIPanel from "./components/GUIPanel";

const defaultValue = { title: "Bag" };
const ThemeContext = React.createContext(defaultValue);

const AppContainer = styled.div`
	align-items: center;
	/*justify-content:center;*/
	height: ${(props) => props.height}px;
	width: 100vw;
	align-items: stretch;
	overflow: hidden;
`;

const SynthContainer = styled(motion.div)`
	width: 100vw;
	height: 100%;
	overflow: hidden;
	padding: 50px;
	align-items: center;
	justify-content: space-around;
	display: flex;
	flex-direction: column;
	pointer-events: ${(props) => (props.clickable ? "auto" : "none")};
`;

// const PhoneContainer = styled.div`
// 	width: 80%;
// 	max-width: 500px;
// 	padding: 20px;
// 	position: fixed;
// 	top: 20px;
// 	left: 20px;
// `;
const variants = {
	onboarding: { x: `45%` },
	onboardingSmall: { x: `100%` },
	default: { x: `0%` },
};

function App( props ) {
	const size = useWindowSize();

  const [freq, setFreq] = useState(0);
  const [powerActive, setPowerActive] = useState(false);
  const [freqOld, setFreqOld] = useState(0);
  const [keyPressed, setKeyPressed] = useState(0);

	const isMouseDown = useGame((state) => state.isMouseDown)

	// Turning knobs and moving sliders
  const [ mouseIsDown, setMouseIsDown ] = useState(false)

	const [controlsEnabledMaster, setControlsEnabledMaster] = useState(true);

	let realMouse = {x: 0, y: 0}
	// const ThemeContext = createContext(null)

	// console.log('App')
	// console.log(props)

	const [ settings, setSettings ] = useState(
		{
			resetCam: false
		}
	)

	useEffect(() => {
		// console.log(state)
		// console.log(mapStateToProps)
		// console.log(mapStateToProps)
		// return
		// return (
		// )
		// setPowerActive( props.power.active )
	}, [props, isMouseDown])
	// }, [props, keyPressed])

  function changeValue(val) {
		// console.log('changeValue - App')
		// console.log(`changeValue - App - ${val}`)
    if (freq === freqOld) {
      // console.log('same')
      setFreq(val)
    }
    else {
      setFreqOld(freq)
    }
  }

	const buttonCommand = () => {
		// console.log('buttonCommand')

		setSettings( {resetCam: true} )
		// console.log(this.props)
	}
  
  function keyWasPressed(val) {
    setKeyPressed(val)
    // console.log('noteName pressed:')
    // console.log(val)
  }

	const handlePointerUp = (event) => {
		// Handle the pointer up event
		console.log('Pointer up event triggered', event);

		setControlsEnabledMaster( true )
		
		setMouseIsDown( false )
	};
	
	const handlePointerDown = (event) => {
		// Handle the pointer up event
		console.log('Pointer down event triggered', event);

		setMouseIsDown(true)
	};
	
	const handlePointerMove = (e) => {
		// Handle the pointer up event
		// console.log('handlePointerMove', e);
		// console.log(e);
		
		realMouse.x = e.touches ? e.touches[0].pageX : e.clientX
    realMouse.y = e.touches ? e.touches[0].pageY : e.clientY
		
		if (mouseIsDown) {
			console.log('mouse is Down');
			console.log(realMouse);

			console.log(e)
		}

		// console.log(realMouse)
		// console.log('handlePointerMove:', event);

		// setControlsEnabledMaster( true )
	};

	// if (size.height < 600 || size.width < 900)
	// 	return (
	// 		<PhoneContainer>
	// 			<AnimatedText headline="Oh, Heck!" show={true}>
	// 				This screen is to small to properly shred. Those knobs would be tiny.
	// 				How did you imagine this would work? Please open this site on a tablet
	// 				or desktop device.
	// 			</AnimatedText>
	// 		</PhoneContainer>
	// 	);
	return (
		<AppContainer height={size.height}
			onPointerUp={handlePointerUp}
			// onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
		>
			
			<AudioEngine keyWasPressed={(val) => keyWasPressed(val) } toneIs={freq}></AudioEngine>
			{/* <AudioEngine toneIs={freq}></AudioEngine> */}
      
			{/* The modal */}
      {/* <Modal></Modal> */}
      
			{/* The 3D view */}
      {/* <ThreeView
        playTone={(val) => changeValue(val) } keyPressed={keyPressed}
        module={"vco"}
				settings={ settings }
      ></ThreeView> */}

			<SplashScreen module={"power"} value={ props.active } />
			{/* <SplashScreen module={"power"} value={ powerActive } /> */}
			{/* <SplashScreen module={"power"} value={ false } /> */}

			{/* <Synthesizer playTone={(val) => changeValue(val) } keyPressed={keyPressed} /> */}
			{/* <ThemeContext.Provider props={ props }>
				<Synthesizer />
			</ThemeContext.Provider> */}

      <Tooltip />
      
      <Experience controlsEnabled={controlsEnabledMaster} playTone={(val) => changeValue(val) } keyPressed={keyPressed} />

			<GUIPanel
				onButtonPressed={(val) => buttonCommand(val) }
			/>

			{/* <SynthContainer
				clickable={true}
				variants={variants}
				initial='default'
				animate='default'
				transition={{
					type: "spring",
					stiffness: 60,
					damping: 22,
				}}
			>
			</SynthContainer> */}

			<Controls></Controls>
			
		</AppContainer>
	);
}

function useWindowSize() {
	const isClient = typeof window === "object";

	function getSize() {
		return {
			width: isClient ? window.innerWidth : undefined,
			height: isClient ? window.innerHeight : undefined,
		};
	}

	const [windowSize, setWindowSize] = useState(getSize);

	useEffect(() => {
		if (!isClient) {
			return false;
		}

		function handleResize() {
			setWindowSize(getSize());
		}

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}); // Empty array ensures that effect is only run on mount and unmount

	return windowSize;
}

const mapStateToProps = (state) => {
	// console.log('mapStateToProps')
	// console.log(state)
	const data = state => state.state
	const selectABC = createSelector([data], (a) => {
		// do something with a, b, and c, and return a result
		return a
	})
	// const data = createSelector(state)
	// const data = state
	return {
		// ...data.state
		...state.state.power
		// ...selectABC
	}
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({setParam}, dispatch)
}

// export default App
export default connect(mapStateToProps, mapDispatchToProps)(App);
