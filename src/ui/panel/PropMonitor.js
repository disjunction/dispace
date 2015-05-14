var cc = require('cc'),
    SelfUpdater = require('ui/SelfUpdater');

var PropMonitor = SelfUpdater.extend({
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
        return this.formatValue(typeof getter == 'function' ? getter(this.opts.thing) : getter);
    },

    addProp: function(name, getter, title) {
        if (!title) {
            title = name;
        }
        var prop = {
            name: name,
            getter: getter
        };

        var value = (typeof getter == 'function') ? '' : this.formatValue(getter);

        var row = $('<div>');
        row.addClass("row");
        row.append('<div class="col-xs-5 ' + name + '-title">' + title + '</div>');

        prop.valueSelector = $('<div class="col-xs-7 ' + name + '-value">' + value + '</div>');
        row.append(prop.valueSelector);

        this.props.push(prop);

        this.opts.selector.append(row);
    },

    doUpdate: function(force) {
        for (var i = 0; i < this.props.length; i++) {
            var prop = this.props[i];
            prop.valueSelector.html(this.getValueByGetter(prop.getter));
        }
        return this.opts.interval;
    }


});

module.exports = PropMonitor;
