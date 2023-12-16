import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export default create(subscribeWithSelector((set) =>
{
    return {
        isMouseDown: false,
        currentDragObject: null,

        blocksCount: 10,
        blocksSeed: 0,
        
        /**
         * Time
         */
        startTime: 0,
        endTime: 0,

        /**
         * Phases
         */
        phase: 'ready',
        // cameraView: 'firstPerson',
        cameraView: 'orbitControls',
        currentGravity: 0,
        currentLevel: 1,
        isHand: true,

        gameStatePingPong: false,
        
        showTransition: false,
        // levelBaseIsActive: true,
        // setLevel: 0,

        setMouseDown: (newState) =>
            set((state) => ({
                isMouseDown: newState
        })),

        setCurrentDragObject: (object) =>
            set((state) => ({
                currentDragObject: object
        })),

        start: () =>
        {
            set((state) =>
            {
                if(state.phase === 'ready')
                    return { phase: 'playing', startTime: Date.now() }

                return {}
            })
        },

        restart: () =>
        {
            set((state) =>
            {
                if(state.phase === 'playing' || state.phase === 'ended')
                    return { phase: 'ready', blocksSeed: Math.random() }

                return {}
            })
        },

        end: () =>
        {
            set((state) =>
            {
                if(state.phase === 'playing')
                    return { phase: 'ended', endTime: Date.now() }

                return {}
            })
        },
        
        toggleCameraView: () =>
        {
            set((state) =>
            {
                // return { cameraView: 'firstPerson' }
                if (state.cameraView === 'firstPerson')
                {
                    return { cameraView: 'orbitControls' }
                }
                else
                {
                    return { cameraView: 'firstPerson' }
                }

                return {}
            })
        },
        
        setCurrentGravity: () =>
        {
            set((state) =>
            {
                // return { cameraView: 'firstPerson' }
                if (state.currentGravity === 0)
                {
                    return { currentGravity: -40 }
                }
                else
                {
                    return { currentGravity: 0 }
                }

                return {}
            })
        },
        
        setLevel: (levelNumber) =>
            set((state) => ({
                currentLevel: levelNumber
        })),
        
        setHideTransition: (newState) =>
            set((state) => ({
                showTransition: newState
        })),
        
        setGameStatePingPong: (newState) =>
            set((state) => ({
                gameStatePingPong: newState
        })),

        // setHideTransition: () =>
        // {
        //     set((state) =>
        //     {
        //         return { showTransition: !showTransition }
        //         // if (state.cameraView === 'firstPerson')
        //         // {
        //         //     return { cameraView: 'orbitControls' }
        //         // }
        //         // else
        //         // {
        //         //     return { cameraView: 'firstPerson' }
        //         // }

        //         // return {}
        //     })
        // },
        // setLevel: (levelNumber) =>
        //     set((state) =>
        //     ({
        //         console.log('changing state')
        //         console.log(state)
        //         // return { currentLevel: state }
        //         // if (state.levelOneState === 0)
        //         // {
        //         //     return { levelOneState: 1 }
        //         // }
        //         // else
        //         // {
        //         //     return { levelOneState: 0 }
        //         // }

        //         // return {}
        //     }))
        
    }
}))