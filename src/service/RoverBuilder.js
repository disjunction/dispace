var cc = require('cc'),
    flame = require('fgtk/flame'),
    Interstate = flame.view.Interactor.Interstate,
    Assembly = require('dispace/entity/Assembly'),
    Rover = require('dispace/entity/thing/Rover');
/**
 * opts:
 * * gutsManage
 * * itemManager
 * * thingBuilder
 */
var RoverBuilder = cc.Class.extend({

    ctor: function(opts) {
        if (!opts.itemManager) {
            throw new Error('RoverBuilder requires "itemManager" opt');
        }
        this.opts = opts;
        this.cosmosManager = this.opts.itemManager.opts.cosmosManager;
    },

    makeRoverByAssemblyPlan: function(assemblyPlan) {
        var assembly = this.makeAssembly(assemblyPlan);
        return this.makeRover(assembly);
    },
    makeRover: function(assembly) {
        var hull = assembly.opts.components.hull,
            hullPlan = this.cosmosManager.getResource(hull.opts.planSrc),
            rover = new Rover({
                plan: hullPlan,
                assembly: assembly
            });

        for (var i in assembly.opts.components) {
            if (i != 'hull') {
                var component = assembly.opts.components[i],
                    planSrc = component.opts.planSrc,
                    plan;

                if (planSrc) {
                    plan = this.cosmosManager.getResource(component.opts.planSrc);
                    rover.things[i] = this.opts.thingBuilder.makeThingByPlan(plan);

                    // alias
                    component.thing = rover.things[i];

                    // rotation relative to hull
                    rover.things[i].a = 0;
                    rover.things[i].aa = 0;
                }
            }
        }

        rover.i = new Interstate();

        // short alias for accessing components
        rover.c = assembly.opts.components;
        rover.g = this.opts.gutsManager.makeGutsByAssembly(assembly);
        rover.sockets = assembly.opts.components.hull.opts.sockets;
        this.opts.gutsManager.fullRecover(rover.g);

        return rover;
    },

    makeAssembly: function(assemblyPlan) {
        if (!assemblyPlan.components) {
            throw new Error('assemblyPlan must contain "components" property');
        }
        var components = {};
        for (var i in assemblyPlan.components) {
            var component = assemblyPlan.components[i],
                m = component.match(/(.+):(.+)/);

            if (m) {
                component = m[1];
                mark = m[2];
            } else {
                mark = "1";
            }

            components[i] = this.opts.itemManager.makeItem(
                component,
                'component'
            );
            components[i].setMark(mark);
            components[i].role = i;
        }
        return new Assembly({
            components: components,
            plan: assemblyPlan
        });
    }
});

module.exports = RoverBuilder;
