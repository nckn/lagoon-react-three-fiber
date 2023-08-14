import React from "react";
import styled from "styled-components";
import { bindActionCreators } from "redux";
import { setPower } from "../actions/actions.js";

import { connect } from "react-redux";

const Container = styled.div`
  width: 100%;
  height: 100%;
	display: flex;
	// flex-direction: column;
	align-items: flex-end;
	flex: 1;
	justify-content: center;
  background: rgba(255,255,255,0.5);
  z-index: 12;
  position: absolute;
  transition: all 0.3s;
`;

const StartButton = styled.div`
  width: auto;
	height: 44px;
	border-radius: 2px;
	transition: all 0.3s;
  display: flex;
	align-items: center;
  justify-content: center;
  padding: 2px 16px;
  cursor: pointer;
  margin-bottom: 128px;
	background-image: linear-gradient(
    180deg,
		#4d4d4d 0%,
		#393939 42%,
		#1c1c1c 99%
  );
  background: #050505;
	box-shadow: 0 5px 3px 0 rgba(0, 0, 0, 0.19), 0 8px 7px 0 rgba(0, 0, 0, 0.5),
		inset 0 -1px 0 0 rgba(0, 0, 0, 0.5),
		inset 0 1px 0 0 rgba(255, 255, 255, 0.16);
  &:hover {
    transform: scale(1.05);
  }
`;

class SplashScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	toggle() {
		const { value } = this.props;
		// console.log(value)
		this.props.setPower(!value);
		// this.props.setPower(true);

		// console.log('mapStateToProps')
		// console.log(mapStateToProps)
	}

	componentDidUpdate(prevProps) {
		const { value } = this.props;
		
		// console.log('toggle: ', value)
		// console.log('toggle: ', value)

		//when prev animation finished
		if (prevProps.value !== value) {
			const audio = new Audio("/sounds/switch.mp3");
			audio.play();
		}
	}

	render() {
		const { value } = this.props;
		return (
			<Container className="splashscreen-outer" style={{ visibility: value ? "hidden" : "visible" }}>
				<StartButton
					onClick={this.toggle.bind(this)}
					active={value}
          className="start-button"
				>Play it!
        </StartButton>
			</Container>
		);
	}
}

SplashScreen.defaultProps = {
	value: true,
};

const mapStateToProps = (state) => {
	// console.log(state)
	return {
		...state.state
	};
};

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({ setPower }, dispatch);
};
export default connect(mapStateToProps, mapDispatchToProps)(SplashScreen);
