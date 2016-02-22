/**
 * Created by shu on 2016/2/19.
 */

var gulp = require('gulp'),

    frontCustos = require('./index.js');

frontCustos.registerTasks(gulp);

var params = {
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
    delUnusedFiles: true,
    keepOldCopy: false,
    taskName: 'common_tasks'
};
frontCustos.process(params);


