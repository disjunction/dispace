<pre>
var config = {
    ppm: 32,                        // pixels per meter
    viewport: {
        skipElevation:  ???
        elevationShiftRatio: 0.08   // shift in meters for a thing haveing elevation
                                    // of 1 and being 1 meter away from camera

        scaleFactor: null           // experimental elevation effect, null - no scale
    },
    audio: {                        // see http://www.cocos2d-x.org/reference/html5-js/V3.6/symbols/cc.audioEngine.html
        effectVolume: 0.5            // 0.0 ~ 1.0
        musicVolume: 0.5            // ""
    },

    // field engine config
    fe: {
        maxSimSteps: 3,             // max sim steps calculated per sim loop
        discardSteps: 5             // must be > maxSimSteps, number of steps that get discarded, as server would fix it anyway
    },

    features: {
        shadows: true,
        tiles: true,                // show tiled backgrounds
        edges: true,                // show edge decoration
        dynamicCamera: true         // camera scale and shift
    },

    ui: {
        gutsHud: {
            hideDelay: 5,
            switchDelay: 2
        }
    },
}
</pre>
