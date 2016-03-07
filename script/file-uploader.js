/**
 * Created by krimeshu on 2016/3/1.
 */

var _fs = require('fs'),
    _path = require('path'),

    Through2 = require('through2'),
    Request = require('request'),

    Utils = require('./utils.js');

var FileUploader = function (opts) {
    var self = this,
        projectName = opts.projectName,
        pageDir = opts.pageDir,
        staticDir = opts.staticDir,
        uploadPage = opts.uploadPage,
        uploadForm = opts.uploadForm,
        concurrentLimit = opts.concurrentLimit || 1;

    self.uploadQueue = [];
    self.projectName = projectName;
    self.pageDir = pageDir;
    self.staticDir = staticDir;
    self.uploadPage = uploadPage;
    self.uploadForm = uploadForm;
    self.concurrentLimit = concurrentLimit;
    self.concurrentCount = 0;
};

FileUploader.prototype = {
    appendFile: function () {
        var self = this;

        self.uploadQueue = [];
        return Through2.obj(function (file, enc, cb) {
            //console.log('FileUploader - appendFile: ', file.path);
            if (!file.isDirectory()) {
                self.uploadQueue.push(file.path);
            }

            this.push(file);

            cb();
        }).resume();
    },
    start: function (onProgress, onComplete) {
        var self = this,
            uploadForm = self.uploadForm,
            uploadQueue = self.uploadQueue;

        if (typeof uploadForm === 'string') {
            uploadForm = new Function('return ' + uploadForm)();
        }
        if (typeof uploadQueue === 'string') {
            uploadQueue = new Function('return ' + uploadQueue)();
        }

        self.uploadResult = {
            succeed: [],
            failed: [],
            totalCount: uploadQueue.length
        };

        //console.log(uploadQueue);
        uploadQueue.forEach(function (filePath) {
            var uploadPage = self.uploadPage,
                projectName = self.projectName,
                pageDir = self.pageDir,
                staticDir = self.staticDir,

                isPage = Utils.isPage(filePath),
                relativeDir = _path.relative(isPage ? pageDir : staticDir, filePath).replace(/\\/g, '/'),

                fileStream = _fs.createReadStream(filePath),
                formMap = uploadForm(fileStream, relativeDir, projectName);
            uploadPage += (uploadPage.indexOf('?') < 0 ? '?' : '&') +
                't=' + new Date().getTime();

            var _upload = function (done) {
                //throw new Error('测试错误。');
                var request = Request({
                    url: uploadPage,
                    method: 'POST',
                    timeout: 10000,
                    headers: {
                        connection: 'keep-alive'
                    }
                }, function (err, response, body) {
                    var res = self.uploadResult;
                    if (!err && (!onProgress || onProgress(err, filePath, body, res))) {
                        res.succeed.push(filePath);
                    } else {
                        res.failed.push(filePath);
                    }
                    if (res.succeed.length + res.failed.length >= res.totalCount) {
                        onComplete && onComplete(res);
                    }
                    done();
                });
                var form = request.form();
                for (var key in formMap) {
                    if (formMap.hasOwnProperty(key)) {
                        form.append(key, formMap[key]);
                    }
                }
            };
            self.doUpload(_upload);
        });
    },
    doUpload: function (_upload) {
        var self = this,
            concurrentLimit = self.concurrentLimit,
            concurrentCount = self.concurrentCount;
        if (concurrentCount < concurrentLimit) {
            self.concurrentCount++;
            _upload(function () {
                self.concurrentCount--;
            });
        } else {
            setTimeout(function () {
                self.doUpload(_upload);
            }, 200);
        }
    }
};

module.exports = FileUploader;
