var cc = require('cc'),
    smog = require('fgtk/smog');

var Item = cc.Class.extend({
    ctor: function(opts, type, n) {
        this.opts = opts || smog.EMPTY;
        this.n = n || 1;
        if (!this.type) {
            if (!type) {
                throw new Error('item MUST have a type');
            } else {
                this.type = type;
            }
        }
    }
});

module.exports = Item;