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

client.render = function(file, locals, callback) {
    if (typeof locals === 'function') {
        callback = locals;
        locals = {};
    }

    var fullPath = client.pathPrefix+file+client.ejsExtension;
    if (cache[fullPath]) {
        var rendered = renderFromCache(fullPath, locals);
        return callback && callback(null, rendered) || rendered;
    }
    if (callback) {
        return request.get(fullPath, function(res) {
            if (res.status !== 200) {
                return callback(res);
            }
            cache[fullPath] = res.text;
            return callback(null, renderFromCache(fullPath, locals));
        });
    }
    var res = request.get(fullPath).async(false).end();
    if (res.status !== 200) {
        return new Error('Failed to load '+fullPath);
    }
    cache[fullPath] = res.text;
    return renderFromCache(fullPath,locals);
};

client.clearCache = function() {
    cache = {};
};

module.exports = client;