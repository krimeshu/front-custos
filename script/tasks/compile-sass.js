/**
 * Created by krimeshu on 2016/5/14.
 */

var _path = require('path'),

    PluginLoader = require('../plugin-loader.js'),
    plugins = PluginLoader.plugins,

    Utils = require('../utils.js'),
    Timer = require('../timer.js');

PluginLoader.add({ 'sass': () => require('gulp-sass') });

// 编译SASS:
// - 通过 gulp-sass (基于 node-sass) 编译 scss 文件
module.exports = function (console, gulp, params, errorHandler, taskName) {
    return function (done) {
        var smOpt = params.smOpt || {};

        var workDir = params.workDir,
            pattern = _path.resolve(workDir, '**/*@(.scss)');

        var timer = new Timer();
        var logId = console.genUniqueId && console.genUniqueId();
        logId && console.useId && console.useId(logId);
        console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务开始……');
        gulp.src(pattern)
            .pipe(plugins.plumber({'errorHandler': errorHandler}))
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass().on('error', function () {
                // errorHandler(err);
                this.emit('end');
            }))
            .pipe(plugins.sourcemaps.write('', { sourceMappingURL: smOpt.mappingUrl }))
            .pipe(gulp.dest(workDir))
            .once('end', function () {
                logId && console.useId && console.useId(logId);
                console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务结束。（' + timer.getTime() + 'ms）');
                done();
            });
    };
};