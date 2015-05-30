/*jslint node: true */
"use strict";

var smog = require('fgtk/smog'),
    UidGenerator = smog.util.UidGenerator;

/**
 * opts:
 * * fe
 * * doomDispatcher
 */
function FieldSocketManager(opts) {
    this.opts = opts;
    this.uidGenerator = new UidGenerator('s');
    this.socketMap = {};
}

var _p = FieldSocketManager.prototype;

/**
 * params:
 * * {socket.io.socket} socket
 * * player
 */
_p.push = function(socket) {
    socket.socketId = this.uidGenerator.getNext();
    this.socketMap[socket.id] = socket;
};

_p.broadcast = function(event) {
    for (var i in this.socketMap) {
        var socket = this.socketMap[i];
        if (socket.readyForFeed) {
            socket.emit('f', event);
        }
    }
};

module.exports = FieldSocketManager;
