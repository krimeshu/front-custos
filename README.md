# front-custos

一个前端开发的试验工具，用于懒得或不会写 gulpfile 时，能快速对不同项目生成常用的 gulp 任务。

![screenshot-command-line](https://github.com/krimeshu/front-custos/raw/master/screenshot-command-line.png)

## 安装方法

切换到需要处理的项目所在目录，执行`npm install`。

```bash
npm install front-custos --save-dev
```

运行测试项目检查是否安装完成。

```bash
cd node_modules/front-custos
node test
```

## 使用方法

切换到需要处理的项目所在目录，创建 `make.js`。

```javascript 
var frontCustos = require('front-custos'),
    packageOptions = require('./package.json'),
    fcOptions = packageOptions.fcOpt;

fcOptions['projDir'] = './';

frontCustos.setConfig({
    outputDir: './dist',    // Modify it to your distribute directory
    htmlEnhanced: false,
    delUnusedFiles: true,
    flattenMap: {           // File directory name of file types
        page: '',
        style: 'css',
        script: 'js',
        image: 'images',
        font: 'font',
        audio: 'audio',
        other: 'raw'
    },
    concurrentLimit: 1
});

frontCustos.process(fcOptions);
```

项目具体任务配置存在项目根目录的 `package.json` 文件的 `fcOpt` 字段内：

```javascript
// example
{
    // Task options of sprite_crafter:
    "scOpt": {
      "useRatio": "2",
      "useRem": "1"
    },
    // Task options of prefix_crafter:
    "pcOpt": {
      "browsers": "Android > 2.3, iOS > 6.0"
    },
    // Task options of allot_link:
    "alOpt": {
      "allot": true,
      "pageDir": "page",
      "staticDir": "static",
      "staticUrlHead": "http://example.com/{PROJECT_NAME}",
      "flatten": true,
      "hashLink": true,
      "useStaticUrlHead": false
    },
    // Task options of do_upload:
    "upOpt": {
      "delta": true,
      "page": "",
      "form": "function uploadForm(fileStream, filePath) {\r\n    var fileDir = filePath.split('/'),\r\n        fileName = fileDir.pop().split('.'),\r\n        fileType = fileName.length > 1 ? fileName.pop() : '';\r\n    // console.log('其它可用参数：', this.queryAvailableArguments().join(', '));\r\n    return {\r\n        'fileDir': fileDir.join('/'),\r\n        'fileName': fileName.join('.'),\r\n        'fileType': fileType,\r\n        'fileContents': fileStream\r\n    };\r\n}",
      "judge": "function uploadJudge(response) {\n    return /^上传成功/.test(response);\n}"
    },
    // Build tasks of current project:
    "tasks": [
      "compile_sass",
      "run_babel",
      "prepare_build",
      "replace_const",
      "vue_php_ssr_template",
      "prefix_crafter",
      "sprite_crafter",
      "run_csso",
      "join_include",
      "run_browserify",
      "allot_link",
      "optimize_image",
      "do_dist"
    ],
    // Source directory sub-path, when it is under the project directory (Otherwise keep it empty):
    "innerSrcDir": "./src",
    // Distribute directory sub-path, when it is under the project directory (Otherwise keep it empty):
    "innerDistDir": "./dist",
    // Do something before processing:
    "preprocessing": "function preprocessing(console, workDir) {\n    console.log('当前工作目录：', workDir);\n    // console.log('其它可用参数：', this.queryAvailableArguments().join(', '));\n    // Todo: do something before build.\n}",
    // Do something after processing:
    "postprocessing": "function postprocessing(console, workDir) {\n    console.log('当前工作目录：', workDir);\n    // console.log('其它可用参数：', this.queryAvailableArguments().join(', '));\n    // Todo: do something after build.\n}",
    // Put generated files into sub-directory by it's version:
    "keepOldCopy": false
  }
```

更多内容请参考：

[https://github.com/krimeshu/front-custos-gui](https://github.com/krimeshu/front-custos-gui)
