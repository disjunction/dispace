var cc = require('cc'),
    Interactor = require('fgtk/flame/view/Interactor'),
    rof = require('fgtk/flame/rof');

var mouse;

var EgoInteractorApplier = cc.Class.extend({
    /**
     * opts:
     * * interactor
     * * viewport
     * * mouseThing
     * @param opts object
     */
    ctor: function(opts) { 
        this.opts = opts;
        this.setupInteractor();
    },
    
    setupInteractor: function() {
        keys = this.opts.interactor.layout.keys;
        keys[Interactor.ARROW_UP] = keys[Interactor.KEY_W] = [{type: 'state', state: rof.ACCELERATE}];
        keys[Interactor.ARROW_DOWN] = keys[Interactor.KEY_S] = [{type: 'state', state: rof.DECELERATE}];
        keys[Interactor.ARROW_LEFT] = keys[Interactor.KEY_A] = [{type: 'state', state: rof.TURN_LEFT}];
        keys[Interactor.ARROW_RIGHT] = keys[Interactor.KEY_D] = [{type: 'state', state: rof.TURN_RIGHT}];
        
        keys[Interactor.KEY_Q] = [{type: 'state', state: 'strafeLeft'}];
        keys[Interactor.KEY_E] = [{type: 'state', state: 'strafeRight'}];
        
        keys[Interactor.MINUS] = keys[Interactor.CHROME_MINUS] = [{type: 'event', on: 'keyUp', event: 'zoomOut'}];
        keys[Interactor.EQUAL] = keys[Interactor.CHROME_EQUAL] = [{type: 'event', on: 'keyUp', event: 'zoomIn'}];

        keys[Interactor.SCROLL] = [
            {type: 'event', on: 'up', event: 'zoomIn'},
            {type: 'event', on: 'down', event: 'zoomOut'}
        ];

        var me = this;
        
        function InteractorApplier() {
        }

        var _p = InteractorApplier.prototype;

        _p.applyEvent = function(evt, name) {           
            switch(name) {
                case 'zoomIn':
                    me.opts.viewport.scaleCameraTo(me.opts.viewport.camera.scale * 1.25);
                    break;
                case 'zoomOut':
                    me.opts.viewport.scaleCameraTo(me.opts.viewport.camera.scale / 1.25);
                    break;
                case 'mouseMove':
                    if (me.opts.mouseThing) {
                        mouse = me.opts.mouseThing;
                        mouse.l.x = evt._x;
                        mouse.l.y = evt._y;
                        mouse.state.nodes.main.setPosition(mouse.l);
                    }
                    break;
            }
        };

        _p.applyState = function(interState) {
        };

        var applier = new InteractorApplier();
        this.opts.interactor.applier = applier;
    }
});

module.exports = EgoInteractorApplier;
