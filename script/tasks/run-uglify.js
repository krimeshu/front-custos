/**
 * Created by krimeshu on 2017/7/14.
 */

var _path = require('path'),

    PluginLoader = require('../plugin-loader.js'),
    plugins = PluginLoader.plugins,

    Utils = require('../utils.js'),
    Timer = require('../timer.js');

PluginLoader.add({ uglify: () => require('gulp-uglify') });

// 压缩&混淆 JS 代码
module.exports = function (console, gulp, params, errorHandler, taskName) {
    return function (done) {
        var workDir = params.workDir;

        var timer = new Timer();
        var logId = console.genUniqueId && console.genUniqueId();
        logId && console.useId && console.useId(logId);
        console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务开始……');
        gulp.src(_path.resolve(workDir, '**/*@(.js)'))
            .pipe(plugins.plumber({ 'errorHandler': errorHandler }))
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.uglify())
            .pipe(plugins.sourcemaps.write(''))
            .pipe(gulp.dest(workDir))
            .on('end', function () {
                logId && console.useId && console.useId(logId);
                console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务结束。（' + timer.getTime() + 'ms）');
                done();
            });
    };
};