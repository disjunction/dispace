/*jslint node: true, jasmine: true */
"use strict";

var dispace = require('dispace'),
    Rover = dispace.entity.thing.Rover,
    fixtures = require('dispace_tu/fixtures');

describe('dispace.entity.thing.Rover', function() {
    it('can be created', function() {
        var thing =  new Rover({
            assembly: fixtures.makeAssembly()
        });
    });
});
