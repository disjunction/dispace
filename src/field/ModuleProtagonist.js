/*jslint node: true */
"use strict";

var cc = require('cc'),
    b2 = require('jsbox2d'),
    smog = require('fgtk/smog'),
    Cospeak = smog.Cospeak,
    geo = smog.util.geo,
    util = smog.util.util,
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract'),
    Interactor = require('fgtk/flame/view/Interactor'),
    UiController = require('dispace/ui/UiController');

/**
 * should be added somewhere in the end of init
 */
var ModuleProtagonist = ModuleAbstract.extend({
    /**
     * opts:
     * * viewport
     * * syncCamera : boolean
     * * hd - hud event dispatcher
     * * dynamicCamera
     *
     * @param opts object
     */
    ctor: function(opts) {
        this.opts = opts;
        this.cameraShift = cc.p(0, 0);
        this.cameraThreshold = 3;
        this.cameraScaleThreshold = 5;
        this.cameraMaxShift = 7;
        this.baseScale = 0.5;

        this.uiController = new UiController({});

        // current mouse location in absolute phisical coords
        this.mouseL = cc.p();
    },

    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);

        this.addNativeListeners([
            "hit",
            "loopEnd",
            "removeThing",
            "injectSibling",
            "gutsUpdate",
            "sceneReady",
        ]);
    },

    registerSibling: function(sibling) {
        this.sibling = sibling;
    },

    registerInteractorApplier: function(interactorApplier) {
        if (this.interactorApplier) {
            this.unregisterInteractorApplier();
        }

        this.interactorApplier = interactorApplier;
        this.interactorApplier.opts.interactor.i.enabled = true;
        this.ego = interactorApplier.ego;
        this.mouse = interactorApplier.opts.mouseThing;
    },

    unregisterInteractorApplier: function() {
        console.log('unregistering');
        this.interactorApplier.opts.interactor.i.enabled = false;
        this.ego = null;
        this.mouse = null;
        this.uiController.unregister();
    },

    adjustCameraShift: function(velocity, shift) {
        var delta;
        if (velocity * shift < 0)  {
            delta = 0.05;
        } else {
            delta = 0.02;
        }

        if (velocity > shift) {
            if (shift >= this.cameraMaxShift || velocity - delta < shift) return shift;
            return shift + delta;
        } else {
            if (shift <= -this.cameraMaxShift || velocity + delta > shift) return shift;
            return shift - delta;
        }
    },

    adjustCameraScale: function() {
        var additionalScale = Math.sqrt(this.cameraShift.x * this.cameraShift.x + this.cameraShift.y * this.cameraShift.y);
        if (additionalScale > this.cameraScaleThreshold) {
            additionalScale -= this.cameraScaleThreshold;
        } else {
            additionalScale = 0;
        }
        var targetScale = this.baseScale - Math.min(this.baseScale - 0.15, additionalScale / 40);
        if (targetScale != this.opts.viewport.camera.scale) {
            this.opts.viewport.scaleCameraTo(targetScale);
        }
    },

    inSemiVisualRange: function(l) {
        if (!this.ego) {
            return false;
        }

        return (cc.pDistanceSQ(this.ego.l, l) < 1024); // 32*32 = 1024
    },

    rotateTurret: function(rover, turretThing, turretComponent, dt) {
        var mouseAngle = geo.segment2Angle(turretThing.l, this.mouseL),
            closestRotation = geo.closestRotation(turretThing.a, mouseAngle),
            absClosestRotation = Math.abs(closestRotation),
            omega = turretComponent.params.omegaRad;

        // tiny angle changes can be ignored as long as the turret rotates in the right direction
        // it will auto-lock by next condition as soon as it crosses the target angle

        if (absClosestRotation < 0.01 && turretThing.o && geo.sign(turretThing.o) != geo.sign(closestRotation)) {
            return;
        }


        if (absClosestRotation < 0.015) {
            if (turretThing.o !== 0) {
                turretThing.o = 0;
                turretThing.turretChanged = true;
            }
            return;
        }

        if (absClosestRotation < omega * dt) {
            turretThing.o = 0;
            turretThing.aa = mouseAngle - rover.a;
            turretThing.turretChanged = true;
        } else {
            var newO = geo.sign(closestRotation) * omega;
            if (turretThing.o != newO) {
                turretThing.turretChanged = true;
            }
            turretThing.o = newO;
        }
    },

    syncCamera: function(dt) {
        if (!this.ego) return;

        var ego = this.ego,
            v1 = ego.body.GetWorldCenter(),
            v2 = ego.body.GetLinearVelocity();

        this.cameraShift.x = this.adjustCameraShift(v2.x, this.cameraShift.x);
        this.cameraShift.y = this.adjustCameraShift(v2.y, this.cameraShift.y);

        var shiftedX = v1.x,
            shiftedY = v1.y;

        if (this.opts.dynamicCamera) {
            if (Math.abs(this.cameraShift.x) > this.cameraThreshold) {
                shiftedX += this.cameraShift.x + (this.cameraShift.x > 0 ? -this.cameraThreshold : this.cameraThreshold);
            }
            if (Math.abs(this.cameraShift.y) > this.cameraThreshold) {
                shiftedY += this.cameraShift.y + (this.cameraShift.y > 0 ? -this.cameraThreshold : this.cameraThreshold);
            }
        }

        this.opts.viewport.moveCameraToLocationXY(shiftedX, shiftedY);

        // we fire inaccurate camera coordinates (without shift),
        // but this way the Vec2 object is reused and coordinates are exactly the thing coords
        this.fe.eq.channel("moveCamera").broadcast(v1);

        if (this.opts.dynamicCamera) {
            this.adjustCameraScale();
        }
    },

    reconfigureBySibling: function(sibling) {
        var settings = sibling.settings,
            config = this.fe.opts.config;
        for (var i in settings) {
            config[i] = util.combineObjects(config[i], settings[i]);
        }

        var audioEngine = this.opts.viewport.getAudioEngine();
        if (audioEngine) {
            if (config.audio && undefined !== config.audio.effectVolume) {
                audioEngine.setEffectsVolume(config.audio.effectVolume);
            }
        }

        if (config.features) {
            this.opts.dynamicCamera = config.features.dynamicCamera;
        } else {
            this.opts.dynamicCamera = true;
        }
    },

    processMouseOver: function() {
        var thingFinder = this.fe.m.b.thingFinder,
            thing = thingFinder.findThingAtLocation(this.mouseL);
        if (thing && thing.g && this.uiController.elements.gutsHud) {
            this.uiController.elements.gutsHud.addToWatchList(thing);
        }
    },

    onHit: function(event) {
        var thing = event.hit.objThing;
        if (thing && thing.g && this.inSemiVisualRange(thing.l)) {
            if (this.uiController.elements.gutsHud) {
                this.uiController.elements.gutsHud.addToWatchList(thing);
            }
        }
    },

    onLoopEnd: function(event) {
        var me = this,
            ego = this.ego,
            controlEvent;

        if (this.mouse) {
            this.mouseL = this.opts.viewport.targetToScrolledLocation(this.mouse.l);
        }

        if (!ego) return;

        function callRotateTurrent(turretThing, turretComponent) {
            if (!me.ego.isControlled()) {
                return;
            }
            me.rotateTurret(me.ego, turretThing, turretComponent, event.dt);
            if (turretThing.turretChanged) {
                turretThing.turretChanged = false;
                if (controlEvent === undefined) {
                    controlEvent = {
                        thing: ego,
                    };
                }
                controlEvent[turretComponent.role] = turretThing;
            }
        }

        if (this.opts.syncCamera) {
            this.syncCamera(event.dt);

            if (ego.things.turret1) {
                callRotateTurrent(ego.things.turret1, ego.assembly.opts.components.turret1);
            }
            if (ego.things.turret2) {
                callRotateTurrent(ego.things.turret2, ego.assembly.opts.components.turret2);
            }
        }

        if (controlEvent !== undefined) {
            this.fe.eq.channel("controlRover").broadcast(controlEvent);
        }

        this.processMouseOver();

        this.uiController.update(event.dt);
    },

    onRemoveThing: function(event) {
        if (event.thing == this.ego) {
            this.unregisterInteractorApplier();
        }
    },

    onInjectSibling: function(event) {
        if (event.sibling == this.sibling) {
            this.reconfigureBySibling(event.sibling);
        }
    },

    onGutsUpdate: function(event) {
        var barPanel = this.fe.m.p.uiController.elements.selectionBarPanel1;
        if (barPanel && barPanel.thing == this.ego) {
            barPanel.doUpdate(true);
        }
    },

    // try to find a nice point to show before spawn
    onSceneReady: function(event) {
        var l = cc.p(0, 0),
            field = this.fe.field;

        if (field.spawnPoints) {
            if (field.spawnPoints.default) {
                l = Cospeak.readPoint(field.spawnPoints.default.l);
            } else {
                for (var i in field.spawnPoints) {
                    l = Cospeak.readPoint(field.spawnPoints[i].l);
                    break;
                }
            }
        }

        this.opts.viewport.moveCameraToLocationXY(l.x, l.y);
        this.fe.eq.channel("moveCamera").broadcast(l);
    },
});

module.exports = ModuleProtagonist;
