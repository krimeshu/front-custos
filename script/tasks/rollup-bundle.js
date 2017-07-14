/**
 * Created by krimeshu on 2017/2/16.
 */

var _path = require('path'),

    PluginLoader = require('../plugin-loader.js'),
    plugins = PluginLoader.plugins,

    Utils = require('../utils.js'),
    Timer = require('../timer.js');

PluginLoader.add({ 'rollup': () => require('gulp-better-rollup') });
PluginLoader.add({ 'rollupPluginNodeResolve': () => require('rollup-plugin-node-resolve') });
PluginLoader.add({ 'rollupPluginCommonJS': () => require('rollup-plugin-commonjs') });
PluginLoader.add({ 'rollupPluginVue': () => require('rollup-plugin-vue') });
PluginLoader.add({ 'rollupPluginPostcss': () => require('rollup-plugin-postcss') });
PluginLoader.add({ 'rollupPluginBabel': () => require('rollup-plugin-babel') });
PluginLoader.add({ 'rollupPluginUglify': () => require('rollup-plugin-uglify') });

PluginLoader.add({ 'babelPresetEs2015': () => require('babel-preset-es2015') });
PluginLoader.add({ 'babelPresetReact': () => require('babel-preset-react') });
PluginLoader.add({ 'babelPluginExternalHelpers': () => require('babel-plugin-external-helpers') });

PluginLoader.add({ 'postcssModules': () => require('postcss-modules') });

// 使用Rollup打包JS:
// - 内容中存在某行 'rollup entry'; 标记的脚本将被识别为入口进行打包
module.exports = function (console, gulp, params, errorHandler, taskName) {
    return function (done) {
        var smOpt = params.smOpt || {},
            isSourcemapEnabled = !!smOpt.enable,
            sourceMappingURL = smOpt.mappingUrl;

        var workDir = params.workDir,
            pattern = _path.resolve(workDir, '**/*@(.js|.jsx|.vue|.ts|.es6|.vue)'),
            ruOpt = params.ruOpt || {};

        var timer = new Timer();
        var logId = console.genUniqueId && console.genUniqueId();
        logId && console.useId && console.useId(logId);
        console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务开始……');

        var entry = ruOpt.entry,
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
            console.error('没有设置打包入口脚本。');
            _finish();
            return;
        }

        // var moduleName = entry.map((entryPath) => {
        //     var extName = _path.extname(entryPath),
        //         name = _path.basename(entryPath, extName);
        //     return name.replace(/(\-\w)/g, function (m) { return m[1].toUpperCase(); });
        // });

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
                    plugins.babelPresetReact
                ],
                plugins: [plugins.babelPluginExternalHelpers]
            }));
        }
        if (ruOptPlugins.uglify) {
            plugin.push(plugins.rollupPluginUglify());
        }

        gulp.src(entry, { base: workDir })
            .pipe(plugins.plumber({ 'errorHandler': errorHandler }))
            .pipe(plugins.gulpif(isSourcemapEnabled, plugins.sourcemaps.init()))
            .pipe(plugins.rollup(
                // { plugins: plugin, onwarn: console.warn.bind(console) },
                { plugins: plugin },
                { format: format }
            ))
            .pipe(plugins.gulpif(isSourcemapEnabled, plugins.sourcemaps.write('', { sourceMappingURL })))
            .pipe(gulp.dest(workDir))
            .on('end', _finish);

        function _finish() {
            logId && console.useId && console.useId(logId);
            console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务结束。（' + timer.getTime() + 'ms）');
            done();
        }
    };
};