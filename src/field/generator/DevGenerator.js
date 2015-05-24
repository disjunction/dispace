var flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    Field = flame.entity.Field,
    b2 = require('jsbox2d'),
    Rover = require('dispace/entity/thing/Rover'),
    geo = require('fgtk/smog').util.geo;

/**
 * opts:
 * * fe - field engine
 * * cosmosManager
 * @param {object} opts
 * @returns {DevGenerator}
 */
function DevGenerator(opts) {
    this.opts = opts;

    this.size = {width: 128, height: 128};

    this.cosmosManager = this.opts.fe.opts.cosmosManager;
    this.itemManager = new dispace.entity.ItemManager({
        cosmosManager: this.cosmosManager
    });
    this.thingBuilder = new flame.service.ThingBuilder({
    });

    this.gutsManager = new dispace.service.GutsManager({
    });

    this.roverBuilder = new dispace.service.RoverBuilder({
        itemManager: this.itemManager,
        thingBuilder: this.thingBuilder,
        gutsManager: this.gutsManager
    });
}

var _p = DevGenerator.prototype;

_p.makeField = function(){
    var field = this.makeField2();
    this.ego = this.makeEgo();
    field.things.push(this.ego);
    return field;
};

_p.makeEgo = function(){
    var assembly = this.roverBuilder.makeAssembly({
        components: {
            hull: 'item/component/hull/faf-m29',
            turret1: 'item/component/turret/security-ripeater:2',
            turret2: 'item/component/turret/arymori-jean',
            engine: 'item/component/engine/green-g2',
        }
    });

    var rover = this.roverBuilder.makeRover(assembly);
    rover.l = {x: 7, y: 7};
    rover.player = true;
    return rover;
};

_p.makeFieldRandom = function(){
    var field = new Field();
    for (var i = 0; i < 10; i++) {
        field.things.push(
            new Thing({
                plan: this.opts.fe.opts.cosmosManager.getResource('thing/obstacles/obstacle4x2'),
                l: {
                    x: Math.random() * 20,
                    y: Math.random() * 10
                },
                a: 0
            })
        );
    }

    return field;
};

_p.makeField2 = function(){
    var field = new Field();
    //var plan = this.opts.fe.opts.cosmosManager.getResource('thing/bg/vicinity1');
    var plan = this.opts.fe.opts.cosmosManager.getResource('thing/bg/x4');


    field.things.push(new Thing({
        plan: plan,
        l: {x: 32, y: 32}
    }));
    field.things.push(new Thing({
        plan: plan,
        l: {x: 32+64-2/32, y: 32}
    }));
    field.things.push(new Thing({
        plan: plan,
        l: {x: 32, y: 32+64-2/32}
    }));
    field.things.push(new Thing({
        plan: plan,
        l: {x: 32+64-2/32, y: 32+64-2/32}
    }));

    var rover;

    for (var i = 0; i < 3; i++) {
        var assembly;

        assembly = this.roverBuilder.makeAssembly({
            components: {
                hull: 'item/component/hull/zawot-rocket',
                turret1: 'item/component/turret/security-ripeater',
                engine: 'item/component/engine/lamarck-donkey',
            }
        });
        rover = this.roverBuilder.makeRover(assembly);
        rover.l = {x: 5, y: 10 + i * 5};
        rover.i = {};
        field.things.push(rover);

        assembly = this.roverBuilder.makeAssembly({
            components: {
                hull: 'item/component/hull/faf-m17',
                turret1: 'item/component/turret/security-ripeater',
                engine: 'item/component/engine/lamarck-donkey',
            }
        });

        rover = this.roverBuilder.makeRover(assembly);
        rover.l = {x: 10, y: 10 + i * 5};
        rover.i = {};
        field.things.push(rover);
    }
    this.victim = rover;

    this.pushEdgeDeco(field);

    for (i = 0; i < 20; i++) {
        field.things.push(
            new Thing({
                plan: this.opts.fe.opts.cosmosManager.getResource('thing/obstacles/house4x4'),
                l: {x: Math.random() * 60 + 30, y: Math.random() * 60 + 30},
                a: Math.random() * geo.PI2
            })
        );

        var tree;

        tree = new Thing({
            plan: this.opts.fe.opts.cosmosManager.getResource('thing/flora/tree-blue-round'),
            l: {x: Math.random() * 50 + 30, y: Math.random() * 60 + 30},
            a: Math.random() * geo.PI2
        });
        tree.type = 'tree';
        tree.g = {i: [10, 10]};
        field.things.push(tree);

        tree = new Thing({
            plan: this.opts.fe.opts.cosmosManager.getResource('thing/flora/tree-blue-bare'),
            l: {x: Math.random() * 50 + 30, y: Math.random() * 60 + 30},
            a: Math.random() * geo.PI2
        });
        tree.type = 'tree';
        tree.g = {i: [10, 10]};
        field.things.push(tree);

    }

    plan = this.opts.fe.opts.cosmosManager.getResource('thing/obstacles/house4x4');

    for (i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            if ((i == 0 || i == 4 || j == 4 || j == 0) && i !== 2 && j !== 2)
            field.things.push(
                new Thing({
                    plan: plan,
                    l: {x: 20 + i*4, y: 5+j*4},
                    a: 20 * geo.deg2Rad
                })
            );
        }
    }

    return field;
};


