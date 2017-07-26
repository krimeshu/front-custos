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
    'babelPluginTransformPostcss': () => require('babel-plugin-transform-postcss'),
    // 'babelPluginCssModulesReact': () => require('babel-plugin-css-modules-react'),
    // 'babelPluginTransformPostcss': () => require('babel-plugin-transform-postcss'),
    // 'babelPluginReactCssModules': () => require('babel-plugin-react-css-modules'),
    // 'babelPluginCssModulesTransform': () => require('babel-plugin-css-modules-transform'),
    // 'postcssModules': () => require('postcss-modules')
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
            [plugins.babelPluginTransformPostcss.default, {
                plugin: [
                    plugins.postcssModules({
                        getJSON: () => {}
                    })
                ]
            }]
            // plugins.babelPluginCssModulesReact.default,
            // plugins.babelPluginCssModulesTransform.default
            // [plugins.babelPluginReactCssModules.default, {
            //     generateScopedName: function (name, filename, css) {
            //         var path = require('path');
            //         var i = css.indexOf('.' + name);
            //         var line = css.substr(0, i).split(/[\r\n]/).length;
            //         var file = path.basename(filename, '.css');

            //         return '_' + file + '_' + line + '_' + name;
            //     }
            // }]
        ]
    };
    this.vueifyOpts = !opts.vueify ? null : {
        babel: {
            presets: [
                plugins.babelPresetEs2015,
                plugins.babelPresetReact
            ],
            plugins: [
                plugins.babelPluginTransformRuntime
            ]
        }
    };
    // this.cssModules = !opts.cssModules ? null : {
    //     plugin: [
    //         plugins.postcssModules({
    //             getJSON: function (id, exportTokens) {
    //                 cssExportMap[id] = exportTokens;
    //             }
    //         })
    //     ],
    //     inject: true
    // };
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

            // if (self.cssModules) {
            //     bundler = bundler.transform(plugins.browserifyPostcss, self.cssModules);
            // }

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