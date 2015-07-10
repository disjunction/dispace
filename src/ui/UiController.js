var cc = require('cc'),
    flame = require('fgtk/flame'),
    smog = require('fgtk/smog'),
    Interactor = flame.view.Interactor,
    EventDispatcher = smog.util.EventDispatcher;

var UiController = cc.Class.extend({
    /**
     * opts:
     * @param opts object
     */
    ctor: function(opts) {
        this.elements = {};
        this.opts = opts || {};

        /**
         * Hud event Dispatcher
         * This is typically injected in things and fields
         */
        this.hd = new EventDispatcher();
    },

    registerElement: function(name, element){
        if (!element) {
            throw new Error('cannot register empty element ' + name);
        }
        this.elements[name] = element;
    },

    unregisterElement: function(name) {
        var element = this.elements[name];
        if (element && element.unregister) {
            element.unregister();
        }
        delete this.elements[name];
    },

    unregister: function() {
        for (var i in this.elements) {
            this.unregisterElement(i);
        }
    },

    update: function(dt) {
        for (var i in this.elements) {
            this.elements[i].update(dt);
        }
    }
});

module.exports = UiController;
