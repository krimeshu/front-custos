/**
 * Created by shu on 2016/2/19.
 */

var gulp = require('gulp'),

    frontCustos = require('./index.js');

frontCustos.registerTasks(gulp);

var params = {
    srcDir: 'E:\\Subversion\\h5\\static\\h5_phone_v3',
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
        pageDir: 'm.ac/Template',
        staticDir: 'static/media',
        staticUrlHead: 'http://ac.gtimg.com/h5',
        flatten: false,
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


