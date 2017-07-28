/**
 * Created by krimeshu on 2017/2/16.
 */

var _path = require('path'),

    PluginLoader = require('../plugin-loader.js'),
    plugins = PluginLoader.plugins,

    Utils = require('../utils.js'),
    Timer = require('../timer.js');

PluginLoader.add({
    'rollup': () => require('gulp-better-rollup'),
    'rollupPluginNodeResolve': () => require('rollup-plugin-node-resolve'),
    'rollupPluginCommonJS': () => require('rollup-plugin-commonjs'),
    'rollupPluginVue': () => require('rollup-plugin-vue'),
    'rollupPluginPostcss': () => require('rollup-plugin-postcss'),
    'rollupPluginBabel': () => require('rollup-plugin-babel'),
    'rollupPluginUglify': () => require('rollup-plugin-uglify')
});

PluginLoader.add({
    'babelPresetEs2015': () => require('babel-preset-es2015'),
    'babelPresetReact': () => require('babel-preset-react'),
    'babelPresetStage2': () => require('babel-preset-stage-2'),
    'babelPluginExternalHelpers': () => require('babel-plugin-external-helpers')
});

PluginLoader.add({
    'postcssModules': () => require('postcss-modules')
});

// 使用Rollup打包JS:
module.exports = function (console, gulp, params, errorHandler, taskName) {
    return function (done) {
        var smOpt = params.smOpt || {},
            isSourcemapEnabled = !!smOpt.enable,
            sourceMappingURL = smOpt.mappingUrl;

        var workDir = params.workDir,
            pattern = _path.resolve(workDir, '**/*@(.js|.jsx|.vue|.ts|.es6|.vue)'),
            jsOpt = params.jsOpt || {},
            ruOpt = params.ruOpt || {};

        var timer = new Timer();
        var logId = console.genUniqueId && console.genUniqueId();
        logId && console.useId && console.useId(logId);
        console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务开始……');

        var entry = jsOpt.bundleEntry,
            format = ruOpt.format || 'es6';
        if (typeof entry == 'string' && entry.length) {
            entry = entry.split(/\r?\n/g).map((entryPath) => _path.resolve(workDir, entryPath));
        }
        if (Array.isArray(entry)) {
            if (entry.some((e) => typeof e != 'string')) {
                console.error('打包入口 entry 类型错误（应为 string/array of string）');
            }
        }
        if (params.bundleEntry) {
            // 其它任务中找到的打包入口脚本
            entry = (entry || []).concat(params.bundleEntry);
        }
        if (!entry || !entry.length) {
            console.error('没有设置打包入口脚本，请配置或打开 find_bundle_entry 任务。');
            _finish();
            return;
        }

        var plugin = [],
            ruOptPlugins = ruOpt.plugins || {};
        if (ruOptPlugins.nodeResolve) {
            plugin.push(plugins.rollupPluginNodeResolve({ jsnext: true, main: true, browser: true }));
        }
        if (ruOptPlugins.commonJS) {
            plugin.push(plugins.rollupPluginCommonJS());
        }
        if (ruOptPlugins.vue) {
            plugin.push(plugins.rollupPluginVue({
                css: true
            }));
        }
        if (ruOptPlugins.postcssModules) {
            var cssExportMap = {};
            plugin.push(plugins.rollupPluginPostcss({
                plugins: [
                    plugins.postcssModules({
                        getJSON: function (id, exportTokens) {
                            cssExportMap[id] = exportTokens;
                        }
                    })
                ],
                getExport: function (id) {
                    return cssExportMap[id];
                }
            }));
        }
        if (ruOptPlugins.babel) {
            plugin.push(plugins.rollupPluginBabel({
                presets: [
                    [plugins.babelPresetEs2015.buildPreset, { modules: false }],
                    plugins.babelPresetReact,
                    plugins.babelPresetStage2
                ],
                plugins: [plugins.babelPluginExternalHelpers]
            }));
        }
        if (ruOptPlugins.uglify) {
            plugin.push(plugins.rollupPluginUglify({
                compress: {
                    unused: false
                }
            })
            );
        }

        gulp.src(entry, { base: workDir })
            .pipe(plugins.plumber({ 'errorHandler': errorHandler }))
            .pipe(plugins.gulpif(isSourcemapEnabled, plugins.sourcemaps.init({ loadMaps: true })))
            .pipe(plugins.rollup(
                // { plugins: plugin, onwarn: console.warn.bind(console) },
                { plugins: plugin },
                { format: format }
            ))
            .pipe(plugins.gulpif(isSourcemapEnabled, plugins.sourcemaps.write('', { sourceMappingURL })))
            .pipe(gulp.dest(workDir))
            .once('end', _finish);

        function _finish() {
            logId && console.useId && console.useId(logId);
            console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务结束。（' + timer.getTime() + 'ms）');
            done();
        }
    };
};