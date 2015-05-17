var cc = require('cc'),
    PropMonitor = require('ui/panel/PropMonitor');

var SelectionPanel = PropMonitor.extend({
    /**
     * opts:
     * * selector
     * @param opts object
     */
    ctor: function(opts) {
        PropMonitor.prototype.ctor.call(this, opts);
    },

    setThing: function(thing) {
        this.thing = thing;
        this.props = [];
        this.opts.selector.html('');

        if (!thing) return;

        // GLOBAL!!! yeah
        selected = thing;

        this.addProp('type', function() {
            return this.thing.type;
        }.bind(this));
        this.addProp('coord', function() {
            return this.thing.l;
        }.bind(this));
        this.addProp('lin. velocity', function() {
            if (this.thing.body) {
                return this.thing.body.GetLinearVelocity();
            } else {
                return '';
            }

        }.bind(this));

        if (thing.g) {
            if (thing.g.i) {
                this.addProp('infrastructure', function() {
                    return this.formatGutFiller(this.thing.g.i);
                }.bind(this));
            }
            if (thing.g.a) {
                this.addProp('armor', function() {
                    return this.formatGutFiller(this.thing.g.a);
                }.bind(this));
            }
            if (thing.g.s) {
                this.addProp('shield', function() {
                    return this.formatGutFiller(this.thing.g.s);
                }.bind(this));
            }
        }
    }

});

module.exports = SelectionPanel;
