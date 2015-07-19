/*jslint node: true */
"use strict";

var cc = require('cc'),
    SelfUpdater = require('dispace/ui/SelfUpdater');

var SelectionBarPanel = SelfUpdater.extend({
    /**
     * opts:
     * * selector
     * * thing
     * @param opts object
     */
    ctor: function(opts) {
        SelfUpdater.prototype.ctor.call(this, opts);
        this.props = [];
    },

    formatNumber: function(n) {
        if (!isNaN(parseFloat(n)) && isFinite(n)) {
            return Math.round(n * 10000) / 10000;
        } else {
            return n;
        }
    },

    formatGutFiller: function(array) {
        return this.formatNumber(array[0]) + ' / ' + this.formatNumber(array[1]);
    },

    formatValue: function(value) {
        if (typeof value == 'boolean') {
            return value + '';
        }
        if (typeof value == 'object') {
            if (typeof value.x != 'undefined') {
                return '(' + this.formatNumber(value.x) + ', ' +this.formatNumber(value.y) + ')';
            }

            return '[object]';
        }

        return this.formatNumber(value);
    },

    getValueByGetter: function(getter) {
        return typeof getter == 'function' ? getter(this.opts.thing) : getter;
    },

    addProp: function(name, getter, extraClass) {
        var prop = {
            name: name,
            getter: getter
        };

        var row = $('<div>');
        row.addClass("row");
        row.append('<div class="col-xs-3 ' + name + '-title">' + name + '</div>');

        var value = '<div class="progress">' +
                    '<div class="progress-bar ' + name + ' ' + extraClass + '" role="progressbar" aria-valuenow="2" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em; width: 0%;">' +
                    '' +
                    '</div>' +
                    '</div>';

        prop.valueSelector = $('<div class="col-xs-9 ' + name + '-value">' + value + '</div>');
        row.append(prop.valueSelector);

        this.props.push(prop);

        this.opts.selector.append(row);
    },

    doUpdate: function(force) {
        for (var i = 0; i < this.props.length; i++) {
            var prop = this.props[i];
            var newValue = this.getValueByGetter(prop.getter);
            if (prop.value != newValue[0]) {
                prop.value = newValue[0];
                var text = this.formatGutFiller(newValue),
                    percValue = +(newValue[0] / newValue[1]) * 100;

                prop.valueSelector.find('.progress-bar').html(text).css('width', percValue + '%');
            }
        }
        return this.opts.interval;
    },

    setThing: function(thing) {
        this.thing = thing;
        this.props = [];
        this.opts.selector.html('');

        if (!thing) return;

        // GLOBAL!!! yeah
        selected = thing;

        if (thing.g) {
            if (thing.g.i) {
                this.addProp('infra', function() {
                    return this.thing.g.i;
                }.bind(this), 'progress-bar-danger');
            }
            if (thing.g.a) {
                this.addProp('armor', function() {
                    return this.thing.g.a;
                }.bind(this), 'progress-bar-success');
            }
            if (thing.g.s) {
                this.addProp('shield', function() {
                    return this.thing.g.s;
                }.bind(this), 'progress-bar-info');
            }
            if (thing.g.e) {
                this.addProp('energy', function() {
                    return this.thing.g.e;
                }.bind(this), 'progress-bar-warning');
            }
        }
    }
});

module.exports = SelectionBarPanel;
