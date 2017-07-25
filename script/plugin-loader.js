/**
 * Created by krimeshu on 2016/5/14.
 */

var _this = {
    plugins: {
        _cached: {},
        _loaded: {},
        get gulp() {
            return this._loaded['gulp'];
        },
        set gulp(gulp) {
            this._loaded['gulp'] = gulp;
        }
    },
    hasCached: function (name) {
        var plugins = this.plugins,
            _cached = plugins._cached;
        return _cached.hasOwnProperty(name);
    },
    hasLoaded: function (name) {
        var plugins = this.plugins,
            _loaded = plugins._loaded;
        return _loaded.hasOwnProperty(name);
    },
    load: function (name) {
        var plugins = this.plugins,
            _cached = plugins._cached,
            _loaded = plugins._loaded;
        if (this.hasLoaded(name)) {
            return;
        }
        return _loaded[name] = _cached[name]();
    },
    add: function (map) {
        for (var name in map) {
            if (!map.hasOwnProperty(name)) {
                return;
            }
            if (!this.hasCached(name)) {
                this._addToCache(name, map[name]);
            }
        }
    },
    _addToCache: function (name, getter) {
        var plugins = this.plugins,
            _cached = plugins._cached,
            _loaded = plugins._loaded;
        _cached[name] = getter;
        Object.defineProperty(plugins, name, {
            get: () => {
                return this.hasLoaded(name) ? _loaded[name] : this.load(name);
            }
        });
    }
};

_this.add({ 'plumber': () => require('gulp-plumber') });
_this.add({ 'gulpif': () => require('gulp-if') });
_this.add({ 'sourcemaps': () => require('gulp-sourcemaps') });
_this.add({ 'cache': () => require('gulp-cache') });

module.exports = _this;