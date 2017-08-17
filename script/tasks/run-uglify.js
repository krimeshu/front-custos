/**
 * Created by krimeshu on 2017/7/14.
 */

var _path = require('path'),

    PluginLoader = require('../plugin-loader.js'),
    plugins = PluginLoader.plugins,

    Utils = require('../utils.js'),
    Timer = require('../timer.js');

PluginLoader.add({
    uglifyES: () => require('uglify-es'),
    composer: () => require('gulp-uglify/composer')
});

// 压缩&混淆 JS 代码
module.exports = function (console, gulp, params, errorHandler, taskName) {
    return function (done) {
        var smOpt = params.smOpt || {},
            isSourcemapEnabled = !!smOpt.enable,
            sourceMappingURL = smOpt.mappingUrl;

        var workDir = params.workDir,
            jsOpt = params.jsOpt || {},
            entry = jsOpt.bundleEntry;


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
            entry = _path.resolve(workDir, '**/*@(.js)');
        }

        var minify = plugins.composer(plugins.uglifyES, console);

        var timer = new Timer();
        var logId = console.genUniqueId && console.genUniqueId();
        logId && console.useId && console.useId(logId);
        console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务开始……');
        gulp.src(entry, { base: workDir })
            .pipe(plugins.plumber({ 'errorHandler': errorHandler }))
            .pipe(plugins.gulpif(isSourcemapEnabled, plugins.sourcemaps.init({ loadMaps: true })))
            .pipe(plugins.cache(
                minify({
                    compress: {
                        unused: false
                    }
                })).on('error', function (err) {
                    console.error(err);
                    this.emit('end');
                }))
            .pipe(plugins.gulpif(isSourcemapEnabled, plugins.sourcemaps.write('', { sourceMappingURL })))
            .pipe(gulp.dest(workDir))
            .on('end', function () {
                logId && console.useId && console.useId(logId);
                console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务结束。（' + timer.getTime() + 'ms）');
                done();
            });
    };
};