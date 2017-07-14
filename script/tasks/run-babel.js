/**
 * Created by krimeshu on 2016/5/14.
 */

var _path = require('path'),

    PluginLoader = require('../plugin-loader.js'),
    plugins = PluginLoader.plugins,

    Utils = require('../utils.js'),
    Timer = require('../timer.js');

PluginLoader.add({ 'babel': () => require('gulp-babel') });

PluginLoader.add({ 'babelPresetEs2015': () => require('babel-preset-es2015') });
PluginLoader.add({ 'babelPresetReact': () => require('babel-preset-react') });
PluginLoader.add({ 'babelPluginExternalHelpers': () => require('babel-plugin-external-helpers') });

// 使用 babel 处理脚本文件:
// - 通过 gulp-babel 转换 es6 的 javscript
module.exports = function (console, gulp, params, errorHandler, taskName) {
    return function (done) {
        var smOpt = params.smOpt || {},
            isSourcemapEnabled = !!smOpt.enable,
            sourceMappingURL = smOpt.mappingUrl;

        var workDir = params.workDir,
            pattern = _path.resolve(workDir, '**/*@(.es6)');

        var timer = new Timer();
        var logId = console.genUniqueId && console.genUniqueId();
        logId && console.useId && console.useId(logId);
        console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务开始……');
        gulp.src(pattern)
            .pipe(plugins.plumber({ 'errorHandler': errorHandler }))
            .pipe(plugins.gulpif(isSourcemapEnabled, plugins.sourcemaps.init()))
            .pipe(plugins.babel({
                presets: [
                    plugins.babelPresetEs2015,
                    plugins.babelPresetReact
                ]
            }).on('error', function () {
                // errorHandler(err);
                this.emit('end');
            }))
            .pipe(plugins.gulpif(isSourcemapEnabled, plugins.sourcemaps.write('', { sourceMappingURL })))
            .pipe(gulp.dest(workDir))
            .once('end', function () {
                logId && console.useId && console.useId(logId);
                console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务结束。（' + timer.getTime() + 'ms）');
                done();
            });
    };
};