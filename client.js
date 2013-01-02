var ejs = require('./ejs');
var request = require('superagent');

var client = {
    pathPrefix:'',
    ejsExtension:'.ejs'
};
var cache = {};

var renderFromCache = function(fullPath, locals) {
    return ejs.render(cache[fullPath], locals);
};

var handleSync = function(fullPath, locals) {
    var done = false;
    while(!done) {
        if (cache[fullPath]) {
            done = true;
            return renderFromCache(fullPath, locals);
        }
    }
}

client.render = function(file, locals, callback) {
    if (typeof locals === 'function') {
        callback = locals;
        locals = {};
    }

    var fullPath = client.pathPrefix+file+client.ejsExtension;
    if (cache[fullPath]) {
        var rendered = renderFromCache(fullPath, locals);
        return (callback && callback(null, rendered)) || rendered;
    }

    request.get(fullPath, function(res) {
        if (res.status !== 200) {
            return callback && callback(res);
        }
        cache[fullPath] = res.text;
        var rendered = renderFromCache(fullPath, locals);
        return callback && callback(null, rendered);
    });

    if (!callback) {
        return handleSync(fullPath, locals);
    }
};

client.clearCache = function() {
    cache = {};
};

module.exports = client;