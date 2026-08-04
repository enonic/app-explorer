var node = null;
var getCalls = [];
var deleteCalls = [];
var refreshCalls = 0;

exports.connect = function () {
    return {
        get: function (id) {
            getCalls.push(id);
            return node;
        },
        delete: function (id) {
            deleteCalls.push(id);
            return [id];
        },
        refresh: function () {
            refreshCalls += 1;
        }
    };
};

exports.__setNode = function (value) {
    node = value;
};

exports.__getCalls = function () {
    return getCalls;
};

exports.__deleteCalls = function () {
    return deleteCalls;
};

exports.__refreshCalls = function () {
    return refreshCalls;
};

exports.__reset = function () {
    node = null;
    getCalls.length = 0;
    deleteCalls.length = 0;
    refreshCalls = 0;
};
