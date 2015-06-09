var MemoryInputFileSystem = require('enhanced-resolve/lib/MemoryInputFileSystem')
var MemoryOutputFileSystem = require('webpack/lib/MemoryOutputFileSystem')
var path = require('path')
var webpack = require('webpack')
var extend = require('extend')

module.exports = plugin

function plugin(config) {
    var filesOutput = {}
    var fs = new MemoryInputFileSystem(filesOutput)
    return function (files, metalsmith, done) {
        // Construct the default options.
        var defaults = {
            context: path.resolve(metalsmith._directory, metalsmith._source)
        };

        // Create the compiler, bringing in any defaults if needed.
        var compiler = webpack(extend({}, defaults, config));
        compiler.outputFileSystem = new MemoryOutputFileSystem(filesOutput)

        // Run webpack.
        compiler.run(function(err){
            if (err) return done(err)
            fs.readdirSync(config.output.path).forEach(function(file){
                var filePath = path.join(config.output.path, file)
                var key = getMetalsmithKey(files, filePath) || filePath
                files[key] = {
                    contents: fs.readFileSync(filePath)
                }
            })
            return done()
        })
    }
}

function getMetalsmithKey(files, p) {
    p = normalizePath(p)
    for (var key in files) {
        if (normalizePath(key) === p) return key
    }
    return null
}

function normalizePath(p) {
    return p.split(path.sep).filter(function(p){
        return typeof p === 'string' && p.length > 0
    }).join('/')
}
