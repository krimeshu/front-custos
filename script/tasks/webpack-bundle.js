/**
 * Created by krimeshu on 2017/7/25.
 */

var _path = require('path'),

    PluginLoader = require('../plugin-loader.js'),
    plugins = PluginLoader.plugins,

    Utils = require('../utils.js'),
    Timer = require('../timer.js');

PluginLoader.add({ 'through': () => require('through2') });
PluginLoader.add({ 'webpack': () => require('webpack') });
PluginLoader.add({ 'gulpWebpack': () => require('webpack-stream') });
PluginLoader.add({ 'named': () => require('vinyl-named') });

PluginLoader.add({ 'autoprefixer': () => require('autoprefixer') });

PluginLoader.add({ 'babelPresetEs2015': () => require('babel-preset-es2015') });
PluginLoader.add({ 'babelPresetReact': () => require('babel-preset-react') });
PluginLoader.add({ 'babelPluginExternalHelpers': () => require('babel-plugin-external-helpers') });

// 使用Webpack打包JS:
module.exports = function (console, gulp, params, errorHandler, taskName) {
    return function (done) {
        var smOpt = params.smOpt || {},
            isSourcemapEnabled = !!smOpt.enable,
            sourceMappingURL = smOpt.mappingUrl;

        var workDir = params.workDir,
            pattern = _path.resolve(workDir, '**/*@(.js|.jsx|.vue|.ts|.es6|.vue)'),
            jsOpt = params.jsOpt || {},
            wpOpt = params.wpOpt || {};

        var timer = new Timer();
        var logId = console.genUniqueId && console.genUniqueId();
        logId && console.useId && console.useId(logId);
        console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务开始……');

        var entry = jsOpt.bundleEntry;
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
            console.error('没有设置打包入口脚本，请配置或打开 find_bundle_entry 任务。');
            _finish();
            return;
        }

        var entryObj = {};
        entry.forEach((entryPath) => {
            if (_path.isAbsolute(entryPath)) {
                entryPath = _path.relative(workDir, entryPath);
            }
            // if (!_path.isAbsolute(entryPath)) {
            //     entryPath = _path.resolve(workDir, entryPath);
            // }
            entryPath = Utils.replaceBackSlash(entryPath);
            if (!/^\.{1,2}\//.test(entryPath)) {
                entryPath = './' + entryPath;
            }
            entryObj[entryPath] = entryPath;
        });

        var moduleRoot = './front-custos/node_modules/';
        moduleRoot = Utils.replaceBackSlash(_path.join(process.cwd(), moduleRoot));
        function resolveLoader() {
            var names = [];
            [].forEach.call(arguments, function (name) {
                names.push(moduleRoot + name);
            });
            return names.join('!');
        };

        gulp.src(entry, { base: workDir })
            .pipe(plugins.plumber({ 'errorHandler': errorHandler }))
            .pipe(plugins.gulpWebpack({
                context: workDir,
                // context: process.cwd() + '/front-custos',
                entry: entryObj,
                output: {
                    filename: '[name]'
                },
                devtool: isSourcemapEnabled ? 'cheap-inline-module-source-map ' : undefined,
                module: {
                    rules: [
                        {
                            test: /\.css$/,
                            use: [
                                resolveLoader('style-loader'),
                                resolveLoader('css-loader?modules&importLoaders=1'),
                                {
                                    loader: resolveLoader('postcss-loader'),
                                    options: {
                                        plugins: () => [
                                            plugins.autoprefixer
                                        ]
                                    }
                                }
                            ]
                        }, {
                            test: /\.(js|jsx|es6)$/,
                            exclude: /node_modules/,
                            use: {
                                loader: resolveLoader('babel-loader'),
                                options: {
                                    presets: [
                                        plugins.babelPresetEs2015,
                                        plugins.babelPresetReact
                                    ]
                                }
                            }
                        }, {
                            test: /\.vue$/,
                            exclude: /node_modules/,
                            use: {
                                loader: resolveLoader('vue-loader'),
                                options: {
                                    loaders: {
                                        js: resolveLoader('babel-loader'),
                                        css: resolveLoader('vue-style-loader', 'css-loader'),
                                        sass: resolveLoader('vue-style-loader', 'css-loader', 'sass-loader?indentedSyntax'),
                                        scss: resolveLoader('vue-style-loader', 'css-loader', 'sass-loader')
                                    }
                                }
                            }
                        }
                    ]
                }
            }, plugins.webpack))
            .pipe(plugins.gulpif(isSourcemapEnabled, plugins.sourcemaps.init({ loadMaps: true })))
            .pipe(plugins.through.obj(function (file, enc, cb) {
                // Dont pipe through any source map files as it will be handled 
                // by gulp-sourcemaps 
                !/\.map$/.test(file.path) && this.push(file);
                cb();
            }))
            .pipe(plugins.gulpif(isSourcemapEnabled, plugins.sourcemaps.write('', { sourceMappingURL })))
            .pipe(gulp.dest(workDir))
            .once('end', _finish);

        function _finish() {
            logId && console.useId && console.useId(logId);
            console.log(Utils.formatTime('[HH:mm:ss.fff]'), taskName + ' 任务结束。（' + timer.getTime() + 'ms）');
            done();
        }
    };
};