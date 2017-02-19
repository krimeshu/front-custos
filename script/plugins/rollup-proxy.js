/**
 * Created by krimeshu on 2017/2/16.
 */

var _path = require('path'),

    Utils = require('../utils.js'),

    Through2 = require('through2');

var RollupProxy = function (onError) {
    var self = this;
    self.onError = onError;
};

RollupProxy.prototype = {
    reg: new RegExp('(^|\n)\\s*((/\\*|\'|")\\s*rollup\\s+entry\\s*(\\*/|\';?|";?)|//\\s*browserify\\s+entry)\\s*($|\r?\n)', 'i'),
    findEntryFiles: function (src) {
        var self = this,
            files = Utils.getFilesOfDir(src, '.js', true),
            finalList = [];
        try {
            files.forEach(function (filePath) {
                
            });
        } catch (e) {
            self.onError && self.onError(e);
        }
        return finalList;
    }
};

module.exports = RollupProxy;
