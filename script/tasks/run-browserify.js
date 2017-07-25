/**
 * Created by krimeshu on 2016/5/14.
 */

var _path = require('path'),

    PluginLoader = require('../plugin-loader.js'),
    plugins = PluginLoader.plugins,

    Utils = require('../utils.js'),
    Timer = require('../timer.js');

PluginLoader.add({ 'BrowserifyProxy': () => require('../plugins/browserify-proxy.js') });

// 使用Browserify打包JS:
module.exports = function (console, gulp, params, errorHandler, taskName) {
    return function (done) {
        var smOpt = params.smOpt || {},
            isSourcemapEnabled = !!smOpt.enable,
            sourceMappingURL = smOpt.mappingUrl;

        var workDir = params.workDir,
            pattern = _path.resolve(workDir, '**/*@(.js)'),
            jsOpt = params.jsOpt || {},
            brOpt = params.brOpt || {};

        var timer = new Timer();
        var logId = console.genUniqueId && console.genUniqueId();
        logId && console.useId && console.useId(logId);
        console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务开始……');

        var entry = jsOpt.bundleEntry;
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

        var browserify = new plugins.BrowserifyProxy(errorHandler),
            babelifyOpts = !brOpt.babelify ? null : {
                presets: [
                    plugins.babelPresetEs2015,
                    plugins.babelPresetReact
                ]
            };

        gulp.src(entry, { base: workDir })
            .pipe(plugins.plumber({ 'errorHandler': errorHandler }))
            .pipe(browserify.handleFile(
                {
                    debug: isSourcemapEnabled,
                    extensions: [' ', 'js', 'jsx']
                }, babelifyOpts
            ))
            .pipe(plugins.gulpif(isSourcemapEnabled, plugins.sourcemaps.init({ loadMaps: true })))
            .pipe(browserify.excludeMap())
            .pipe(plugins.gulpif(isSourcemapEnabled, plugins.sourcemaps.write('', { sourceMappingURL })))
            .pipe(gulp.dest(workDir))
            .once('end', function () {
                logId && console.useId && console.useId(logId);
                console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务结束。（' + timer.getTime() + 'ms）');
                done();
            });
    };
};