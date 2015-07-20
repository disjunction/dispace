/*jslint node: true */
"use strict";

var cc = require('cc'),
    UiController = require('./UiController'),
    PropMonitor = require('./panel/PropMonitor'),
    SelectionBarPanel = require('./panel/SelectionBarPanel'),
    TurretPointerHudComponent = require('./hud/TurretPointerHudComponent');

/**
 * Builds some basic UI elements for devs
 * opts:
 * * mouseThing
 * * fe
 * * viewport
 */
var UiDevBuilder = cc.Class.extend({
    ctor: function(opts) {
        this.opts = opts;
        this.cosmosManager = this.opts.fe.opts.cosmosManager;
    }
});

var _p = UiDevBuilder.prototype;

_p.initTurretPointer = function(uiController, ego, turretComponent, cursorPlanSrc, number) {
    if (!turretComponent) return;
    var hudTurrentPointer = new TurretPointerHudComponent({
        interval: 0.10,
        cursorPlan: this.cosmosManager.get(cursorPlanSrc),
        ego: ego,
        turretComponent: turretComponent,
        viewport: this.opts.viewport,
        fe: this.opts.fe
    });
    uiController.registerElement('hudTurretPointer' + number, hudTurrentPointer);
};

_p.initHud = function(uiController, ego) {
    var selector = $('#panel-dev-1 .panel-body');
    selector.html('');
    // dev1 hud
    this.dev1 = new PropMonitor({
        selector: selector,
        thing: ego,
        interval: 1
    });

    this.dev1.addProp('coord', function(thing) {
        return thing.l;
    });
    this.dev1.addProp('awake', function(thing) {
        return thing.body.IsAwake();
    });
    this.dev1.addProp('fps / calls / dt', function(thing) {
        return cc.director._frameRate.toFixed(1) + ' / ' +
               (0 | cc.g_NumberOfDraws).toString() + ' / ' +
               cc.director._secondsPerFrame.toFixed(3);

    });
    this.dev1.addProp('mouse-coord', function(thing) {
        return this.opts.mouseThing.l;
    }.bind(this));
    this.dev1.addProp('camera-anchor', function(thing) {
        return this.opts.viewport.camera.anchor;
    }.bind(this));
    this.dev1.addProp('camera-location', function(thing) {
        return this.opts.viewport.camera.cameraLocation;
    }.bind(this));
    uiController.registerElement('dev1', this.dev1);


    this.selectionBarPanel1 = new SelectionBarPanel({
        selector: $('#panel-selection-1 .panel-body'),
        interval: 0.3
    });
    this.selectionBarPanel1.setThing(ego);
    uiController.registerElement('selectionBarPanel1', this.selectionBarPanel1);

    this.initTurretPointer(uiController, ego,
        ego.assembly.opts.components.turret1,
        'thing/ui/primary-pointer', 1);

    this.initTurretPointer(uiController, ego,
        ego.assembly.opts.components.turret2,
        'thing/ui/secondary-pointer', 2);
};

module.exports = UiDevBuilder;
