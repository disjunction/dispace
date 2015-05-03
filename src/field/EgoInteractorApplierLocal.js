var cc = require('cc'),
    Interactor = require('fgtk/flame/view/Interactor'),
    rof = require('fgtk/flame/rof'),
    Thing  = require('fgtk/flame/entity/Thing');

var mouse;

var EgoInteractorApplier = cc.Class.extend({
    /**
     * opts:
     * * interactor
     * * protagonist
     * * viewport
     * * mouseThing
     * * fe
     * @param opts object
     */
    ctor: function(opts) { 
        this.opts = opts;
        this.setupInteractor();
        this.ego = opts.protagonist.opts.ego;
    },
    
    setupInteractor: function() {
        keys = this.opts.interactor.layout.keys;
        keys[Interactor.ARROW_UP] = keys[Interactor.KEY_W] = [{type: 'state', state: rof.ACCELERATE}];
        keys[Interactor.ARROW_DOWN] = keys[Interactor.KEY_S] = [{type: 'state', state: rof.DECELERATE}];
        keys[Interactor.ARROW_LEFT] = keys[Interactor.KEY_A] = [{type: 'state', state: rof.TURN_LEFT}];
        keys[Interactor.ARROW_RIGHT] = keys[Interactor.KEY_D] = [{type: 'state', state: rof.TURN_RIGHT}];

        keys[Interactor.LMB] = [
            {type: 'event', on: 'keyDown', event: 'fire1'},
            {type: 'event', on: 'keyUp', event: 'release1'},
            {type: 'state', state: 'charge1'}
        ];
        
        keys[Interactor.RMB] = [
            {type: 'event', on: 'keyDown', event: 'fire2'},
            {type: 'event', on: 'keyUp', event: 'release2'},
            {type: 'state', state: 'charge2'}
        ];
        
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

        function updateCamera() {
            if (me.opts.protagonist.baseScale < 0.2) {
                me.opts.fe.m.c.opts.skipElevation = true;
            } else {
                me.opts.fe.m.c.opts.skipElevation = false;
            }
            me.opts.viewport.scaleCameraTo(me.opts.protagonist.baseScale);
        }

        _p.applyEvent = function(evt, name) {           
            switch(name) {
                case 'fire1':
                    if (this.ego.c.turret1) {
                        this.ego.c.turret1.mode = 'charge';
                    }
                    break;
                
                case 'fire2':
                    if (this.ego.c.turret2) {
                        this.ego.c.turret2.mode = 'charge';
                    }
                    break;
                    
                case 'release1':
                    if (this.ego.c.turret1) {
                        this.ego.c.turret1.mode = 'none';
                    }
                    break;
                
                case 'release2':
                    if (this.ego.c.turret2) {
                        this.ego.c.turret2.mode = 'none';
                    }
                    break;
                
                case 'testClick':
                    var location = me.opts.viewport.targetToScrolledLocation(me.opts.mouseThing.l);
                    var plan = me.opts.fe.opts.cosmosManager.getResource('thing/bg/util/red-lamp'),
                        thing = new Thing({
                            plan: plan,
                            l: location
                        });
                    me.opts.fe.injectThing(thing);
                    
                    break;
                case 'zoomIn':
                    me.opts.protagonist.baseScale *= 1.25;
                    updateCamera();
                    break;
                case 'zoomOut':
                    me.opts.protagonist.baseScale /= 1.25;
                    updateCamera();
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
        }.bind(this);

        _p.applyState = function(interState) {
        };

        var applier = new InteractorApplier();
        this.opts.interactor.applier = applier;
    }
});

module.exports = EgoInteractorApplier;
