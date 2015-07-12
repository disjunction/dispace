/*jslint node: true */
"use strict";

var cc = require('cc'),
    flame = require('fgtk/flame'),
    ModuleAbstract = flame.engine.ModuleAbstract;

var ModuleWillMaster = ModuleAbstract.extend({
    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);
    },

    // this should be called only by local client
    registerDirectWill: function() {
        this.addNativeListeners([
            "will"
        ]);
    },

    processWillArray: function(willArray, siblingId) {
        for (var i = 0; i < willArray.length; i++) {
            this.processWill(willArray[i], siblingId);
        }
    },

    /**
     * TODO processWill() should call this, not vice-versa
     */
    onWill: function(event) {
        this.processWill([
            'wa', // FIXME :)
            event.operation,
            event.params || null
        ], event.sibling.siblingId);
    },

    processWill: function(will, siblingId) {
        var willId = will[0],
            willOperation = will[1],
            params = will.length > 2 ? will[2] : null;

        if (this[willOperation]) {
            this[willOperation](willId, siblingId, params);
        } else {
            throw new Error('unknow will operation ' + willOperation);
        }
    },

    controlRover: function(willId, siblingId, params) {
        var thing = this.fe.thingMap[params.thingId],
            proxyEvent = {
                type: 'controlRover',
                thing: thing
            };

        function applyTurret(name, bundle) {
            if (thing.c && thing.c[name]) {
                thing.c[name].thing.aa = bundle[0];
                thing.c[name].thing.o = bundle[1];
                proxyEvent[name] = thing.c[name].thing;
            }
        }

        if (!thing) {
            console.error('unknown thing ' + params.thingId);
            return;
        }

        if (params.turret1) {
            applyTurret('turret1', params.turret1);
        }

        if (params.turret2) {
            applyTurret('turret2', params.turret2);
        }

        this.fe.fd.dispatch(proxyEvent);
    },

    spawnRover: function(willId, siblingId, params) {
        var cm = this.fe.opts.cosmosManager,
            assemblyPlan = cm.get(params.assemblySrc),
            rover = this.fe.opts.roverBuilder.makeRoverByAssemblyPlan(assemblyPlan),
            sibling = this.fe.siblingMap[siblingId],
            avatar = new flame.entity.Avatar({
                sibling: sibling,
                thing: rover
            });

        // if there is already another avatar for the same sibling,
        // then first remove the old one
        if (sibling.avatar) {
            this.fe.removeThing(sibling.avatar.opts.thing);
        }

        rover.inert = true;
        rover.l = cc.p(5,5);


        if (rover.plan.states.spawn) {
            rover.s = "spawn";
        }

        this.fe.injectThing(rover);

        // this message duplicates initial injectSibling
        // this is done to avoid orphan Things
        this.fe.injectSibling(sibling);

        this.fe.injectAvatar(avatar);

        this.fe.scheduler.scheduleIn(1.5, {
            type: "inert",
            thing: rover,
            inert: false
        });
    },

});

module.exports = ModuleWillMaster;
