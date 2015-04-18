var cc = require('cc'),
    Interactor = require('fgtk/flame/view/Interactor'),
    rof = require('fgtk/flame/rof');

var HudController = cc.Class.extend({
    /**
     * opts:
     * @param opts object
     */
    ctor: function(opts) { 
        this.opts = opts || {};
        
        /**
         * Hud event Dispatcher
         * This is typically injected in things and fields
         */
        this.hd = new EventDispatcher();
    },
});