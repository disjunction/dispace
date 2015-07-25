var cc = require('cc'),
    geo = require('fgtk/smog').util.geo,
    SelfUpdater = require('dispace/ui/SelfUpdater'),
    flame = require('fgtk/flame'),
    FriendOrFoe = require('dispace/ai/FriendOrFoe');

var TurretPointerHudComponent = SelfUpdater.extend({
    /**
     * opts:
     * * cursorPlan
     * * ego
     * * turretComponent
     * * viewport
     * * fe
     * @param opts object
     */
    ctor: function(opts) {
        SelfUpdater.prototype.ctor.call(this, opts);

        this.turretThing = opts.turretComponent.thing;

        this.cursorThing = new flame.entity.Thing({
            plan: opts.cursorPlan,
            l: cc.clone(this.turretThing.l),
            a: this.turretThing.a
        });
        this.opts.fe.m.c.envision(this.cursorThing);

        this.aniNode = this.cursorThing.state.nodes.main;

        this.fof = this.opts.fe.opts.fof;

        this.aniNeutral = cc.sequence(
            cc.tintTo(0.5, 100, 100, 100),
            cc.tintTo(0.5, 255, 255, 255)
        ).repeatForever();

        this.aniFoe = cc.sequence(
            cc.tintTo(0.5, 255, 130, 130),
            cc.tintTo(0.5, 200, 50, 50)
        ).repeatForever();

        this.aniFriend = cc.sequence(
            cc.tintTo(0.5, 200, 255, 150),
            cc.tintTo(0.5, 150, 230, 50)
        ).repeatForever();

        this.p1 = cc.p(0, 0);
        this.p2 = cc.p(0, 0);

        this.a1 = 0;
        this.a2 = 0;

        this.currentAction = this.aniNeutral;
        this.aniNode.runAction(this.currentAction);

        this.uiElements = this.opts.fe.m.p.uiController.elements;

        this.radius = opts.turretComponent.params.range;

        this.ray = new flame.engine.ray.RayClosestFilterFunction({
            filterFunction: function(thing) {
                if (thing.__instanceId == opts.ego.__instanceId) {
                    return true;
                }
            }
        });
    },

    unregister: function() {
        if (this.cursorThing) {
            this.opts.fe.removeThing(this.cursorThing);
        }
    },

    doUpdate: function(dt) {
        var aniInterval = 0.2,
            fixedInterval = aniInterval * 0.85;

        if (!isFinite(this.turretThing.a)) {
            return;
        }

        var node = this.cursorThing.state.nodes.main;
        this.opts.fe.m.b.rayCastFromThing(this.ray, this.turretThing, this.radius);

        node.setRotation(- this.turretThing.a * geo.rad2Deg);

        var fadeAction;

        if (this.ray.isHit) {
            var p = this.ray.results[0].p;
            p = this.opts.viewport.scrolledLocation2Target(p);

            if (this.ray.results[0].thing) {
                var relation = this.fof.getRelation(this.opts.ego, this.ray.results[0].thing);
                if (relation == FriendOrFoe.NEUTRAL && this.currentAction != this.aniNeutral) {
                    node.stopAction(this.currentAction);
                    this.currentAction = this.aniNeutral;
                    node.runAction(this.currentAction);
                } else if (relation == FriendOrFoe.FOE && this.currentAction != this.aniFoe) {
                    node.stopAction(this.currentAction);
                    this.currentAction = this.aniFoe;
                    node.runAction(this.currentAction);
                } else if (relation == FriendOrFoe.FRIEND && this.currentAction != this.aniFriend) {
                    node.stopAction(this.currentAction);
                    this.currentAction = this.aniFriend;
                    node.runAction(this.currentAction);
                }

                // quite ugly dependency of one hud component on another
                if (this.uiElements.gutsHud) {
                    this.uiElements.gutsHud.addToWatchList(this.ray.results[0].thing);
                }
            }


            if (!node.visible) {
                var turretTargetL = this.opts.viewport.scrolledLocation2Target(this.turretThing.l),
                    appearL = cc.p((turretTargetL.x + p.x)/2, (turretTargetL.y + p.y)/2);

                node.setPosition(p);

                fadeAction = cc.fadeTo(fixedInterval * 2, 255);
                node.runAction(fadeAction);

                node.visible = true;
                return aniInterval / 4;
            } else {
                distSq = cc.pDistanceSQ(p, node.getPosition());
                // avoid huge (> 64px) cursor jumps
                if (distSq < 4096) {
                    var moveTo = cc.moveTo(fixedInterval / 4, p).easing(cc.easeOut(0.5));
                    node.runAction(moveTo);
                } else {
                    node.setPosition(p);
                }
                return aniInterval / 4;
            }
        } else {
            if (node.visible) {
                fadeAction = cc.sequence(
                        cc.fadeTo(fixedInterval, 0),
                        cc.hide()
                    );
                node.runAction(fadeAction);
                return aniInterval;
            }
        }
    }
});

module.exports = TurretPointerHudComponent;
