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
        if (opts.ego) {
            this.registerEgo(opts.ego);
        }
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
        var interstate = this.opts.interactor.i;
        switch (true) {
            case interstate.map.ctrl:
                interstate.set('turret' + index, false);
                this.opts.interactor.fireChanged();
                return this.selectUnderMouse(evt, index);
            default:
                interstate.set('turret' + index, true);
                this.opts.interactor.fireChanged();
        }
    },

    applyMouseUp: function(evt, index) {
        this.opts.interactor.i.set('turret' + index, false);
        this.opts.interactor.fireChanged();
    },


    setupInteractorListeners: function(dispatcher) {
        var me = this;

        function updateCamera() {
            if (me.opts.protagonist.baseScale < 0.2) {
                me.opts.fe.m.c.opts.skipElevation = true;
            } else {
                me.opts.fe.m.c.opts.skipElevation = false;
            }
            me.opts.viewport.scaleCameraTo(me.opts.protagonist.baseScale);
        }

        dispatcher.addListener("interstateChanged", function(event) {
            var proxyEvent = {
                type: 'interstate',
                thing: me.ego,
                interstate: event.i
            };

            me.opts.fe.fd.dispatch(proxyEvent);
            proxyEvent.type = 'ownInterstate';
            me.opts.fe.fd.dispatch(proxyEvent);
        });

        dispatcher.addListener("mouseMove", function(event) {
            if (me.opts.mouseThing) {
                mouse = me.opts.mouseThing;
                mouse.l.x = event.event._x;
                mouse.l.y = event.event._y;
                mouse.state.nodes.main.setPosition(mouse.l);
            }
        });

        dispatcher.addListener("mouseDown1", function(event) {
            me.applyMouseDown(event.event, 1);
        });
        dispatcher.addListener("mouseDown2", function(event) {
            me.applyMouseDown(event.event, 2);
        });
        dispatcher.addListener("mouseUp1", function(event) {
            me.applyMouseUp(event.event, 1);
        });
        dispatcher.addListener("mouseUp2", function(event) {
            me.applyMouseUp(event.event, 2);
        });
        dispatcher.addListener("zoomIn", function(event) {
            me.opts.protagonist.baseScale *= 1.25;
            updateCamera();
        });
        dispatcher.addListener("zoomOut", function(event) {
            me.opts.protagonist.baseScale /= 1.25;
            updateCamera();
        });
    },

    registerEgo: function(ego) {
        if (this.ego && this.ego.i ) {
            // hack: disconnect the old ego from current interractor
            this.ego.i = new Interactor.Interstate();
        }

        this.ego = ego;
        this.ego.i = this.opts.interactor.i;
    },

    unregisterEgo: function(ego) {
        delete this.ego.i;
        this.ego = null;
    },

    setupInteractor: function() {
        var interactor = this.opts.interactor;

        this.setupInteractorListeners(interactor.dispatcher);

        events = interactor.layout.events;
        states = interactor.layout.states;

        states[Interactor.ARROW_UP] = states[Interactor.KEY_W] = rofCore.ACCELERATE;
        states[Interactor.ARROW_DOWN] = states[Interactor.KEY_S] = rofCore.DECELERATE;
        states[Interactor.ARROW_LEFT] = states[Interactor.KEY_A] = rofCore.TURN_LEFT;
        states[Interactor.ARROW_RIGHT] = states[Interactor.KEY_D] = rofCore.TURN_RIGHT;

        events[Interactor.LMB] = {
            keyDown: 'mouseDown1',
            keyUp: 'mouseUp1'
        };

        events[Interactor.RMB] = {
            keyDown: 'mouseDown2',
            keyUp: 'mouseUp2'
        };

        states[Interactor.KEY_Q] = 'strafeLeft';
        states[Interactor.KEY_E] = 'strafeRight';

        events[Interactor.CTRL] = {
            keyDown: "ctrlDown",
            keyUp: "ctrlUp"
        };
        states[Interactor.CTRL] = "ctrl";

        events[Interactor.SHIFT] = {
            keyDown: "shiftDown",
            keyUp: "shiftUp"
        };
        states[Interactor.SHIFT] = "shift";

        events[Interactor.MINUS] = events[Interactor.CHROME_MINUS] = {keyUp: "zoomOut"};
        events[Interactor.EQUAL] = events[Interactor.CHROME_EQUAL] = {keyUp: "zoomIn"};
        events[Interactor.SCROLL] = {
            scrollDown: "zoomOut",
            scrollUp: "zoomIn"
        };
    }
});

module.exports = EgoInteractorApplier;
