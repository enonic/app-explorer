exports.executeFunction = function () {
    throw new Error('task.executeFunction is deprecated and fails fast on GraalJS - the collection-delete cleanup must run inline');
};

exports.submitTask = function () {
    throw new Error('task.submitTask was not expected in the collection-delete resolver');
};
