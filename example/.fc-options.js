module.exports = {
    "__default": {
        "scOpt": {
            "useRatio": "2",
            "useRem": "1"
        },
        "pcOpt": {
            "browsers": "Android > 2.3, iOS > 6.0",
            "cssnano": true
        },
        "jsOpt": {
            "bundleEntry": "js/bundle-entry.js\njs/use-vue-component.js\njs/use-react-component.js"
        },
        "ruOpt": {
            "plugins": {
                "nodeResolve": true,
                "commonJS": true,
                "babel": true,
                "vue": true,
                "postcssModules": true,
                "uglify": false
            },
            "format": "iife"
        },
        "alOpt": {
            "pageDir": "page",
            "staticDir": "static",
            "staticUrlHead": "http://example.com/{PROJECT_NAME}",
            "flatten": true,
            "hashLink": "IN_FILE_NAME",
            "useStaticUrlHead": false
        },
        "upOpt": {
            "delta": true,
            "page": "",
            "filter": function (filePath, projName) {
                /* 
                    决定某文件是否需要上传
                    可用的注入参数:
                    - console, params, config, projName, projDir, srcDir, distDir, workDir...
                    - filePath: Path of the uploading file
                    - fileStream: Stream of the uploading file
                    查看所有可用参数:
                    - console.log(this.queryAvailableArguments();
                */
                // 例子: 
                //   不上传下划线开头的文件
                return !/^_/.test(filePath);
            },
            "form": function (fileStream, filePath) {
                /* 
                    生成文件上传的表单.
                      可用的注入参数:
                        - console, params, config, projName, projDir, srcDir, distDir, workDir...
                        - filePath: Path of the uploading file
                        - fileStream: Stream of the uploading file
                      查看所有可用参数:
                        - console.log(this.queryAvailableArguments();
                 */
                // 例子:
                //   生成带有 fileDir, fileName, fileType, fileContents 四个字段的表单，其中 fileContents 为上传的文件内容
                var fileDir = filePath.split('/'),
                    fileName = fileDir.pop().split('.'),
                    fileType = fileName.length > 1 ? fileName.pop() : '';
                return {
                    'fileDir': fileDir.join('/'),
                    'fileName': fileName.join('.'),
                    'fileType': fileType,
                    'fileContents': fileStream
                };
            },
            "judge": function (response) {
                /*
                    判断文件上传是否成功.
                      可用的注入参数:
                        - console, params, config, projName, projDir, srcDir, distDir, workDir...
                        - filePath: Path of the uploading file
                        - fileStream: Stream of the uploading file
                        - response: Response from the uploading server
                      查看所有可用参数:
                        - console.log(this.queryAvailableArguments();
                 */
                // 例子: 
                //   根据是否返回 { status: 2 } 判断上传结果.
                try {
                    var res = JSON.parse(response);
                    return res.status == 2;
                } catch (e) {
                    return false;
                }
            }
        },
        "tasks": [
            "compile_sass",
            "prepare_build",
            "replace_const",
            "vue_php_ssr_template",
            "prefix_crafter",
            "sprite_crafter",
            "optimize_image",
            "run_csso",
            "join_include",
            "webpack_bundle",
            "allot_link",
            "do_dist"
        ],
        "innerSrcDir": "./src",
        "innerDistDir": "./dist",
        "preprocessing": function (console, workDir) {
            /* 
                任务开始前的预处理逻辑
                  可用的注入参数:
                    - console, params, config, projName, projDir, srcDir, distDir, workDir...
                  查看所有可用参数:
                    - console.log(this.queryAvailableArguments();
             */
            console.log('当前工作目录：', workDir);
        },
        "postprocessing": function (console, workDir) {
            /* 
                任务结束前的处理逻辑
                  可用的注入参数:
                    - console, params, config, projName, projDir, srcDir, distDir, workDir...
                  查看所有可用参数:
                    - console.log(this.queryAvailableArguments();
             */
            console.log('当前工作目录：', workDir);
        },
        "keepOldCopy": false,
        "smOpt": {
            "mappingUrl": function (file) {
                /*
                    传给 gulp-sourcemaps 插件 write 参数中的 
                        sourceMappingURL 字段
                 */
                // return 'http://asset-host.example.com/' + file.relative + '.map';
                return require('path').basename(file.path) + '.map';
            },
            "enable": true
        },
        "brOpt": {
            "babelify": true,
            "vueify": true,
            "lessModulesify": true
        }
    }
};
