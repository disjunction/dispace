/*jslint node: true */
"use strict";

var cc = require('cc'),
    AbstractGenerator = require('./AbstractGenerator');

var hordeMapping = {
    "HordeRandom": require('dispace/ai/horde/HordeRandom'),
    "HordeDumby": require('dispace/ai/horde/HordeDumby'),
};

var questMapping = {
    "QuestGuildDrones": require('dispace/field/quest/QuestGuildDrones'),
};

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

        if (fieldPlan.ai) {
            this.processAi(this.field, fieldPlan);
        }
        this.processQuests(this.field, fieldPlan);

        return this.field;
    },

    processAi: function(field, fieldPlan) {
        if (fieldPlan.ai.hordes) {
            for (var i in fieldPlan.ai.hordes) {
                var hordePlan = fieldPlan.ai.hordes[i],
                    HordeClass = hordeMapping[hordePlan.className];
                if (!HordeClass) {
                    throw new Error('unknown horde class "' + hordePlan.className + '" for horde: ' + i);
                }
                var opts = {
                    name: i,
                    plan: hordePlan,
                    fe: this.opts.fe,
                };
                var horde = new HordeClass(opts);
                field.ai.hordes[i] = horde;
            }
        }
    },

    /**
     * FIXME this looks so much alike processAi  it should be a reusable code
     */
    processQuests: function(field, fieldPlan) {
        if (fieldPlan.quests) {
            for (var i in fieldPlan.quests) {
                var questPlan = fieldPlan.quests[i],
                    QuestClass = questMapping[questPlan.className];
                if (!QuestClass) {
                    throw new Error('unknown quest class "' + questPlan.className + '" for quest: ' + i);
                }
                var opts = {
                    name: i,
                    plan: questPlan,
                    fe: this.opts.fe,
                };
                var quest = new QuestClass(opts);
                field.quests[i] = quest;
            }
        }
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
