/**
 * Created by krimeshu on 2017/6/23.
 */

var _path = require('path'),
    _os = require('os'),

    PluginLoader = require('../plugin-loader.js'),
    plugins = PluginLoader.plugins,

    Utils = require('../utils.js'),
    Timer = require('../timer.js');

// 清理临时目录：
// - 将临时文件目录的内容删除
module.exports = function (console, errorHandler, taskName) {
    return function (done) {
        var timer = new Timer();
        var logId = console.genUniqueId && console.genUniqueId();
        logId && console.useId && console.useId(logId);
        console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 清空文件缓存中……');

        var cacheDirPath = _path.resolve(_os.tmpdir(), 'FC_BuildDir');

        function afterClean() {
            logId && console.useId && console.useId(logId);
            console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 文件缓存清空完毕。（' + timer.getTime() + 'ms）');
            done();
        }
        var cleanFailed = function (e) {
            var err = new Error('文件缓存目录清理失败，请检查目录是否被占用');
            err.detail = e;
            errorHandler(err);

            afterClean();
        };
        plugins.del(cacheDirPath, { force: true }).then(afterClean).catch(cleanFailed);
    };
}