/*jslint node: true */
"use strict";

var cc = require('cc'),
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract');

var ModuleUi = ModuleAbstract.extend({
    injectFe: function(fe, name) {
        this.$ = $;
        ModuleAbstract.prototype.injectFe.call(this, fe, name);

        this.addNativeListeners([
            "injectQuest",
            "updateQuest",
            "alert",
        ]);
    },

    toTime: function (input) {
        var sec_num = parseInt(input, 10);
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        var time    = minutes+':'+seconds;
        return time;
    },

    onAlert: function(event) {
        $('#alert-contents').html(event.message);
        $('#alert-modal').modal();
    },

    onInjectQuest: function(event) {
        var panel = this.$('#panel-quest');
        panel.removeClass('hide');
        this.questOutput = panel.find('.panel-body');

        this.output = {
            pirate: this.questOutput.find('.output-pirate'),
            federation: this.questOutput.find('.output-federation'),
            time: this.questOutput.find('.output-time'),
        };

        this.onUpdateQuest(event);
    },

    onUpdateQuest: function(event) {
        if (!this.output) {
            event.type = 'injectQuest';
            this.fe.fd.dispatch(event);
            return;
        }

        this.output.pirate.html(event.stats.pirate);
        this.output.federation.html(event.stats.federation);
        this.output.time.html(this.toTime(event.stats.time));
    },
});

module.exports = ModuleUi;
