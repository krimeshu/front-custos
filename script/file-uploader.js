/**
 * Created by krimeshu on 2016/3/1.
 */

var _fs = require('fs'),
    _path = require('path'),

    Through2 = require('through2'),
    Request = require('request');

var FileUploader = function (opts) {
    var self = this,
        projectName = opts.projectName,
        projectDir = opts.projectDir,
        uploadPage = opts.uploadPage,
        uploadForm = opts.uploadForm;

    self.projectName = projectName;
    self.projectDir = projectDir;
    self.uploadPage = uploadPage;
    self.uploadForm = uploadForm;
    self.uploadQueue = [];
};

FileUploader.prototype = {
    appendFile: function () {
        var self = this;
        return Through2.obj(function (file, enc, cb) {
            self.uploadQueue.push(file.path);

            return cb(null, file);
        });
    },
    doUpload: function (onProgress, onComplete) {
        var self = this,
            uploadForm = self.uploadForm,
            uploadQueue = self.uploadQueue;

        if (typeof uploadForm === 'string') {
            uploadForm = new Function('return ' + uploadForm)();
        }

        self.uploadResult = {
            succeed: [],
            failed: []
        };

        uploadQueue.forEach(function (filePath) {
            var uploadPage = self.uploadPage,
                projectName = self.projectName,
                projectDir = self.projectDir,

                fileDir = _path.dirname(filePath),
                relativeDir = _path.relative(projectDir, fileDir),

                fileStream = _fs.createReadStream(filePath),
                formMap = uploadForm(filePath, fileStream, projectName, relativeDir);
            uploadPage += (uploadPage.indexOf('?') < 0 ? '?' : '&') +
                't=' + new Date().getTime();
            var request = Request({
                url: uploadPage,
                method: 'POST',
                timeout: 10000,
                headers: {
                    connection: 'keep-alive'
                }
            }, function (err, response, body) {
                var res = self.uploadResult,
                    que = self.uploadQueue;
                if (err) {
                    res.failed.push(filePath);
                } else {
                    res.succeed.push(filePath);
                }
                onProgress(err, filePath, body, res);
                if (res.succeed.length + res.failed.length >= que.length) {
                    onComplete(res);
                }
            });
            var form = request.form();
            for (var key in formMap) {
                if (formMap.hasOwnProperty(key)) {
                    form.append(key, formMap[key]);
                }
            }
        });
    }
};

module.exports = FileUploader;
