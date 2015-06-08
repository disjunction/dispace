/*jslint node: true */
"use strict";

var flame = require('fgtk/flame'),
    ThingSerializer = flame.service.serialize.ThingSerializer;

var serializerMapping = {
    'rover': require('./RoverSerializer')
};

/**
 * Delegates Serialization/Unserialization to serializers depending on thing.type
 */
var DispaceThingSerializer = ThingSerializer.extend({
    ctor: function(opts) {
        ThingSerializer.prototype.ctor.call(this, opts);
        this.serializers = {};
        for (var i in serializerMapping) {
            this.serializers[i] = new (serializerMapping[i])(opts);
        }
    }
});

var _p =  DispaceThingSerializer.prototype;

_p.serializeInitial = function(thing) {
    if (thing.type && this.serializers[thing.type]) {
        return this.serializers[thing.type].serializeInitial(thing);
    } else {
        return ThingSerializer.prototype.serializeInitial.call(this, thing);
    }
};

_p.unserializeInitial = function(bundle) {
    if (bundle[2].type && this.serializers[bundle[2].type]) {
        return this.serializers[bundle[2].type].unserializeInitial(bundle);
    } else {
        return ThingSerializer.prototype.unserializeInitial.call(this, bundle);
    }
};

module.exports = DispaceThingSerializer;
