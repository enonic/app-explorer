var deletedRepos = [];
var exists = true;

exports.delete = function (repoName) {
    deletedRepos.push(repoName);
    return exists;
};

exports.__deletedRepos = function () {
    return deletedRepos;
};

exports.__setExists = function (value) {
    exists = value;
};

exports.__reset = function () {
    deletedRepos.length = 0;
    exists = true;
};
