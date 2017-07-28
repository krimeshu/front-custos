/**
 * Created by krimeshu on 2016/4/5.
 */

var _path = require('path'),

    PluginLoader = require('../plugin-loader.js'),
    plugins = PluginLoader.plugins,

    Through2 = require('through2');

PluginLoader.add({
    'browserify': () => require('browserify'),
    'babelify': () => require('babelify'),
    'vueify': () => require('vueify'),
    'lessModulesify': () => require('less-modulesify')
    // 'postcssModules': () => require('postcss-modules')
    // 'babelPluginTransformPostcss': () => require('babel-plugin-transform-postcss'),          // server error on windows
    // 'babelPluginCssModulesReact': () => require('babel-plugin-css-modules-react'),           // 'unexpected token ..'
    // 'babelPluginReactCssModules': () => require('babel-plugin-react-css-modules'),           // 'unexpected token ..'
    // 'babelPluginCssModulesTransform': () => require('babel-plugin-css-modules-transform'),   // need to extract css
});

PluginLoader.add({
    'babelPresetEs2015': () => require('babel-preset-es2015'),
    'babelPresetReact': () => require('babel-preset-react'),
    'babelPresetStage2': () => require('babel-preset-stage-2')
});

var BrowserifyProxy = function (opts, onError) {
    var self = this;
    self.onError = onError;

    this.babelifyOpts = !opts.babelify ? null : {
        presets: [
            plugins.babelPresetEs2015,
            plugins.babelPresetReact
        ],
        plugins: [
            // [plugins.babelPluginTransformPostcss.default, {
            //     plugin: [
            //         plugins.postcssModules({
            //             getJSON: () => {}
            //         })
            //     ]
            // }]
            // plugins.babelPluginCssModulesReact.default,
            // plugins.babelPluginCssModulesTransform.default
            // plugins.babelPluginReactCssModules.default
        ]
    };
    this.vueifyOpts = !opts.vueify ? null : {
        babel: {
            presets: [
                plugins.babelPresetEs2015,
                plugins.babelPresetReact
            ],
            plugins: [
                plugins.babelPluginTransformRuntime.default
            ]
        }
    };
    this.lessOpts = !opts.lessModulesify ? null : {
        sourceMap: true,
        lessCompileOption: {
            compress: true
        }
    };
    delete opts.babelify;
    delete opts.vueify;
    this.opts = opts;
};

BrowserifyProxy.prototype = {
    excludeMap: function () {
        return Through2.obj(function (file, enc, cb) {
            // Dont pipe through any source map files as it will be handled 
            // by gulp-sourcemaps 
            var isSourceMap = /\.map$/.test(file.path);
            if (!isSourceMap) {
                this.push(file);
            }
            cb();
        });
    },
    handleFile: function () {
        var self = this;
        return Through2.obj(function (file, enc, cb) {
            // console.log('================================================================================');
            // console.log('> BrowserifyProxy.handleFile - file:', file.path);
            var errReturned = false,
                bundler = plugins.browserify(file.path, self.opts);

            if (self.lessOpts) {
                bundler = bundler.plugin(plugins.lessModulesify, self.lessOpts);
            }

            if (self.babelifyOpts) {
                bundler = bundler.transform(plugins.babelify.configure(self.babelifyOpts));
            }

            if (self.vueifyOpts) {
                bundler = bundler.transform(plugins.vueify, self.vueifyOpts);
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