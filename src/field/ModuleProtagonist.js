var cc = require('cc'),
    b2 = require('jsbox2d'),
    geo = require('fgtk/smog').util.geo,
    Interactor = require('fgtk/flame/view/Interactor');

var ModuleProtagonist = cc.Class.extend({
    /**
     * opts:
     * * fe
     * * viewport
     * * syncCamera : boolean
     * * hd - hud event dispatcher
     * @param opts object
     */
    ctor: function(opts) {
        this.opts = opts;
        this.cameraShift = cc.p(0, 0);
        this.cameraThreshold = 3;
        this.cameraScaleThreshold = 5;
        this.cameraMaxShift = 7;
        this.baseScale = 0.5;
        this.opts.fe.fd.addListener('renderEnd', this.step.bind(this));
    },

    injectFe: function() {},

    registerInteractorApplier: function(interactorApplier) {
        this.interactorApplier = interactorApplier;
        this.ego = interactorApplier.ego;
        this.mouse = interactorApplier.opts.mouseThing;
    },

    unregisterInteractorApplier: function() {
        this.interactorApplier = null;
        this.ego = null;
        this.mouse = null;
    },

    adjustCameraShift: function(velocity, shift) {
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
        var targetScale = this.baseScale - Math.min(this.baseScale * 0.6, additionalScale / 40);
        if (targetScale != this.opts.viewport.camera.scale) {
            this.opts.viewport.scaleCameraTo(targetScale);
        } else {
        }
    },

    rotateTurret: function(rover, turretThing, turretComponent, dt) {
        var mouseL = this.opts.viewport.targetToScrolledLocation(this.mouse.l),
            mouseAngle = geo.segment2Angle(turretThing.l, mouseL),
            closestRotation = geo.closestRotation(turretThing.a, mouseAngle),
            absClosestRotation = Math.abs(closestRotation),
            omega = turretComponent.params.omegaRad;

        if (absClosestRotation < 0.01) {
            turretThing.o = 0;
            return;
        }

        if (absClosestRotation < omega * dt) {
            turretThing.o = 0;
            turretThing.aa = mouseAngle - rover.a;
        } else {
            turretThing.o = geo.sign(closestRotation) * omega;
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

        if (Math.abs(this.cameraShift.x) > this.cameraThreshold) {
            shiftedX += this.cameraShift.x + (this.cameraShift.x > 0 ? -this.cameraThreshold : this.cameraThreshold);
        }
        if (Math.abs(this.cameraShift.y) > this.cameraThreshold) {
            shiftedY += this.cameraShift.y + (this.cameraShift.y > 0 ? -this.cameraThreshold : this.cameraThreshold);
        }

        this.opts.viewport.moveCameraToLocationXY(shiftedX, shiftedY);
        this.adjustCameraScale();
    },

    step: function(event) {
        var ego = this.ego;
        if (!ego) return;
        if (this.opts.syncCamera) {
            this.syncCamera(event.dt);
            if (ego.things.turret1) {
                this.rotateTurret(ego, ego.things.turret1, ego.assembly.opts.components.turret1, event.dt);
            }
            if (ego.things.turret2) {
                this.rotateTurret(ego, ego.things.turret2, ego.assembly.opts.components.turret2, event.dt);
            }
        }
    }
});

module.exports = ModuleProtagonist;
