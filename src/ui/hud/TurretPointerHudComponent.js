var cc = require('cc'),
    geo = require('fgtk/smog').util.geo,
    SelfUpdater = require('dispace/ui/SelfUpdater'),
    flame = require('fgtk/flame');

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

        var node = this.cursorThing.state.nodes.main;
        var tint = cc.sequence(
            cc.tintTo(1, 255, 0, 0),
            cc.tintTo(1, 0, 255, 0),
            cc.tintTo(1, 0, 0, 255)
        );

        this.p1 = cc.p(0, 0);
        this.p2 = cc.p(0, 0);

        this.a1 = 0;
        this.a2 = 0;

        node.runAction(tint.repeatForever());

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


            if (!node.visible) {
                var turretTargetL = this.opts.viewport.scrolledLocation2Target(this.turretThing.l),
                    appearL = cc.p((turretTargetL.x + p.x)/2, (turretTargetL.y + p.y)/2);

                node.setPosition(p);

                // the animation below is distracting, but cool. not sure if we need it
                /*
                node.setPosition(appearL);
                var moveTo = cc.moveTo(fixedInterval, p).easing(cc.easeOut(0.5));
                node.runAction(moveTo);
                */

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
