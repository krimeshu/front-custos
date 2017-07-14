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
        var smOpt = params.smOpt || {};

        var workDir = params.workDir,
            entry = params.bundleEntry;

        if (!entry || !entry.length) {
            entry = _path.resolve(workDir, '**/*@(.js)');
        }

        var timer = new Timer();
        var logId = console.genUniqueId && console.genUniqueId();
        logId && console.useId && console.useId(logId);
        console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务开始……');
        gulp.src(entry, { base: workDir })
            .pipe(plugins.plumber({ 'errorHandler': errorHandler }))
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.uglify())
            .pipe(plugins.sourcemaps.write('', { sourceMappingURL: smOpt.mappingUrl }))
            .pipe(gulp.dest(workDir))
            .on('end', function () {
                logId && console.useId && console.useId(logId);
                console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务结束。（' + timer.getTime() + 'ms）');
                done();
            });
    };
};