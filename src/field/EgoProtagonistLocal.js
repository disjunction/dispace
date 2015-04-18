var cc = require('cc'),
    b2 = require('jsbox2d'),
    Interactor = require('fgtk/flame/view/Interactor');
    
var v1;
    
var EgoProtagonistLocal = cc.Class.extend({
    /**
     * opts:
     * * fe
     * * viewport
     * * ego
     * * syncCamera : boolean
     * * interactor
     * * hd - hud event dispatcher
     * @param opts object
     */
    ctor: function(opts) { 
        this.opts = opts;
        this.opts.fe.fd.addListener('step', this.step.bind(this));
    },
    
    step: function(event) {
        if (this.opts.syncCamera) {
            v1 = this.opts.ego.body.GetWorldCenter();
            this.opts.viewport.moveCameraToLocationXY(v1.x, v1.y);
        }
    }
    
});

module.exports = EgoProtagonistLocal;