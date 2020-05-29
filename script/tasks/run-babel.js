/**
 * Created by krimeshu on 2016/5/14.
 */

var _path = require('path'),

    PluginLoader = require('../plugin-loader.js'),
    plugins = PluginLoader.plugins,

    Utils = require('../utils.js'),
    Timer = require('../timer.js');

PluginLoader.add({
    'babel': () => require('gulp-babel'),
    'babelPresetEs2015': () => require('babel-preset-es2015'),
    'babelPresetReact': () => require('babel-preset-react'),
    'babelPresetStage2': () => require('babel-preset-stage-2'),
    // 'babelPluginTransformRuntime': () => require('babel-plugin-transform-runtime')
});

// 使用 babel 处理脚本文件:
// - 通过 gulp-babel 转换 es6 的 javscript
module.exports = function (console, gulp, params, errorHandler, taskName) {
    return function (done) {
        var smOpt = params.smOpt || {},
            isSourcemapEnabled = !!smOpt.enable,
            sourceMappingURL = smOpt.mappingUrl;

        var workDir = params.workDir,
            pattern = _path.resolve(workDir, '**/*@(.js|.jsx|.es6)');

        var timer = new Timer();
        var logId = console.genUniqueId && console.genUniqueId();
        logId && console.useId && console.useId(logId);
        console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务开始……');
        gulp.src(pattern)
            .pipe(plugins.plumber({
                'errorHandler': errorHandler
            }))
            .pipe(plugins.gulpif(isSourcemapEnabled, plugins.sourcemaps.init({
                loadMaps: true
            })))
            .pipe(plugins.cache(plugins.babel({
                presets: [
                    plugins.babelPresetEs2015,
                    plugins.babelPresetReact,
                    plugins.babelPresetStage2
                ],
                plugins: [
                    // plugins.babelPluginTransformRuntime.default
                ]
            })).on('error', function () {
                // errorHandler(err);
                this.emit('end');
            }))
            .pipe(plugins.gulpif(isSourcemapEnabled, plugins.sourcemaps.write('', {
                sourceMappingURL
            })))
            .pipe(gulp.dest(workDir))
            .once('end', function () {
                logId && console.useId && console.useId(logId);
                console.lineUp && console.lineUp();
                console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务结束。（' + timer.getTime() + 'ms）');
                done();
            });
    };
};