/*jslint node: true */
"use strict";

var cc = require('cc'),
    smog = require('fgtk/smog'),
    b2 = require('jsbox2d'),
    flame = require('fgtk/flame'),
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract');

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
        this.opts = opts || {};
    },

    onConnection: function() {
        var socket = this.opts.socket;
        this.sibling = new smog.entity.Sibling({});
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
            socket.emit('runScene');
        }.bind(this));

        setTimeout(this.delayedNonsense.bind(this), 5000);
    },

    delayedNonsense: function() {
        var cm = this.opts.fe.opts.cosmosManager;
        var thing = new flame.entity.Thing({
            plan: cm.get('thing/flora/tree-blue-round'),
            l: {
                x: 5,
                y: 5
            },
            a: 0
        });
        this.opts.fe.injectThing(thing);
    }
});

module.exports = Shadow;
