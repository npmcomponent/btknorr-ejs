var ejs = require('ejs');
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

    var fullPath = ef.pathPrefix+file+ef.ejsExtension;
    if (cache[fullPath]) {
        return callback(null, renderFromCache(fullPath, locals));
    }
    request.get(fullPath, function(res) {
        if (res.status !== 200) {
            return callback(res);
        }
        cache[fullPath] = res.text;
        return callback(renderFromCache(fullPath, locals));
    });
};

client.clearCache = function() {
    cache = {};
};

module.exports = client;