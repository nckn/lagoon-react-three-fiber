import React from "react";
import { connect } from "react-redux";
import {
	tick,
	pressNote,
	updateOscilloscope,
	updateCurrentTime,
} from "../actions/actions.js";
import { bindActionCreators } from "redux";
import { transform } from "framer-motion";
import * as midi from "@tonaljs/midi";
import * as tonal from "@tonaljs/tonal";
import { AudioContext } from "standardized-audio-context";

import { Distortion, Flanger, Reverb, Tremolo } from 'audio-effects';
import { freq } from "tonal/index.js";

const transposeFrequencyByCents = (frequency, cents) => {
	const freq = frequency * Math.pow(2, cents / 1200);
	return freq;
};
const transposeFrequencyBySemitones = (frequency, semitones) => {
	const a = Math.pow(2, 1 / 12);
	return frequency * Math.pow(a, semitones);
};

class AudioEngine extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			playing: false,
		};

		this.pitchInfluence = 0

		this.audioCtx = new AudioContext();
		this.vco = [];
		this.vcoGain = [];

		this.gain = this.audioCtx.createGain();
		this.envelope = this.audioCtx.createGain();
		this.envelope.gain.value = 0;

    // this.delay = ''

    // Convolver - creation
    this.convolver = this.audioCtx.createConvolver()
    this.dry = this.audioCtx.createGain()
    this.wet = this.audioCtx.createGain()
    this.delay = this.audioCtx.createDelay()
    this.feedbackGain = this.audioCtx.createGain()
    this.midwayGainOne = this.audioCtx.createGain()

		this.biquadFilter = this.audioCtx.createBiquadFilter();
		this.biquadFilter.type = "lowpass";
		this.biquadFilter.frequency.value = props.filter.frequency;
		this.biquadFilter.gain.value = 0;
		this.biquadFilter.Q.value = props.filter.resonance / 4;

		this.compressor = this.audioCtx.createDynamicsCompressor();

		this.analyzer = this.audioCtx.createAnalyser();
		this.analyzer.fftSize = props.oscilloscope.fftSize;
		this.analyzerBufferLength = this.analyzer.frequencyBinCount;
		var dataArray = new Float32Array(this.analyzer.fftSize);

    this.applyEffects()

		this.biquadFilter.connect(this.envelope);
    
    // If not using effects
		// this.envelope.connect(this.analyzer);

    // this.biquadFilter.connect(this.convolver);
    // this.biquadFilter.connect(this.envelope);
		
    // this.biquadFilter.connect(this.dry);
    // Convolver - connections
    // this.convolver.connect(this.wet);
    // this.dry.connect(this.envelope)
    // this.wet.connect(this.envelope)
    // this.dry.gain.value = 1.0
    // this.wet.gain.value = 0
    // this.wet.gain.value = props.reverb.value

		this.analyzer.connect(this.gain);

		this.gain.connect(this.compressor);
		this.compressor.connect(this.audioCtx.destination);


		this.pressedNotes = [];

    this.toneNew = 0
    this.toneOld = 0

    this.isCurrentlyPlayingFromHover = false
    this.keyIsDown = false

		setInterval(() => {
			this.analyzer.getFloatTimeDomainData(dataArray);
			props.updateOscilloscope(dataArray, this.audioCtx.currentTime);
		}, 1000 / 60);

    // Convolver - setup
    this.setReverb()

	}

  // If using effects remember to connect to the last output to this.analyzer
  applyEffects() {
    let self = this
    // Delay
    // self.delay = new Delay(self.audioCtx);
    // self.delay.wet = 0.5; // Set the wetness to 100%
    // self.delay.speed = 1; // Set the speed to 1 second
    // self.delay.duration = 0.4; // Set the delay duration to 40%
    // console.log(self.delay)
    // console.log(self.biquadFilter)

    // Distortion - setup - start
    self.distortion = new Distortion(this.audioCtx);
    self.gainDistortionWet = this.audioCtx.createGain()
    self.gainDistortionDry = this.audioCtx.createGain()
    // self.distortion.intensity = 200; // Set the intensity to 200
    self.distortion.intensity = this.props.fxs.distortion.intensity
    // self.distortion.gain = 100; // Set the gain to 100
    // self.distortion.gain = this.props.fxs.distortion.gain
    self.distortion.gain = 0.1
    self.distortion.lowPassFilter = true; // Enable the lowpass filter
    self.distortion.node.connect(self.gainDistortionWet)
    // Distortion - setup - end

    // console.log('distortion')
    // console.log(this.props.fxs.distortion)
    // console.log(self.delay)

    // Flanger
    self.flanger = new Flanger(this.audioCtx);
    self.flanger.delay = 0.005; // Set the delay to 0.005 seconds
    // self.flanger.delay = this.props.fxs.flanger.delay
    self.flanger.depth = 0.002; // Set the depth to 0.002
    self.flanger.feedback = 0.5; // Set the feedback to 50%
    // self.flanger.speed = 0.25; // Set the speed to 0.25 Hz
    self.flanger.speed = this.props.fxs.flanger.speed
    // self.flanger.speed = 0.5

    // console.log('Reverb')
    // console.log(Reverb)
    // Reverb
    self.reverb = new Reverb(this.audioCtx)
    self.reverb.node.wet = 0.5; // Set the wetness to 50%
    self.reverb.node.level = 1; // Set the level to 100%
    
    // Reverb.getInputResponseFile('/sounds/GraffitiHallway.wav').then(buffer => {
    //   console.log('buffer')
    //   console.log(buffer)
    //   self.reverb.node.buffer = buffer;
    //   console.log('self.reverb')
    //   console.log(self.reverb)
    // });

    var url = '/sounds/GraffitiHallway.wav'
    var request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'arraybuffer'
    request.onload = _ => {
      self.audioCtx.decodeAudioData(request.response, (buffer) => {
        self.reverb.node.buffer = buffer;
        // console.log('buffer - successs!!!!!!')
        // console.log(buffer)
        console.log('self.reverb')
        console.log(self.reverb)
      }, (e) => { 
        console.log(e)
        console.log('it worked')
      })
    }
    request.onerror = (e) => {
      console.log(e)
      console.log('didnt work')
    }
    request.send()
    // self.setReverb()

    // Tremolo
    self.tremolo = new Tremolo(this.audioCtx);
    self.tremolo.speed = 5;

    // Delay connect
    // self.envelope.connect(self.delay.node);
		// self.delay.node.connect(self.analyzer);

    // Distort connect
    // self.envelope.connect(self.gainDistortionDry)

    // self.envelope.connect(self.distortion.node)
    // self.envelope.connect(self.gainDistortionDry)
    
    // WIP making dry and wet gains
		// self.gainDistortionDry.connect(self.flanger.node)
		// self.gainDistortionWet.connect(self.flanger.node)
    self.gainDistortionDry.gain.value = 1
    self.gainDistortionWet.gain.value = 0
    // self.distortion.gain = 0
    
    // Flanger connect
    self.envelope.connect(self.midwayGainOne);
    self.envelope.connect(self.delay);
    self.delay.connect(self.feedbackGain)
    self.feedbackGain.connect(self.delay)
    self.delay.connect(self.midwayGainOne)
    
    self.midwayGainOne.connect(self.convolver)
    self.midwayGainOne.connect(self.dry)

    self.convolver.connect(self.wet);
    // self.dry.connect(self.analyzer);
    // self.wet.connect(self.analyzer)
    self.dry.connect(self.flanger.node)
    self.wet.connect(self.flanger.node)

    // Distortion
    self.flanger.node.connect(self.distortion.node)
    self.flanger.node.connect(self.gainDistortionDry)
    self.flanger.node.connect(self.gainDistortionWet)
		self.gainDistortionDry.connect(self.analyzer);
		self.gainDistortionWet.connect(self.analyzer);

    // Normal
		// self.flanger.node.connect(self.analyzer);
		// this.envelope.connect(self.analyzer);

    self.dry.gain.value = 1;
    self.wet.gain.value = 0;
    self.feedbackGain.gain.value = 0.25
    
    // Reverb connect
    // self.envelope.connect(self.reverb.node);
		// self.reverb.node.connect(self.analyzer);

    // Tremolo
    // self.envelope.connect(self.tremolo.node);
		// self.tremolo.node.connect(self.analyzer);
    
  }

  setReverb () {
    var self = this
    var loadImpulse = function (fileName) {
      // console.log('load Impulse')
      // var url = '/sounds/GraffitiHallway.wav'
      var url = '/sounds/BatteryQuarles-EchoThief.wav'
      // var url = '/sounds/Cathedral.wav'
      var request = new XMLHttpRequest()
      request.open('GET', url, true)
      request.responseType = 'arraybuffer'
      request.onload = function () {
        self.audioCtx.decodeAudioData(request.response, function (buffer) {
          self.convolver.buffer = buffer;
        }, function (e) { 
          console.log(e)
          console.log('it worked')
        })
      }
      request.onerror = function (e) {
        console.log(e)
        console.log('didnt work')
      }
      request.send()
    }
    loadImpulse(0)
    // self.mix(0)
  }
  
  // mix (value) {
  //   var reverb = value / 80.0;
  //   this.dry.gain.value = (1.0 - reverb);
  //   this.wet.gain.value = reverb;
  // }

	onKeyUp(e) {
		const midiCode = this.mapKeyboardToMidi(e.key);
		if (!midiCode) return;
		const noteName = midi.midiToNoteName(midiCode);

		this.releaseNote(noteName);
    this.keyIsDown = false

    // Send message to parent App.js and via it let ThreeView know
    // Essentially calls @pressDownKey in ThreeView
    this.props.keyWasPressed({noteName, dir: 'up'})
	}

	mapKeyboardToMidi(key) {
		switch (key.toLowerCase()) {
			case "a":
				return 48;
			case "w":
				return 49;
			case "s":
				return 50;
			case "e":
				return 51;
			case "d":
				return 52;
			case "f":
				return 53;
			case "t":
				return 54;
			case "g":
				return 55;
			case "y":
				return 56;
			case "h":
				return 57;
			case "u":
				return 58;
			case "j":
				return 59;
			case "k":
				return 60;
			case "o":
				return 61;
			case "l":
				return 62;
			case "p":
				return 63;
			case ";":
				return 64;
			case "Dead":
				return 65;
			default:
				return false;
		}
	}

	onMIDISuccess(midiAccess) {
		this.inputs = midiAccess.inputs;

		for (var input of midiAccess.inputs.values()) {
			input.onmidimessage = this.getMIDIMessage.bind(this);
		}
	}

	getMIDIMessage(midiMessage) {
		const note = midiMessage.data[1];
		const velocity = transform(midiMessage.data[2], [1, 127], [0, 1]);
		const noteName = midi.midiToNoteName(note);
    
		console.log('getMIDIMessage')
    console.log(midiMessage.data[0])
		// console.log('note is: ')
    // console.log(note)

		// Tell ThreeView to play note and bring bar down
		this.props.keyWasPressed({noteName, dir: 'down'})

		switch (midiMessage.data[0]) {
			case 144:
				this.playNote(noteName, velocity);
				break;
			case 128:
				this.releaseNote(noteName);
				// Tell ThreeView to end note and release bar
				this.props.keyWasPressed({noteName, dir: 'up'})
				break;
			default:
				return null;
		}
	}

	playNote(noteName, velocity = 1) {
		let self = this
		const ctx = this.audioCtx;

		// console.log('happens')
		// console.log(this.vco)

		// console.log('noteName typeof')
		// console.log(typeof noteName)
		// console.log('noteName')
		// console.log(noteName)

    // console.log('logging flanger')
    // console.log(this.props.fxs.flanger.delay)

		this.triggerEnvelope( Math.abs(velocity) );
    // console.log('noteName')
    // console.log(noteName)
    
		if (this.pressedNotes.indexOf(noteName) === -1)
    this.pressedNotes.push(noteName); // dont add key if already in
		const note = tonal.note(noteName);
    
    // BUG: This causes an maxstack error.
		// this.props.pressNote(note, velocity);
    // return

		const baseFrequency = self.getBaseFrequency(note);

		// console.log('- - - - - - - - - - - - -')
		// // console.log(typeof this.vco)
		// console.log(note)
		// console.log('- - - - - - 2 - - - - - - -')
		// console.log(baseFrequency)

		// return

    // console.log('vco length')
    // console.log(this.vco.length)
		this.vco.forEach((vco, i) => {
			let frequency = this.getVCOFrequency(i, baseFrequency === undefined ? 0 : baseFrequency);

			// console.log('vco')
			// console.log(vco)

			// frequency -= self.pitchInfluence
			frequency += self.pitchInfluence

			// Logging the frequencies
			// console.log('frequency')
			// console.log(frequency)
			// console.log('ctx.currentTime')
			// console.log(ctx.currentTime)

			if (this.envelope.gain.value > 0.1 && this.props.general.glide) {
				vco.frequency.cancelScheduledValues(ctx.currentTime);
				vco.frequency.setValueAtTime(vco.frequency.value, ctx.currentTime);
				vco.frequency.linearRampToValueAtTime(
					frequency,
					ctx.currentTime + this.props.general.glide
				);
			} else {
				// console.log('frequency')
				// console.log(frequency)
				// console.log('ctx.currentTime')
				// console.log(ctx.currentTime)
				// console.log(vco.frequency)
				vco.frequency.setValueAtTime(frequency, ctx.currentTime);
			}
		});
	}

	releaseNote(noteName) {
		const keyIndex = this.pressedNotes.indexOf(noteName);

		//remove released note
		this.pressedNotes = this.pressedNotes.filter(function (value, index, arr) {
			return index !== keyIndex;
		});

		if (this.pressedNotes.length) {
			this.playNote(
				this.pressedNotes[this.pressedNotes.length - 1],
				this.props.keyboard.velocity
			);
		} else {
			this.releaseEnvelope();
		}
	}

	getBaseFrequency(note, octave) {
		if (!octave) {
			octave = this.props.general.octave;
		}
		const baseNote = tonal.note(note.pc + (note.oct + octave));
		return baseNote.freq;
	}

	getVCOFrequency(i, baseFrequency) {
		let self = this
		const fineTuned = transposeFrequencyBySemitones(
			// baseFrequency,
			baseFrequency - self.pitchInfluence,
			this.props.vco[i].semitones
		);
		const detuned = transposeFrequencyByCents(
			// fineTuned,
			fineTuned - self.pitchInfluence,
			this.props.vco[i].detune
		);
		return detuned;
	}

	onMIDIFailure() {
		console.log("Could not access your MIDI devices.");
	}

	componentDidMount() {
		window.addEventListener("keydown", this.onKeyDown.bind(this));
		window.addEventListener("keyup", this.onKeyUp.bind(this));

		if (navigator.requestMIDIAccess) {
			navigator
				.requestMIDIAccess()
				.then(this.onMIDISuccess.bind(this), this.onMIDIFailure.bind(this));
		} else {
		}
	}

	getTimeConstant(time) {
		return Math.log(time + 1) / Math.log(100);
	}

	keyToPitch(key) {
		const keyIndex = this.keys.indexOf(key);
		if (keyIndex === -1) return false;
		const octave = Math.floor(keyIndex / 12);
		return {
			note: keyIndex - 12 * octave,
			octave: octave,
		};
	}

	powerOn() {
		console.log('powerOn')

		const _this = this;
		this.props.vco.forEach((vco, i) => {
			_this.startVCO(i);
		});
	}

	powerOff(length) {
		const _this = this;
		this.props.vco.forEach((vco, i) => {
			_this.stopVCO(i, length);
		});
	}

	startVCO(index) {
		let self = this
		const ctx = this.audioCtx;

		console.log('startVCO')
		console.log('vcos: ', this.vco.length)
		console.log('vco: ', this.vco[0])

		let frequency = this.getVCOFrequency(
			index,
			this.getBaseFrequency(this.props.keyboard.note)
		);

		// frequency -= self.pitchInfluence
		frequency += self.pitchInfluence

    // console.log('this.props.keyboard.note')
    // console.log(this.props.keyboard.note)

		this.vco[index] = ctx.createOscillator();
		this.vco[index].type = this.props.vco[index].type;
		this.vco[index].frequency.setValueAtTime(frequency, ctx.currentTime); // value in hertz

		this.vcoGain[index] = ctx.createGain();
		this.vcoGain[index].gain.setValueAtTime(
			this.props.vco[index].gain,
			ctx.currentTime
		);

		// connect
		console.log('this.vcoGain[index]')
		console.log(this.vcoGain[index])
		this.vco[index].connect(this.vcoGain[index]);
		this.vcoGain[index].connect(this.biquadFilter);

		this.vco[index].start();
	}

	stopVCO(index, time = 0) {
		const ctx = this.audioCtx;
		this.vco[index].stop(ctx.currentTime + time + this.props.envelope.release);
	}

	triggerEnvelope(velocity = 1) {
		const ctx = this.audioCtx;
		const { envelope, filterEnvelope, filter } = this.props;
		const startTime = ctx.currentTime;
		const startFrequency = this.biquadFilter.frequency.value;

		this.envelope.gain.cancelScheduledValues(0);
		this.envelope.gain.setValueAtTime(this.envelope.gain.value, startTime);

		this.biquadFilter.frequency.cancelScheduledValues(0);
		this.biquadFilter.frequency.setValueAtTime(startFrequency, startTime);

		if (envelope.attack === 0) {
			this.envelope.gain.linearRampToValueAtTime(velocity, startTime);
		} else {
			this.envelope.gain.linearRampToValueAtTime(
				velocity,
				startTime + envelope.attack
			);
		}

		var minv = Math.log(filter.frequency);
		var maxv = Math.log(20000);
		var scale = (maxv - minv) / 100;

		const attackFrequency = Math.exp(filterEnvelope.intensity * scale + minv); //scale * filterEnvelope.intensity
		// const attackFrequency = Math.abs(Math.exp(filterEnvelope.intensity * scale + minv)); //scale * filterEnvelope.intensity
		
		// console.log('startTime + filterEnvelope.attack')
		// console.log(startTime + filterEnvelope.attack)
		// console.log('attackFrequency')
		// console.log(attackFrequency)

		// *** If attackFrequency is not set as a float number then leave this function
		if (isNaN(attackFrequency)) {
			return
		}

		const sustainFrequency = Math.exp(
			filterEnvelope.intensity * (filterEnvelope.sustain / 100) * scale + minv
		);

		this.biquadFilter.frequency.exponentialRampToValueAtTime(
			attackFrequency,
			startTime + filterEnvelope.attack
		);
		this.biquadFilter.frequency.setValueAtTime(
			attackFrequency,
			startTime + filterEnvelope.attack
		);
		this.biquadFilter.frequency.setTargetAtTime(
			sustainFrequency,
			startTime + filterEnvelope.attack,
			this.getTimeConstant(filterEnvelope.decay)
		);

		this.envelope.gain.setValueAtTime(velocity, startTime + envelope.attack);
		this.envelope.gain.setTargetAtTime(
			(envelope.sustain / 100) * velocity,
			startTime + envelope.attack,
			this.getTimeConstant(envelope.decay)
		);
	}

	releaseEnvelope() {
		const { envelope, filter, filterEnvelope } = this.props;
		const ctx = this.audioCtx;
		const startTime = ctx.currentTime;
		const startFrequency = this.biquadFilter.frequency.value;

		this.envelope.gain.cancelScheduledValues(startTime);
		this.envelope.gain.setValueAtTime(this.envelope.gain.value, startTime);

		this.biquadFilter.frequency.cancelScheduledValues(startTime);
		this.biquadFilter.frequency.setValueAtTime(startFrequency, startTime);

		const releaseConstant =
			envelope.release > 0 ? this.getTimeConstant(envelope.release) : 0.0001;

		this.biquadFilter.frequency.exponentialRampToValueAtTime(
			filter.frequency,
			startTime + filterEnvelope.release
		);

		this.envelope.gain.setTargetAtTime(0, startTime, releaseConstant);
	}

	componentWillReceiveProps(nextProps) {
    let self = this
		const ctx = this.audioCtx;

		// console.log(this.props)

    // console.log('componentWillReceiveProps')

		// console.log(nextProps.vco[1].gain, this.props.vco[1].gain)
		//  console.log(nextProps.vco[1].detune, this.props.vco[1].detune)
		// update VCOs
		this.vco.forEach((vco, i) => {
			if (nextProps.vco[i].type !== this.props.vco[i].type)
				vco.type = nextProps.vco[i].type;
			if (
				nextProps.general.octave !== this.props.general.octave ||
				nextProps.vco[i].semitones !== this.props.vco[i].semitones ||
				nextProps.vco[i].detune !== this.props.vco[i].detune
			)
				vco.frequency.setValueAtTime(
					this.getVCOFrequency(
						i,
						this.getBaseFrequency(
							nextProps.keyboard.note,
							nextProps.general.octave
						)
					),
					ctx.currentTime
				);
			if (nextProps.vco[i].gain !== this.props.vco[i].gain)
				this.vcoGain[i].gain.setValueAtTime(
					nextProps.vco[i].gain * nextProps.keyboard.velocity,
					ctx.currentTime
				);
		});

		// power
		if (nextProps.power.active && !this.props.power.active) {
			this.powerOn();
			console.log('toggle power - on')
		} else if (!nextProps.power.active && this.props.power.active) {
			console.log('toggle power - off')
			this.powerOff();
		}

    // Set amp gain
		if (nextProps.amp.gain !== this.props.amp.gain)
      this.gain.gain.setValueAtTime(nextProps.amp.gain, ctx.currentTime);
    
    // Set filter frequency
		if (nextProps.filter.frequency !== this.props.filter.frequency)
			this.biquadFilter.frequency.setValueAtTime(
				nextProps.filter.frequency,
				ctx.currentTime
			);
    
    // Set resonance. Checking if not similar didnt work
    // console.log(nextProps.filter.frequency !== this.props.filter.frequency)
    // if (nextProps.filter.resonance !== this.props.filter.resonance)
    this.biquadFilter.Q.setValueAtTime(
      nextProps.filter.resonance / 4,
      ctx.currentTime
    );
    
    // FXs
    // Set reverb
    // console.log(nextProps)
		// if (nextProps.reverb.value !== this.props.reverb.value)
		// if (nextProps.reverb)
    // this.wet.gain.value = 1.0 - nextProps.reverb.value
    // this.dry.gain.value = nextProps.reverb.value
    
    // Set Pitch
    self.pitchInfluence = nextProps.pitchbend.value

    // Set Reverb
    self.dry.gain.value = nextProps.fxs.reverb.dry
    self.wet.gain.value = nextProps.fxs.reverb.wet
    
    // Set Delay
    self.delay.delayTime.value = nextProps.fxs.delay.time
    
    // Set Flanger
		// if (nextProps.fxs.flanger.speed !== this.props.fxs.flanger.speed)
    self.flanger.speed = nextProps.fxs.flanger.speed
    
    // Set Distortion
    self.gainDistortionDry.gain.value = nextProps.fxs.distortion.gain.dry
    self.gainDistortionWet.gain.value = nextProps.fxs.distortion.gain.wet
    // console.log('dist dry: ', nextProps.fxs.distortion.gain.dry)
    // console.log('dist wet: ', nextProps.fxs.distortion.gain.wet)
    
    // My logic
    if (nextProps.toneIs === 'empty') {
      this.releaseNote(this.toneOld);
      return
    }
    if (this.keyIsDown) {
      return
    }
    // console.log('making it pass')
		// console.log('tone is')
    this.toneNew = nextProps.toneIs


		// console.log('new: ', this.toneNew, ', old: ', this.toneOld)
    if (this.toneNew === this.toneOld) {
      // console.log('same')
      // this.releaseNote('B3');
    }
    else if (!this.keyIsDown) {
      if (this.toneOld !== 0) {
        this.releaseNote(this.toneOld);
      }
      if (this.pressedNotes.indexOf(this.toneNew) !== -1) return;
      this.playNote(this.toneNew);
      // console.log('not the same: ', this.props.toneIs)
      // this.itHappened(this.toneNew)
      // setTimeout(() => {
      //   this.releaseNote(this.toneNew);
      // }, 120)
    }
    this.toneOld = this.toneNew
	}

  onKeyDown(e) {
    this.keyIsDown = true
		const midiCode = this.mapKeyboardToMidi(e.key);
		const noteName = midi.midiToNoteName(midiCode);

		if (!midiCode || this.pressedNotes.indexOf(noteName) !== -1) return;
		this.keyPressed = e.key;

    // if (this.toneOld !== 0) {
    //   this.releaseNote(this.toneOld);
    // }

    this.playNote(noteName);
    // return
    // if (!this.isCurrentlyPlayingFromHover) {
    //   this.playNote(noteName);
    // }
    // console.log('noteName')
    // console.log(noteName)
    // console.log(typeof noteName)

    // Send message to parent App.js and via it let ThreeView know
    // Essentially calls @pressDownKey in ThreeView
    this.props.keyWasPressed({noteName, dir: 'down'})
	}

	render() {
		return <div></div>;
	}
}

const mapStateToProps = (state) => {
	return {
		...state.state,
	};
};
const mapDispatchToProps = (dispatch) => {
	return bindActionCreators(
		{ tick, pressNote, updateOscilloscope, updateCurrentTime },
		dispatch
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(AudioEngine);
