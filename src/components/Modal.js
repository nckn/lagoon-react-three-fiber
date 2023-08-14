import React from 'react'
import styled from 'styled-components'
// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { onboardingReset, sharePatch } from '../actions/actions.js'
// import { motion, AnimatePresence } from 'framer-motion'
// import { store } from '../store'

const Container = styled.div`
  // .modal-master
  width: 100%;
  height: 100%;
  z-index: 2;
  position: absolute;
  a {
    text-decoration: none;
  }
  .link {
    display: block;
    text-align: center;
    margin-top: 1em;
    background: red;
    width: 100px;
    height: 40px;
  }
  /* --- */
  .modal {
    opacity: 0;
    visibility: hidden;
    transition: 0.3s ease-in;
  }
  .modal:target {
    opacity: 1;
    visibility: visible;
  }
  /* --- */
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.25);
    display: grid;
    place-items: center;
  }
  .content {
    width: 320px;
    padding: 1em 0;
    background-color: #fbfbfb;
    border-radius: 2px;
    text-align: center;
    color: #262626;
    position: relative;
  }
  .content > *:not(.close) {
    margin: 1em 0;
  }
  .close {
    position: absolute;
    top: 5px;
    right: 10px;
    color: #f93154;
  }
`

function Modal () {

  return (
    <Container className='modal-master'>
      <a href='#modal' className='link'>
        Show modal
      </a>

      <div className='modal' id='modal'>
        <div className='overlay'>
          <div className='content'>
            <h3>Title</h3>
            <p>Description</p>
            <a href='#' className='close'>
              ✖
            </a>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Modal
