var cc = require('cc'),
    Interactor = require('fgtk/flame/view/Interactor'),
    rofCore = require('fgtk/flame/rof/core'),
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
     * * ego
     * @param opts object
     */
    ctor: function(opts) {
        this.opts = opts;
        this.setupInteractor();
        this.ego = opts.ego;
    },

    selectUnderMouse: function(evt, index) {
        var thingFinder = this.opts.fe.m.b.thingFinder,
            l = this.opts.viewport.targetToScrolledLocation(this.opts.mouseThing.l),
            thing = thingFinder.findThingAtLocation(l);

        var ui = this.opts.uiController;
        var panel = (index == 1) ? ui.elements.selectionPanel1 : ui.elements.selectionPanel2;
        if (panel) {
            panel.setThing(thing);
        }
    },

    applyMouseDown: function(evt, index) {
        var state = this.opts.interactor.state;
        switch (1) {
            case state.ctrl:
                return this.selectUnderMouse(evt, index);
            default:
                var turret = (index == 1) ? this.ego.c.turret1 : this.ego.c.turret2;
                if (turret) {
                    turret.mode  = 'charge';
                }
        }
    },

    applyMouseUp: function(evt, index) {
        var turret = (index == 1) ? this.ego.c.turret1 : this.ego.c.turret2;
        if (turret) {
            turret.mode  = 'none';
        }
    },


    setupInteractor: function() {
        keys = this.opts.interactor.layout.keys;
        keys[Interactor.ARROW_UP] = keys[Interactor.KEY_W] = [{type: 'state', state: rofCore.ACCELERATE}];
        keys[Interactor.ARROW_DOWN] = keys[Interactor.KEY_S] = [{type: 'state', state: rofCore.DECELERATE}];
        keys[Interactor.ARROW_LEFT] = keys[Interactor.KEY_A] = [{type: 'state', state: rofCore.TURN_LEFT}];
        keys[Interactor.ARROW_RIGHT] = keys[Interactor.KEY_D] = [{type: 'state', state: rofCore.TURN_RIGHT}];

        keys[Interactor.LMB] = [
            {type: 'event', on: 'keyDown', event: 'mouseDown1'},
            {type: 'event', on: 'keyUp', event: 'mouseUp1'},
            {type: 'state', state: 'charge1'}
        ];

        keys[Interactor.RMB] = [
            {type: 'event', on: 'keyDown', event: 'mouseDown2'},
            {type: 'event', on: 'keyUp', event: 'mouseUp2'},
            {type: 'state', state: 'charge2'}
        ];

        keys[Interactor.KEY_Q] = [{type: 'state', state: 'strafeLeft'}];
        keys[Interactor.KEY_E] = [{type: 'state', state: 'strafeRight'}];

        keys[Interactor.CTRL] = [
            {type: 'state', state: 'ctrl'},
            {type: 'event', on: 'keyUp', event: 'ctrlUp'},
            {type: 'event', on: 'keyDown', event: 'ctrlDown'}
        ];
        keys[Interactor.SHIFT] = [
            {type: 'state', state: 'shift'},
            {type: 'event', on: 'keyUp', event: 'shiftUp'},
            {type: 'event', on: 'keyDown', event: 'shiftDown'}
        ];

        keys[Interactor.KEY_T] = [
            {type: 'event', on: 'keyUp', event: 'target'}
        ];

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
                case 'target':
                    console.log(this.opts.interactor.state); break;

                case 'mouseDown1':
                    me.applyMouseDown(evt, 1); break;

                case 'mouseDown2':
                    me.applyMouseDown(evt, 2); break;

                case 'mouseUp1':
                    me.applyMouseUp(evt, 1); break;

                case 'mouseUp2':
                    me.applyMouseUp(evt, 2); break;

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
            switch (true) {
                case interState[rofCore.DECELERATE] && me.ego.stateName != 'driveBackward':
                    me.opts.fe.m.c.changeState(me.ego, 'driveBackward');
                    break;
                case (me.ego.stateName != 'driveForward' &&
                     (
                         interState[rofCore.ACCELERATE] == 1||
                         interState[rofCore.TURN_LEFT]  == 1||
                         interState[rofCore.TURN_RIGHT] == 1
                    )):
                    me.opts.fe.m.c.changeState(me.ego, 'driveForward');
                    break;
                case (me.ego.stateName != 'stop' &&
                     !(
                         interState[rofCore.ACCELERATE] == 1||
                         interState[rofCore.TURN_LEFT]  == 1||
                         interState[rofCore.TURN_RIGHT] == 1 ||
                         interState[rofCore.DECELERATE] == 1
                    )):
                    me.opts.fe.m.c.changeState(me.ego, 'stop');
                    break;
            }
        };

        var applier = new InteractorApplier();
        this.opts.interactor.applier = applier;
    }
});

module.exports = EgoInteractorApplier;
