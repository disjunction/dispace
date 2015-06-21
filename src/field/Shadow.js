/*jslint node: true */
"use strict";

var cc = require('cc'),
    smog = require('fgtk/smog'),
    b2 = require('jsbox2d'),
    flame = require('fgtk/flame');

/**
 * Server Socket Handler, created for each connection
 * and holding the combination of a sibling and socket
 * responsible for basic dislex interaction until field takes over
 */
var Shadow = cc.Class.extend({
    /**
     * opts:
     * * fe
     * * socket
     * * fieldSocketManager
     */
    ctor: function(opts) {
        if (!opts.fe) {
            throw new Error('Shadow requires fe in opts');
        }
        this.fe = opts.fe;
        this.thingSerializer = this.fe.serializer.opts.thingSerializer;
        this.opts = opts;
    },

    initConnnectionForSibling: function(sibling) {
        var socket = this.opts.socket;
        this.sibling = sibling;
        this.fe.injectSibling(sibling);
        this.opts.fieldSocketManager.push(socket);

        console.log('socket ' + socket.socketId + ' connected');

        socket.on('readyForFeed', function() {
            socket.readyForFeed = true;
            console.log('socket ' + socket.socketId + ' is ready');
        });
        socket.on('sup', function(msg) {
            console.log('initialField with ' + this.opts.fe.field.things.length + ' objects');
            var serialized = this.opts.fe.serializer.serializeInitial(this.opts.fe.field);
            socket.emit('initialField', serialized);
            socket.emit('runScene', {
                sibling: this.fe.opts.pumpkin.serializer.serializeSibling(sibling)
            });
        }.bind(this));

        socket.on('a', function(msg) {
            this.receiveActivity(msg);
        }.bind(this));
    },

    onConnection: function() {
        this.fe.opts.pumpkinClient.createAnonymousSibling()
            .then(this.initConnnectionForSibling.bind(this))
            .catch(console.error.bind(console));
    },

    receiveActivity: function(msg) {
        var activityType = msg[0],
            payload = msg[1],
            simSum = msg[2]; // not used now

        var siblingId = this.sibling.siblingId;
        switch (activityType) {
            case "w":
                this.opts.fe.m.willMaster.processWillArray(payload, siblingId);
                break;
            case "i":
                if (this.sibling && this.sibling.avatar) {
                    var thing = this.sibling.avatar.opts.thing;
                    this.thingSerializer.applyInterstateBundle(thing, payload);
                    this.opts.fe.fd.dispatch({
                        type: "interstate",
                        thing: thing,
                        interstate: thing.i
                    });
                }
                break;
            default:
                throw new Error('unknown activity type: ' + activityType);
        }
    },

    delayedNonsense: function() {
        console.log('delayed nonsense');
        var cm = this.opts.fe.opts.cosmosManager;
        var plan = cm.get('assembly/faf-m17-m'),
            thing = this.opts.fe.opts.roverBuilder.makeRoverByAssemblyPlan(plan);
        thing.l = {x: 5, y: 5};
        this.opts.fe.injectThing(thing);
    }
});

module.exports = Shadow;
