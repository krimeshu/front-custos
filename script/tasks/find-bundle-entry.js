/**
 * Created by krimeshu on 2017/5/2.
 */

var _fs = require('fs'),
    _path = require('path'),

    PluginLoader = require('../plugin-loader.js'),
    plugins = PluginLoader.plugins,

    Utils = require('../utils.js'),
    Timer = require('../timer.js');

var Through2 = require('through2');

module.exports = function (console, gulp, params, config, errorHandler, taskName) {

    var canIgnore = function (_rawStr) {
        return (
            // 忽略空链接
            !_rawStr.length ||
            // 忽略非本地文件
            /^((http|https|data|javascript|about|chrome):|\/\/)/.test(_rawStr) ||
            // 忽略各种模板标记
            /((\{\{|}})|(<|>)|(\{.*?})|^\$)/.test(_rawStr)
        );
    };

    var regExpHtml = /<(?:script)[^>]*(?:src)\s*=\s*['"]?([^<>'"\$]+)[<>'"\$]?[^>]*>/gi;

    return function (done) {
        var workDir = params.workDir,
            pattern = _path.resolve(workDir, '**/*@(.html|.shtml|.php)'),
            bundleEntry = [];

        var timer = new Timer();
        var logId = console.genUniqueId && console.genUniqueId();
        logId && console.useId && console.useId(logId);
        console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务开始……');

        gulp.src(pattern, { base: workDir })
            .pipe(plugins.plumber({ 'errorHandler': errorHandler }))
            .pipe(Through2.obj(function (file, enc, cb) {
                var filePath = file.path,
                    isDir = file.isDirectory(),
                    isText = !isDir && Utils.isText(filePath),
                    content = isText ? String(file.contents) : file.contents;

                if (isText) {
                    let reg = new RegExp(regExpHtml),
                        match,
                        basePath = Utils.replaceBackSlash(file.base),
                        filePath = Utils.replaceBackSlash(file.path),
                        dir = _path.dirname(filePath);
                    while ((match = reg.exec(content)) !== null) {
                        let rawStr = match[0],
                            rawFile = match[1],
                            file = rawFile && rawFile.split(/[?#]/)[0];
                        if (!file || canIgnore(rawFile)) {
                            continue;
                        }
                        if (!_path.isAbsolute(file)) {
                            file = _path.resolve(dir, file);
                        }
                        if (!_fs.existsSync(file) || !_fs.statSync(file).isFile()) {
                            continue;
                        }
                        file = Utils.replaceBackSlash(file);
                        if (bundleEntry.indexOf(file) < 0) {
                            bundleEntry.push(file);
                        }
                    }
                }

                return cb(null, file);
            }))
            .pipe(gulp.dest(workDir))
            .on('end', _finish);

        function _finish() {
            // 记录分析得到的脚本入口
            params.bundleEntry = bundleEntry;

            logId && console.useId && console.useId(logId);
            console.lineUp && console.lineUp();
            console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务结束。（' + timer.getTime() + 'ms）');
            // console.log('找到入口脚本：', bundleEntry);
            done();
        }
    };
};