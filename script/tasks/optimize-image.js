/**
 * Created by krimeshu on 2016/5/14.
 */

var _path = require('path'),
    _os = require('os'),

    PluginLoader = require('../plugin-loader.js'),
    plugins = PluginLoader.plugins,

    Utils = require('../utils.js'),
    Timer = require('../timer.js');

var cacheDirName = 'imagemin-cache';

// 优化图片：
// - Png图片有损压缩（PngQuant）
// - Jpg图片转为渐进式
// - Gif图片转为隔行加载
module.exports = {
    '': function (console, gulp, params, errorHandler, taskName) {
        return function (done) {
            var workDir = params.workDir;

            var timer = new Timer();
            var logId = console.genUniqueId && console.genUniqueId();
            logId && console.useId && console.useId(logId);
            console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务开始……');

            gulp.src(_path.resolve(workDir, '**/*.{jpg,gif,png,svg}'))
                .pipe(plugins.plumber({ 'errorHandler': errorHandler }))
                .pipe(plugins.cache(
                    plugins.imagemin([
                        plugins.imagemin.gifsicle({ interlaced: true }),
                        plugins.imagemin.jpegtran({ progressive: true }),
                        // plugins.imagemin.optipng({optimizationLevel: 5}),
                        plugins.pngquant({ quality: '50-80', speed: 4 }),
                        plugins.imagemin.svgo({ plugins: [{ removeViewBox: false }] })
                    ]), {
                        fileCache: new plugins.cache.Cache({ cacheDirName: cacheDirName })
                    }
                ).on('error', function () {
                    this.emit('end');
                }))
                .pipe(gulp.dest(workDir))
                .on('end', function () {
                    logId && console.useId && console.useId(logId);
                    console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务结束。（' + timer.getTime() + 'ms）');
                    done();
                });
        };
    },
    'clear_cache': function (console, errorHandler, taskName) {
        return function (done) {
            var timer = new Timer();
            var logId = console.genUniqueId && console.genUniqueId();
            logId && console.useId && console.useId(logId);
            console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 清空图片缓存中……');

            var cacheDirPath = _path.resolve(_os.tmpdir(), cacheDirName);

            function afterClean() {
                logId && console.useId && console.useId(logId);
                console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 图片缓存清空完毕。（' + timer.getTime() + 'ms）');
                done();
            }
            var cleanFailed = function (e) {
                var err = new Error('图片缓存目录清理失败，请检查目录是否被占用');
                err.detail = e;
                errorHandler(err);

                afterClean();
            };
            plugins.del(cacheDirPath, { force: true }).then(afterClean).catch(cleanFailed);
        };
    }
};
