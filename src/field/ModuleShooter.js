var cc = require('cc'),
    b2 = require('jsbox2d'),
    flame = require('fgtk/flame'),
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract');
    
var ModuleShooter = cc.Class.extend({
    ctor: function(opts) {
        this.opts = opts || {};
    },

    injectFe: function(fe, name) {
        this.di = 0; // dispace iteration
        this.importantThings = [];
        
        ModuleAbstract.prototype.injectFe.call(this, fe, name);
        
        this.shooterIid = 0;
        
        this.ray = new flame.engine.ray.RayClosestFilterFunction({
            filterFunction: function(thing) {
                if (thing.__instanceId == this.shooterIid) {
                    return true;
                }
            }.bind(this)
        });
    },
    
    /**
     * a wrapper around the shoot, which checks first the conditions and only then fires
     * @param {Thing} subjThing
     * @param {Component} subjComponent
     * @returns {shotResult|null}
     */
    attemptShoot: function(subjThing, subjComponent) {
        if (subjComponent.lastShot + subjComponent.params.chargeTime < this.fe.timeSum) {
            var shotResult = this.shoot(subjThing, subjComponent);
            this.fe.fd.dispatch({
                type: 'injectShot',
                shot: shotResult.shot
            });
            subjComponent.lastShot = this.fe.timeSum;
            return shotResult;
        } else {
            return null;
        }
    },
    
    shoot: function(subjThing, subjComponent) {
        this.shooterIid = subjThing.__instanceId;
        var result = {},
            range = subjComponent.params.range,
            turretThing = subjComponent.thing;
        
        this.fe.m.b.rayCastFromThing(this.ray, turretThing, range, subjComponent.opts.radius);
    
        if (this.ray.isHit) {
            var endPoint = cc.clone(this.ray.results[0].p);
            result.hit = {
                l: endPoint,
                damage: {
                    a: 10,
                    i: 1
                },
                subjComponent: subjComponent
            };
            
            result.shot = {
                isHit: true,
                l1: this.ray.muzzlePoint,
                l2: endPoint,
                subjComponent: subjComponent
            };
        } else {
            result.shot = {
                isHit: false,
                l1: this.ray.muzzlePoint,
                l2: this.ray.missPoint,
                subjComponent: subjComponent
            };
        }
        
        return result;
    }
});

module.exports = ModuleShooter;