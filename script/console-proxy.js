/**
 * Created by krimeshu on 2016/5/14.
 */

const originConsole = global.console;

var console = {
    lineUp() {
        originConsole.log('\033[2A');
    },
    log(...args) {
        originConsole.log(...args);
    },
    info(...args) {
        args[0] = '\033[32m' + (args[0] || '');
        originConsole.error(...args, '\033[0m');
    },
    warn(...args) {
        args[0] = '\033[33m' + (args[0] || '');
        originConsole.error(...args, '\033[0m');
    },
    error(...args) {
        args[0] = '\033[31m' + (args[0] || '');
        originConsole.error(...args, '\033[0m');
    }
};

module.exports = {
    get console() {
        return console;
    },
    takeOverConsole: function (_console) {
        if (_console.log && _console.info && _console.warn && _console.error) {
            console = _console;
        }
    }
};
