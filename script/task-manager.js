/**
 * Created by krimeshu on 2016/5/14.
 */

var gulp = require('gulp'),

    PluginLoader = require('./plugin-loader.js'),
    plugins = PluginLoader.plugins,

    ConsoleProxy = require('./console-proxy.js'),
    DependencyInjector = require('./dependency-injector.js'),
    TaskList = require('./task-list.js'),
    TaskErrorHandler = require('./task-error-handler.js');

PluginLoader.add({ 'runSequence': () => require('run-sequence') });

function TaskManager() {
    this._map = {};
    this._data = [];

    this._injector = new DependencyInjector({
        // 固定不变的依赖
        gulp: gulp
    });


    // 其它任务
    var extraTask = [
        { name: 'do_upload', load: () => require('./tasks/do-upload'), desc: '上传文件到服务器' },
        { name: 'clear_tmp_dir', load: () => require('./tasks/clear-tmp-dir'), desc: '清理临时目录' }
    ];
    TaskList.concat(extraTask).forEach((task) => {
        this._define(task.name, task.load(), task.desc);
    });

    this._registerToGulp();
}

TaskManager.prototype = {
    _define: function (name, mod, desc) {
        if (typeof mod === 'function') {
            this._doDefine(name, mod);
        } else if (typeof mod === 'object') {
            for (var subName in mod) {
                if (mod.hasOwnProperty(subName)) {
                    this._doDefine(subName ? name + ':' + subName : name, mod[subName]);
                }
            }
        }
    },
    _doDefine: function (name, task) {
        if (this._map[name]) {
            throw new Error('任务“' + name + '”已存在，请勿重复定义');
        }
        var t = this._map[name] = {
            name: name,
            task: task
        };
        this._data.push(t);
    },
    _registerToGulp: function () {
        var injector = this._injector;
        this._data.forEach(function (t) {
            var name = t.name,
                task = t.task,
                funcWithDep = injector.analyseDependencies(task),
                errorHandler = TaskErrorHandler.create(name);
            gulp.task(name, function (done) {
                injector.registerMap({
                    // 每个任务中都会变化的依赖
                    taskName: name,
                    errorHandler: errorHandler
                });
                var executor = injector.invoke(funcWithDep);
                return executor(done);
            });
        });
    },
    fillAndOrderTasks: function (tasks) {
        var _tasks = [],
            taskList = TaskList;
        for (var i = 0, task; task = taskList[i]; i++) {
            var pos = tasks.indexOf(task.name);
            if (!task.disabled && (pos >= 0 || task.locked)) {
                _tasks.push(task.name);
            }
        }
        var _args = [0, tasks.length].concat(_tasks);
        tasks.splice.apply(tasks, _args);
    },
    runTasks: function (_params, _config) {
        var params = _params || {},
            config = _config || {},
            tasks = params.tasks || [];
        this._injector.registerMap({
            // 每次运行任务可能会变化的依赖
            console: ConsoleProxy.console,
            config: config,
            params: params
        });
        var runSequence = plugins.runSequence.use(gulp);
        runSequence.apply(null, tasks);
    }
};

module.exports = TaskManager;