var jobs = [];
var queriedNames = [];

exports.listExplorerJobsThatStartWithName = function (params) {
    queriedNames.push(params.name);
    return jobs;
};

exports.__setJobs = function (value) {
    jobs = value;
};

exports.__queriedNames = function () {
    return queriedNames;
};

exports.__reset = function () {
    jobs = [];
    queriedNames.length = 0;
};
