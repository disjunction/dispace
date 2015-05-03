var b2 = require('jsbox2d'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract');

var radius;

/**
 * opts:
 * * viewport
 * * stateBuilder
 * * config
 */
var ModuleDispaceLocal = ModuleAbstract.extend({
    injectFe: function(fe, name) {
        this.di = 0; // dispace iteration
        this.importantThings = [];
        
        ModuleAbstract.prototype.injectFe.call(this, fe, name);

        this.fe.fd.addListener('injectThing', function(event) {
            var thing = event.extra.thing;
            if (thing.type && thing.type == 'rover') {
                this.envisionRover(thing);
                
                // store important for "us" things,
                // so that we iterate only through the relevant ones in poststep
                this.importantThings.push(thing);
            }
        }.bind(this));
        
        this.fe.fd.addListener('moveThing', function(event) {
            var thing = event.thing;
            if (thing.type && thing.type == 'rover') {
                this.stepAwakeRover(thing, event.dt)
            }
        }.bind(this));
        
        // mark start of the iteraction
        this.fe.fd.addListener('prestep', function(event) {
            this.di++;
        }.bind(this));
        
        // process things, which were not triggered by other events
        // this is done in a separate loop, to save double redraw on move and then rotate
        // these should be low-cost operations
        this.fe.fd.addListener('poststep', function(event) {
            for (var i = 0; i < this.importantThings.length; i++) {
                var thing = this.importantThings[i];
                if (thing.di != this.di) {
                    if (thing.type && thing.type == 'rover') {
                        this.stepSleepyRover(thing, event.dt);
                    }
                }
            }
        }.bind(this));
        
        this.fe.fd.addListener('injectShot', function(event) {
            var shotThing = this.makeShotThing(event.shot);
            this.fe.injectThing(shotThing);
            Thing.stretch(shotThing, event.shot.l2, event.shot.l1);
            this.fe.m.c.syncStateFromThing(shotThing);
            globalShot = shotThing;
        }.bind(this));
        
        this.fe.fd.addListener('injectHit', function(event) {
            this.envisionHit(event.hit);
        }.bind(this));
    },

    makeShotThing: function(shot) {
        var  thing = new Thing({
            plan: this.fe.opts.cosmosManager.getResource('thing/effect/shot/red-laser')
        });
        return thing;
    },
    
    envisionRover: function(thing) {
        // alias for socket definition
        thing.sockets = thing.assembly.opts.components['hull'].opts.sockets;
        
        for (var i in thing.things) {
            subthing = thing.things[i];
            this.fe.m.c.envision(subthing);
        }
        
        this.stepAwakeRover(thing, 0);
    },
    
    rotateComponent: function(thing, dt) {
        if (!thing.aa) {
            thing.aa = 0;
        }
        thing.aa += thing.o * dt;
    },
    
    stepSubthing: function(thing, subthing, dt) {
        if (subthing.o) this.rotateComponent(subthing, dt);
        subthing.a = thing.a + subthing.aa
        this.fe.m.c.syncStateFromThing(subthing);
    },
    
    stepComponent: function(thing, component, dt) {
        if (component.opts.subtype == 'turret') {
            if (component.mode == 'charge') {
                this.fe.m.shooter.attemptShoot(thing, component);
            }
        }
    },
    
    stepSleepyRover: function(rover, dt) {
        for (var i in rover.things) {
            this.stepSubthing(rover, rover.things[i], dt);
        }
        for (var i in rover.c) { // step component
            this.stepComponent(rover, rover.c[i], dt)
        }
    },
    
    stepAwakeRover: function(rover, dt) {
        var cos = Math.cos(rover.a),
            sin = Math.sin(rover.a);
        rover.di = this.di;
        
        for (var i in rover.things) {
            var subthing = rover.things[i],
                radius = rover.sockets[i].radius;
            
            subthing.l.x = rover.l.x + radius * cos;
            subthing.l.y = rover.l.y + radius * sin;
            this.stepSubthing(rover, subthing, dt);
            
        }
        for (var i in rover.c) { // step component
            this.stepComponent(rover, rover.c[i], dt)
        }
    }
});

module.exports = ModuleDispaceLocal;