_p.applyImpulse = function(fe){
    var strength = 0.1;
    thing = this.victim;
    thing.body.SetLinearVelocity(new b2.Vec2(-20, -20));
};

_p.randomImpulse = function(fe){
    var things = fe.field.things;
    for (var i = 0; i < things.length; i++) {
        var thing = things[i];
        if (thing.body) {
            var strength = 1;
            thing.body.ApplyLinearImpulse(new b2.Vec2(Math.random()*strength - strength / 2, Math.random()*strength - strength / 2), new b2.Vec2(0, 0));
            console.log('impulse');
        }
    }
};

_p.pushEdgeDeco = function(field) {
    var edgeElementSize = {width: 16, height: 2},
        ppm = 32,
        planBottom = this.opts.fe.opts.cosmosManager.getResource('thing/bg/very-edge'),
        planTop = cc.clone(planBottom),
        planLeft = cc.clone(planBottom),
        planRight = cc.clone(planBottom),
        thing, i;

    planTop.states.basic.main.a = 180;
    planLeft.states.basic.main.a = -90;
    planRight.states.basic.main.a = 90;

    var bgPlan = {
        "static": true,
        "states" : {
            "basic" : {
                "color": {
                    "layer": "bg",
                    "type": "bar",
                    "color": "#a79a8e",
                    "width": this.size.width * ppm + 6400,
                    "height": this.size.height * ppm + 6400,
                    "zIndex": -100
                }
            }
        }
    };
    thing = new Thing({
        plan: bgPlan,
        l: cc.p(this.size.width / 2, this.size.height / 2)
    });

    field.things.push(thing);

    for (i = 0; i < this.size.width / edgeElementSize.width; i++) {
        thing = new Thing({
            plan: planBottom,
            l: cc.p(i * edgeElementSize.width + edgeElementSize.width / 2, -edgeElementSize.height / 2)
        });
        field.things.push(thing);

        thing = new Thing({
            plan: planTop,
            l: cc.p(i * edgeElementSize.width + edgeElementSize.width / 2, this.size.height + edgeElementSize.height / 2)
        });
        field.things.push(thing);

        globalEdge = thing;
    }
    for (i = 0; i < this.size.height / edgeElementSize.width; i++) {
        thing = new Thing({
            plan: planLeft,
            l: cc.p(-edgeElementSize.height / 2, i * edgeElementSize.width + edgeElementSize.width / 2)
        });
        field.things.push(thing);

        thing = new Thing({
            plan: planRight,
            l: cc.p(this.size.width + edgeElementSize.height / 2, i * edgeElementSize.width + edgeElementSize.width / 2)
        });
        field.things.push(thing);

        globalEdge = thing;
    }


};

_p.createEdges = function(){
    var edgeThing = new Thing();

    var size = this.size,
        points = [];
    points.push(new b2.Vec2(size.width, size.height));
    points.push(new b2.Vec2(0, size.height));
    points.push(new b2.Vec2(0, 0));
    points.push(new b2.Vec2(size.width, 0));
    this.opts.fe.m.b.makeLoopEdges(points, edgeThing);
};

module.exports = DevGenerator;
