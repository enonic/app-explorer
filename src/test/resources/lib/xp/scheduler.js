var deletedNames = [];

exports.delete = function (params) {
    deletedNames.push(params.name);
    return true;
};

exports.__deletedNames = function () {
    return deletedNames;
};

exports.__reset = function () {
    deletedNames.length = 0;
};
