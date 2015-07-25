var cc = require('cc'),
    geo = require('fgtk/smog').util.geo,
    SelfUpdater = require('dispace/ui/SelfUpdater');

var defaultConfig = {
    hideDelay: 7,
    switchDelay: 2,
};

function WatchElement(thing, simSum, gutsHudConfig) {
    this.thing = thing;

    this.hideSimSum = simSum + gutsHudConfig.hideDelay;
    this.switchSimSum = simSum + gutsHudConfig.switchDelay;

    this.g = {a: 0, s: 0, i: 0};
}

var GutsHudComponent = SelfUpdater.extend({
    /**
     * opts:
     * * viewport
     * * fe
     * @param opts object
     */
    ctor: function(opts) {
        this.fe = opts.fe;
        this.ego = this.fe.m.p.ego;
        this.uiController = this.fe.m.p.uiController;
        this.viewport = opts.viewport;
        this.cosmosManager = this.fe.opts.cosmosManager;
        this.moduleCocos = this.fe.m.c;
        this.stateBuilder = this.moduleCocos.opts.stateBuilder;

        this.gutsPlan = this.cosmosManager.get('thing/ui/guts-hud');
        this.statsState = this.stateBuilder.makeState(this.gutsPlan, 'basic');

        this.watchList = {};

        this.animate = {
            i: [],
            s: [],
            a: [],
        };

        for (var j in this.animate) {
            var frames = this.statsState.nodes[j].plan.spriteCache.frames;
            for (var i = 0; i < frames.length; i++) {
                var a = new cc.Animation([frames[i]], 0.01);
                this.animate[j].push(cc.animate(a));
            }
        }

        this.gutsHudConfig = defaultConfig;

    },

    getAngleDeg: function(thing) {
        var cl = this.viewport.camera.cameraLocation,
            tl = thing.l;
        return -geo.r2d(geo.segment2Angle(cl, tl));
    },

    updateSingleGut: function(watchElement, node, gutName) {
        var thing = watchElement.thing,
            gut = thing.g[gutName];
        if (gut !== undefined && watchElement.g[gutName] != gut[0]) {
            watchElement.g[gutName] = gut[0];
            var fraction = gut[0] / gut[1],
                index = Math.round(fraction * (this.animate[gutName].length - 1));

            if (index === 0 && gut[0] > 0) {
                index = 1;
            }

            var  action = this.animate[gutName][index];
            if (action) {
                node.runAction(action);
            }
        }
    },

    updateDisplayGuts: function(watchElement) {
        var thing = watchElement.thing,
            container = thing.state.nodes.gutsHud,
            childIndex = 1;

        if (!container) return;

        container.setRotation(this.getAngleDeg(thing));

        for (var i in this.animate) {
            var node = container.children[childIndex++];
            this.updateSingleGut(watchElement, node, i);
        }
    },

    addToWatchList: function(thing) {
        if (!thing.g || thing == this.ego) {
            return;
        }

        var watchElement = this.watchList[thing.id];
        if (watchElement) {
            watchElement.hideSimSum = this.fe.simSum + this.gutsHudConfig.hideDelay;
            watchElement.switchSimSum = this.fe.simSum + this.gutsHudConfig.switchDelay;
        } else {
            this.watchList[thing.id] = new WatchElement(thing, this.fe.simSum, this.gutsHudConfig);

            var radius = this.uiController.getHudRadius(thing),
                plan = this.cosmosManager.get('thing/ui/guts-hud'),
                state = this.stateBuilder.makeState(plan, 'basic'),
                scale = Math.sqrt(radius / 1),
                localL = cc.p(radius / scale, 0);


            this.moduleCocos.attachStateToContainerNode(state, thing, localL, 'gutsHud');
            var container = this.moduleCocos.getContainerNode(thing, 'gutsHud');
            container.setScaleX(scale);
            container.setScaleY(scale);
            container.setRotation(this.getAngleDeg(thing));
            this.updateDisplayGuts(this.watchList[thing.id]);
        }
    },

    removeFromWatchList: function(thing) {
        if (thing.state && thing.state.nodes.gutsHud) {
            var action = cc.sequence([
                cc.fadeTo(0.3, 0),
                cc.removeSelf(),
            ]);

            thing.state.nodes.gutsHud.runAction(action);
            delete thing.state.nodes.gutsHud;
        }
        delete this.watchList[thing.id];
    },

    unregister: function() {
        for (var i in this.watchList) {
            this.removeFromWatchList(this.watchList[i].thing);
        }
    },

    doUpdate: function(dt) {
        var interval = 0.5;
        for (var i in this.watchList) {
            var watchElement = this.watchList[i],
                thing = watchElement.thing;

            if (watchElement.hideSimSum < this.fe.simSum) {
                this.removeFromWatchList(thing);
                continue;
            }

            if (thing.removed) {
                delete this.watchList[i];
            } else {
                this.updateDisplayGuts(this.watchList[i]);
            }
        }
        return interval;
    }
});

module.exports = GutsHudComponent;
