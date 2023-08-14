import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setParam } from "../actions/actions.js";

import './Tooltip.css'

// import { map } from '../helpers.js'

// global variables
// const use_orbit_controls = false
// const isBrowser = () => typeof window !== "undefined"

class Tooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.test = 'Yes'
    // 3D Synth
    // Loaders
    this.buttons = {}
  }

  onResize() {
    //
  }

  onClick(e) {
    console.log('we be clicking')
    console.log(e)
  }

  render() {
    // const { props } = this;
    return (
      <div className="popover">
        <div className="dot"></div>
        <div className="annotation">
          {/* <div className="info-line"></div> */}
          <div className="annotation__textwrapper">
            <div className="annotation__title">
              <h3 className="annotation__title__text bold-it anim-type-axis-y anim">Title</h3>
            </div>
            <div className="annotation__subtitle">
              <p className="annotation__subtitle__text anim-type-axis-y anim">Subtitle</p>
              <p className="annotation__number anim-type-axis-y anim"></p>
            </div> 
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    ...state.state,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ setParam }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Tooltip);
