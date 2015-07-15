/*jslint node: true */
"use strict";

var cc = require('cc'),
    AbstractGenerator = require('./AbstractGenerator');

/**
 * Generates fields based on field plans
 */
var PlanGenerator =  AbstractGenerator.extend({
    generateByPlan: function(fieldPlan) {
        if (fieldPlan.size) {
            this.field.size = fieldPlan.size;
        }

        if (Array.isArray(fieldPlan.procedures)) {
            for (var i = 0; i < fieldPlan.procedures.length; i++) {
                this.runProcedure(fieldPlan.procedures[i]);
            }
        }

        if (fieldPlan.spawnPoints) {
            this.field.spawnPoints = fieldPlan.spawnPoints;
        }

        return this.field;
    },

    runProcedure: function(procedure, fieldPlan) {
        var procName = procedure[0],
            procParams = procedure.length > 1 ? procedure[1] : [],
            methodName = "proc" + procName.charAt(0).toUpperCase() + procName.substring(1);
        if (!this[methodName]) {
            throw new Error('unknown procedure ' + procName + ' while generating field by plan');
        }
        this[methodName].apply(this, procParams);
    },

    procTileField: function(tileSize, thingPlansSrcList) {
        if (!tileSize) {
            tileSize = 64;
        }
        if (!thingPlansSrcList) {
            thingPlansSrcList = ['thing/bg/x4'];
        }
        var plans = this.cosmosManager.getByArray(thingPlansSrcList);
        this.tileField(plans, tileSize);
    },

    procCluster: function(params) {
        this.cluster(params);
    },
});

module.exports = PlanGenerator;
