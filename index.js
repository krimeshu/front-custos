/**
 * Created by krimeshu on 2016/1/10.
 */

var _os = require('os'),
    _path = require('path'),
    rimraf = require('rimraf'),

    TaskManager = require('./script/task-manager.js'),
    PluginLoader = require('./script/plugin-loader.js'),
    plugins = PluginLoader.plugins,

    Utils = require('./script/utils.js'),
    Timer = require('./script/timer.js'),
    ConsoleProxy = require('./script/console-proxy.js'),
    TaskErrorHandler = require('./script/task-error-handler.js'),
    FilenameHelper = require('./script/filename-helper.js');

PluginLoader.add({ 'ConstReplacer': () => require('./script/plugins/const-replacer.js') });

var config = { delUnusedFiles: true },
    running = false,
    taskManager = new TaskManager();

var FrontCustos = {
    // 编译前后文件名转换管理
    FilenameHelper: FilenameHelper,
    // 接管console
    takeOverConsole: ConsoleProxy.takeOverConsole.bind(ConsoleProxy),
    // 补全并按序排列任务
    fillAndOrderTasks: taskManager.fillAndOrderTasks.bind(taskManager),
    // 直接执行任务
    runTasks: function (_params, cb) {
        if (running) {
            return;
        }
        var params = _params || {},
            tasks = params.tasks || [];
        tasks.push(function () {
            running = false;
            cb && cb();
        });
        running = true;
        // 清空出错记录
        TaskErrorHandler.clearErrorRecords();
        taskManager.runTasks(_params, config);
    },
    // 是否任务中
    isRunning: function () {
        return running;
    },
    // 获取最近任务的出错记录
    getErrorRecords: TaskErrorHandler.getErrorRecords.bind(TaskErrorHandler),
    // 设置通用配置
    setConfig: function (_config) {
        config = _config;
    },
    // 根据项目配置计算出项目源目录
    getSrcDir: function (proj, opts) {
        var projDir = proj.projDir || proj.srcDir,
            innerSrcDir = opts.innerSrcDir || '';
        return innerSrcDir ? _path.resolve(projDir, innerSrcDir) : projDir;
    },
    // 根据项目配置计算出项目输出目录
    getDistDir: function (proj, opts, outputDir) {
        var projDir = proj.projDir || proj.srcDir,
            projName = _path.basename(proj.projDir),
            innerDistDir = opts.innerDistDir || '';
        return innerDistDir ? _path.resolve(projDir, innerDistDir) : _path.resolve(outputDir, projName);
    },
    // 开始处理并执行任务
    process: function (_params, cb) {
        var console = ConsoleProxy.console;
        if (running) {
            return;
        }
        var params = _params || {};
        // 处理项目基本配置
        var {proj} = params;
        var {projDir, version, env, mode}  = proj;
        var projName = _path.basename(projDir);

        if (!projDir) {
            console.error(Utils.formatTime('[HH:mm:ss.fff]'), '开始任务前，请指定一个项目目录。');
            return;
        }

        // 处理项目源、构建、发布目录路径
        var buildDir = _path.resolve(_os.tmpdir(), 'FC_BuildDir', projName),
            srcDir = this.getSrcDir(proj, params),
            distDir = this.getDistDir(proj, params, config.outputDir);

        params.projName = projName;
        params.buildDir = buildDir;
        params.srcDir = srcDir;
        params.distDir = !params.keepOldCopy ? distDir : _path.resolve(distDir, version);
        params.version = version;
        params.env = env;
        params.mode = mode;

        params.workDir = params.workDir || params.srcDir;
        rimraf.sync(params.distDir);

        // 生成项目常量并替换参数中的项目常量
        var replacer = new plugins.ConstReplacer({
            PROJECT: Utils.replaceBackSlash(params.workDir),
            PROJECT_NAME: proj.projName,
            VERSION: proj.version,
            TODAY: new Date().toLocaleDateString()
        });
        replacer.doReplace(params);

        try {
            var smOpt = params.smOpt || (params.smOpt = {});
            smOpt.mappingUrl = Utils.tryParseFunction(smOpt.mappingUrl);
        } catch (e) {
            console.error(Utils.formatTime('[HH:mm:ss.fff]'), '项目的 sourceMappingUrl 脚本执行异常：', e);
        }

        var timer = new Timer();
        console.info(Utils.formatTime('[HH:mm:ss.fff]'), '项目 ' + projName + ' 任务开始……');
        this.runTasks(params, function () {
            const finalStr = Utils.formatTime('[HH:mm:ss.fff]') + ' 项目 ' + projName + ' 任务结束。（共计' + timer.getTime() + 'ms）';
            setTimeout(() => {
                console.info(finalStr);
            }, 500);
            cb && cb();
        });
    },
    welcome: function () {
        var version = require('./package.json').version;
        console.log('Front Custos - v' + version);
        console.log(new Array(41).join('='));
    }
};

FrontCustos.welcome();

module.exports = FrontCustos;