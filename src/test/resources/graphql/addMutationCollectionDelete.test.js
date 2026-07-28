var assert = require('/lib/xp/testing');
var connectMock = require('/lib/explorer/repo/connect');
var listJobsMock = require('/lib/explorer/scheduler/listExplorerJobsThatStartWithName');
var schedulerMock = require('/lib/xp/scheduler');
var repoMock = require('/lib/xp/repo');
var addMutationCollectionDelete = require('/services/graphQL/collection/addMutationCollectionDelete').default;

var COLLECTION_NODE_TYPE = 'com.enonic.app.explorer:collection';
var COLLECTION_ID = 'collection-id-1';
var COLLECTION_NAME = 'mycollection';
var JOB_NAME = 'com.enonic.app.explorer.' + COLLECTION_ID;
var REPO_NAME = 'com.enonic.app.explorer.collection.' + COLLECTION_NAME;

function registerMutation() {
    var captured = null;
    var glue = {
        addMutation: function (config) {
            captured = config;
        },
        getScalarType: function () {
            return {};
        },
        getObjectType: function () {
            return {};
        }
    };
    addMutationCollectionDelete({glue: glue});
    return captured;
}

exports.before = function () {
    connectMock.__reset();
    listJobsMock.__reset();
    schedulerMock.__reset();
    repoMock.__reset();
    connectMock.__setNode({
        _id: COLLECTION_ID,
        _name: COLLECTION_NAME,
        _path: '/collections/' + COLLECTION_NAME,
        _nodeType: COLLECTION_NODE_TYPE
    });
};

exports.testDeletesJobsRepoAndCollectionInline = function () {
    listJobsMock.__setJobs([{name: JOB_NAME}]);

    var mutation = registerMutation();
    var result = mutation.resolve({args: {_id: COLLECTION_ID, deleteRepo: true}});

    assert.assertEquals(JOB_NAME, listJobsMock.__queriedNames()[0]);
    assert.assertEquals(1, schedulerMock.__deletedNames().length);
    assert.assertEquals(JOB_NAME, schedulerMock.__deletedNames()[0]);

    assert.assertEquals(1, repoMock.__deletedRepos().length);
    assert.assertEquals(REPO_NAME, repoMock.__deletedRepos()[0]);

    assert.assertEquals(1, connectMock.__deleteCalls().length);
    assert.assertEquals(COLLECTION_ID, connectMock.__deleteCalls()[0]);
    assert.assertEquals(1, connectMock.__refreshCalls());
    assert.assertEquals(COLLECTION_ID, result._id);
};

exports.testDoesNotTouchRepoWhenDeleteRepoIsFalse = function () {
    listJobsMock.__setJobs([{name: JOB_NAME}]);

    var mutation = registerMutation();
    var result = mutation.resolve({args: {_id: COLLECTION_ID, deleteRepo: false}});

    assert.assertEquals(1, schedulerMock.__deletedNames().length);
    assert.assertEquals(0, repoMock.__deletedRepos().length);
    assert.assertEquals(1, connectMock.__deleteCalls().length);
    assert.assertEquals(COLLECTION_ID, result._id);
};

exports.testDeletesEveryMatchingJob = function () {
    listJobsMock.__setJobs([{name: JOB_NAME}, {name: JOB_NAME + '.sub'}]);

    var mutation = registerMutation();
    mutation.resolve({args: {_id: COLLECTION_ID, deleteRepo: false}});

    assert.assertEquals(2, schedulerMock.__deletedNames().length);
};
