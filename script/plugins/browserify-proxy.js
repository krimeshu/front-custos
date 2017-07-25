/**
 * Created by krimeshu on 2016/4/5.
 */

var _path = require('path'),
    _browserify = require('browserify'),
    _babelify = require('babelify'),

    Through2 = require('through2');

var BrowserifyProxy = function (onError) {
    var self = this;
    self.onError = onError;
};

BrowserifyProxy.prototype = {
    handleFile: function (browserifyOpts, babelifyOpts) {
        var self = this;
        return Through2.obj(function (file, enc, cb) {
            // console.log('================================================================================');
            // console.log('> BrowserifyProxy.handleFile - file:', file.path);
            var errReturned = false,
                bundler = _browserify(file.path, browserifyOpts);

            if (babelifyOpts) {
                bundler = bundler.transform(_babelify.configure(babelifyOpts));
            }

            bundler.bundle(function (err, res) {
                // console.log('> BrowserifyProxy.handleFile.bundle - file:', file.path);
                err && self.onError && self.onError(err);
                res && (file.contents = res);
                !errReturned && cb(null, file);
                errReturned = true;
            });
        }).resume();
    }
};

module.exports = BrowserifyProxy;
