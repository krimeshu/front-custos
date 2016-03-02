/**
 * Created by shu on 2016/2/19.
 */

var gulp = require('gulp'),

    frontCustos = require('./');

frontCustos.registerTasks(gulp);
frontCustos.config({
    htmlEnhanced: false,
    delUnusedFiles: true,
    uploadPage: 'http://admin.ac.oa.com/uploadDevFile.php',
    uploadForm: function (fileStream, projectName, relativeName) {
        var utils = require('./script/utils.js'),
            prefix = (relativeName.split('/').slice(0, -1));
        prefix.splice(0, 0, projectName);
        if (!utils.isPage(relativeName)) {
            prefix.pop();
        }
        return {
            'fileName': relativeName,
            'prefix': prefix.join('/'),
            'myfile': fileStream
        };
    },
    uploadCallback: function (response) {
        return /^上传成功/.test(response);
    },
    concurrentLimit: 1
});

frontCustos.process({
    srcDir: './example/',
    version: '0.1.0',
    scOpt: {
        "useRatio": 1,
        "useRem": 1
    },
    pcOpt: {
        "browsers": "Android > 2.3, iOS > 6.0"
    },
    alOpt: {
        allot: true,
        pageDir: 'page/{PROJECT_NAME}',
        staticDir: 'static/{PROJECT_NAME}',
        staticUrlHead: 'http://static.foo.com/{PROJECT_NAME}',
        flatten: true,
        flattenMap: {
            page: '',
            style: 'css',
            script: 'js',
            image: 'images',
            font: 'font',
            audio: 'audio',
            other: 'raw'
        },
        hashLink: true
    },
    keepOldCopy: false,
    tasks: [
        'prepare_build',
        'replace_const',
        'join_include',
        'sprite_crafter',
        'prefix_crafter',
        'allot_link',
        'optimize_image',
        'do_dist'
    ]
});


