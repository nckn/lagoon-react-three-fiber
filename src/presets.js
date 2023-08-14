const presets = [
	{
		// 0 - white
		general: {
			octave: 0,
			glide: 0,
		},
		vco: [
			{
				pitch: 0,
				gain: 1,
				octave: 0,
				semitones: 0,
				detune: 0,
				type: "sawtooth",
			},
			{
				pitch: 0,
				type: "sawtooth",
				gain: 0,
				octave: 0,
				semitones: 0,
				detune: 0,
			},
			{
				pitch: 0,
				type: "sawtooth",
				gain: 0,
				octave: 0,
				semitones: 0,
				detune: 0,
			},
		],
		envelope: {
			attack: 0,
			decay: 0,
			release: 0,
			sustain: 100,
		},
		filter: {
			frequency: 1512.7153011703033,
			resonance: 0,
		},
		filterEnvelope: {
			sustain: 100,
			intensity: 0,
			attack: 0,
			decay: 0,
			release: 0,
		},
    reverb: {
      value: 0
    },
    fxs: {
      reverb: {
        dry: 0,
        wet: 0 
      },
      delay: {
        time: 0, 
        gain: 0 
      },
      flanger: {
        delay: 0,
        depth: 0,
        feedback: 0,
        speed: 0
      },
      distortion: {
        intensity: 200,
        gain: {
          dry: 0,
          wet: 0
        }
      }
    }
	},
	// 1 - yellow THE DEFAULT One
	{
		vco: [
			{
				pitch: 0,
				type: "sawtooth",
				gain: 1,
				octave: 0,
				semitones: 0,
				detune: 0,
			},
			{
				pitch: 0,
				type: "sawtooth",
				octave: 0,
				detune: 10,
				semitones: 7,
				gain: 1,
			},
			{
				pitch: 0,
				octave: 0,
				semitones: 0,
				type: "square",
				detune: 2.142857142857146,
				gain: 0.31363636363636366,
			},
		],
		general: {
			octave: -1,
			glide: 0.08035714285714286,
		},
		filter: {
			resonance: 1,
			frequency: 899.9248073623645,
		},
		filterEnvelope: {
			attack: 0.2,
			release: 0.5,
			sustain: 48.035714285714285,
			decay: 0.95,
			intensity: 36.60714285714286,
		},
		envelope: {
			decay: 0.2,
			sustain: 100,
			release: 0.8321428571428571,
			attack: 0.01499999999999996,
		},
    reverb: {
      value: 0
    },
		pitchbend: {
			value: 0
		},
    fxs: {
      reverb: {
        dry: 1, 
        wet: 0 
      },
      delay: {
        time: 0, 
        gain: 0 
      },
      flanger: {
        delay: 0,
        depth: 0,
        feedback: 0,
        speed: 0
      },
      distortion: {
        intensity: 203,
        gain: {
          dry: 1,
          wet: 0
        }
      }
    },
	}
	// 1 - yellow THE DEFAULT One - end
];

export default presets;
