
## Lagoon Synth is a 3D synth that responds to different and surprising user inputs

1. Install the dependencies:
`npm install`

2. Run the app in development mode:
`npm start`

### Try it here
https://3dsynth-lagoon.netlify.app/


## Version_1 deploy
https://version-1--3dsynth-lagoon.netlify.app/
Also found in branch 'version_1'


## TODOs
- make volume instead of detune
- √ - Start to add edge gui
- tooltip coming later for pitchbend
- fix bug with cant play same key raycaster

- arpeggia

- hide pitchbend and screen maybe
- - Fix when key is lifted right away
- - The exit key on hover makes it hard to play with keys after
- continue merging blender names with lagoon more readable names

- run command that sets as preset
- turn down perspective, near orthographic?
- night mode,
- stop flickr of tooltips, maybe with delay
#model
- less sharp edges around cabinet
#texture
- - clean up in photoshop
- default, turn off tooltips

- add touch pad that receives raycast pointer movement, maybe display analyzer as well
- add oscillation to knobs, like the filter, metronome movement and enable control of amplitude
- check out the multiple touch interaction for turning knobs on touch devices
- allow for know turning with orbit controls (the sillent web?)
- adjust view for mobile tan shit you know... fit to width plus a little more
- If placed on border btw two keys then it should go into 'repeated-note-mode'
- Clean up project and get rid of old remnants such as awwwards
- add scss

Fun features
- color themes, randomize colors
- drone mode (switch)
- choose input, let big data, wheather, etc. control voices, sound and FXs
- map input with output knobs and FXs

## Bugs
- Fix when key is lifted right away
- The exit key on hover makes it hard to play with keys after
- Can't run 'npm install' on new macbook:
    https://stackoverflow.com/questions/70260113/cannot-successfully-run-npm-i-on-new-macbook-pro-m1

Add in new slider
<!--
add object to conditional
// Is it one of the interactive sliders
key.name.includes(<name>)
-->


## Assign new tui element a purpose

1. Identify the name of the mesh, eg. ''KnobFilter5'
2. Go to onMouseDown and have a case for it
3. 


## Blender and Threejs projects

### Create, bake and import scene 

* Create and render
    * Enable noise
* UW Unwrap
    * Delete hidden faces
    * Always scale in edit mode
    * Check face orientation
    * Set scale of all objects to 1
        * Select all, make sure one is yellow outline  >  C’tl + A’  >  Select ‘Scale’


Resources

Impulse responses
https://impulses.prasadt.com/


## Questions
### Q: Where is the preset decided, which VCO do we start with?
### A:
In PresetManager.js we pick the oscillator on line 33:
  // We use the second preset from presets.js
  this.props.loadPreset(presets[1]);
  So '1 - yellow THE DEFAULT One' in src/presets.js is the initial osc.

## Nice to know
### Q: where is the tone set?
### A: 

Baking and exporting the scene
https://threejs-journey.com/lessons
From ca. 30:00
- 'u' to unwrap
- for cabinet do 'u' > 'smart uv project' (1:02:54 in tutorial)
- 1:30:00 - making the actual texture file
- - - -
- create new image:
- - usually only check 32bit float checkbox

Create new image: (in UV Editor)
- 4096x4096, Uncheck alpha, Blank, 32 bit 


Save the image in project path (call it 'lagoon_2.1.1_cabinet_baked')
- file format Radiance HDR and click save
- select eg. cabinet and the open shader editor and add 'image texture'
- - if more than one object should be baked then select them one at a time and hit bake
- make sure the node is selected
- render settings
- - make sure the render pixel res. matches the texture
- save by pressing 'n' in the tab and selecting 'save' and then refresh after
render the image
- open Compositor editor
- (Default is 'Render layers' connected to 'Composite' node)
- In Compositor: Put image texture node > Denoise node > (into) Compositor and hit render, save as jpg
- - - -

  Ideas for SoMe
  - play ananda nadamadum tillai sankara by Ravi Shankar, last minute or so, play e - c - d - e (settings see: Screenshot 2022-01-09 at 22.51.12 on new macobook)




  ## Current Blender file w/ modifier bools applied:
  newest:
  "lagoon-3D-synth-2.2.1_modifier_applied_n_baked"
  next newest:
  "lagoon-3D-synth-2.2.0_modifier_applied_n_baked"




  Clean and make mine
  - change index.html and meta tags, social



## Versions
lagoon-3D-synth-2.2.2 = changed to no bevel due to python export (bevel on white keys)
<!-- From here and on the '_modifier_applied_n_baked' is implicit so it won't be in the name -->
lagoon-3D-synth-2.2.1_modifier_applied_n_baked = bevel for cabinet
lagoon-3D-synth-2.2.0_modifier_applied_n_baked = before applying dark material to all knobs


Bevel on the white keys:
0.0025m, 2 segments


## Converting to react-three-fiber
$ npm install @react-three/drei@9.32.4 @react-three/fiber@8.8.7 @react-three/postprocessing@2.6.2 @react-three/rapier@0.9.0 r3f-perf@6.5.0 zustand@4.1 react@18.2.0 react-dom@18.2.0 react-scripts@5.0.1 -force