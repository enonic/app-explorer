var assert = require('/lib/xp/testing');

exports.testWebcrawlTaskLoads = function () {
    var polyfills = require('/lib/nashorn/index').default;
    assert.assertEquals('object', typeof polyfills);
    var task = require('/tasks/webcrawl/webcrawl');
    assert.assertEquals('function', typeof task.run);
};
