/**
 * Created by krimeshu on 2016/5/14.
 */

var _path = require('path'),

    PluginLoader = require('../plugin-loader.js'),
    plugins = PluginLoader.plugins,

    Utils = require('../utils.js'),
    Timer = require('../timer.js');

PluginLoader.add({ 'postcss': () => require('gulp-postcss') });
PluginLoader.add({ 'autoprefixer': () => require('autoprefixer') });
PluginLoader.add({ 'cssnano': () => require('cssnano') });

// 前缀处理：
// - 使用 Prefix Crafter（基于 autoprefixer）处理CSS，自动添加需要的浏览器前缀
module.exports = function (console, gulp, params, errorHandler, taskName) {
    return function (done) {
        var workDir = params.workDir,
            pattern = _path.resolve(workDir, '**/*@(.css)'),
            pcOpt = params.pcOpt;

        var pluginList = [
            plugins.autoprefixer
        ];
        if (pcOpt.cssnano) {
            pluginList.push(plugins.cssnano);
        }

        var timer = new Timer();
        var logId = console.genUniqueId && console.genUniqueId();
        logId && console.useId && console.useId(logId);
        console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务开始……');
        gulp.src(pattern)
            .pipe(plugins.plumber({ 'errorHandler': errorHandler }))
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.postcss(pluginList))
            .pipe(plugins.sourcemaps.write(''))
            .pipe(gulp.dest(workDir))
            .on('end', function () {
                logId && console.useId && console.useId(logId);
                console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务结束。（' + timer.getTime() + 'ms）');
                done();
            });
    };
};