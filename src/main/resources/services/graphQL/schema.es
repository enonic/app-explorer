import {
	COLON_SIGN,
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_SET,
	VALUE_TYPE_STRING,
	addQueryFilter,
	enonify,
	forceArray,
	toStr
} from '@enonic/js-utils';
//import {detailedDiff} from 'deep-object-diff';
import deepEqual from 'fast-deep-equal';
import HumanDiff from 'human-object-diff';

import {
	APP_EXPLORER,
	NT_COLLECTION,
	NT_FOLDER,
	PRINCIPAL_EXPLORER_READ,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {hasValue} from '/lib/explorer/query/hasValue';

import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString,
	newSchemaGenerator,
	nonNull,
	list
} from '/lib/graphql';

import {reindexCollections} from './collection/reindexCollections';

import {getSchema} from './schema/getSchema';

//const Diff = require('diff');

const {
	createEnumType,
	createInputObjectType,
	createObjectType
} = newSchemaGenerator();

const { diff: diffSchemaProperties } = new HumanDiff({
	objectName: 'schemaProperties'
});

const ENUM_VALUE_TYPES = createEnumType({
	name: 'EnumValueTypes',
	values: [
		VALUE_TYPE_BOOLEAN,
		VALUE_TYPE_DOUBLE,
		VALUE_TYPE_GEO_POINT,
		VALUE_TYPE_INSTANT,
		VALUE_TYPE_LOCAL_DATE,
		VALUE_TYPE_LOCAL_DATE_TIME,
		VALUE_TYPE_LOCAL_TIME,
		VALUE_TYPE_LONG,
		VALUE_TYPE_SET,
		VALUE_TYPE_STRING
	]
});

const TYPE_ID = nonNull(GraphQLString);
const TYPE_NAME = nonNull(GraphQLString);

const FIELDS_PROPERTY = {
	enabled: { type: nonNull(GraphQLBoolean) },
	fulltext: { type: nonNull(GraphQLBoolean) },
	includeInAllText: { type: nonNull(GraphQLBoolean) },
	max: { type: nonNull(GraphQLInt) },
	min: { type: nonNull(GraphQLInt) },
	ngram: { type: nonNull(GraphQLBoolean) },
	name: { type: TYPE_NAME },
	valueType: { type: nonNull(ENUM_VALUE_TYPES) }
};

const INPUT_TYPE_SCHEMA_PROPERTIES = createInputObjectType({
	name: 'InputSchemaProperties',
	fields: FIELDS_PROPERTY
});

const TYPE_SCHEMA_PROPERTIES = createObjectType({
	name: 'SchemaProperties',
	fields: FIELDS_PROPERTY
});

const TYPE_SCHEMA = createObjectType({
	name: 'Schema',
	fields: {
		_id: { type: TYPE_ID },
		_name: { type: TYPE_NAME },
		_path: { type: nonNull(GraphQLString) },
		_versionKey: { type: nonNull(GraphQLString) }, // Used with atomicUpdate
		properties: { type: list(TYPE_SCHEMA_PROPERTIES)}
	}
});

const TYPE_SCHEMA_CREATE = createObjectType({
	name: 'SchemaCreate',
	fields: {
		_id: { type: TYPE_ID },
		_name: { type: TYPE_NAME },
		_path: { type: nonNull(GraphQLString) },
		properties: { type: list(TYPE_SCHEMA_PROPERTIES)}
	}
});

const NT_SCHEMA = `${APP_EXPLORER}${COLON_SIGN}schema`;
const NAME_SCHEMA_FOLDER = 'schema';
const PATH_SCHEMA_FOLDER = `/${NAME_SCHEMA_FOLDER}`;


export const fieldSchemaCreate = {
	args: {
		_name: TYPE_NAME,
		properties: list(INPUT_TYPE_SCHEMA_PROPERTIES)
	},
	resolve({
		args: {
			_name,
			properties = []
		}
	}) {
		const writeConnection = connect({ principals: [PRINCIPAL_EXPLORER_WRITE] });
		if (!writeConnection.exists(PATH_SCHEMA_FOLDER)) {
			writeConnection.create({
				_name: NAME_SCHEMA_FOLDER,
				_nodeType: NT_FOLDER
			});
		}
		const _parentPath = `/${NAME_SCHEMA_FOLDER}`;
		const _path = `${_parentPath}/${_name}`;
		if (writeConnection.exists(_path)) {
			throw new Error(`A schema with _name:${_name} already exists!`);
		}
		const nodeToBeCreated = {
			_name,
			_nodeType: NT_SCHEMA,
			_parentPath,

			// No point in forceArray, since Enonic will "destroy" on store,
			// but we're using forceArray so sort don't throw...
			properties: forceArray(properties).sort((a, b) => (a.name > b.name) ? 1 : -1)
		};
		const createdNode = writeConnection.create(nodeToBeCreated);
		return {
			_id: createdNode._id,
			_name: createdNode._name,
			_path: createdNode._path,
			properties: forceArray(createdNode.properties) // GraphQL Schema doesn't ensure array
		};
	}, // resolve
	type: TYPE_SCHEMA_CREATE
}; // fieldSchemaCreate


export const fieldSchemaDelete = {
	args: {
		_id: TYPE_ID
	},
	resolve({
		args: {
			_id
		}
	}) {
		const writeConnection = connect({ principals: [PRINCIPAL_EXPLORER_WRITE] });
		const array = writeConnection.delete(_id);
		if (!array.length === 1 ) {
			throw new Error(`Something went wrong while trying to delete schema with id:${_id}!`);
		}
		return {
			_id: array[0]
		};
	},
	type: createObjectType({
		name: 'DeletedSchema',
		fields: {
			_id: { type: TYPE_ID }
		}
	})
}; // fieldSchemaDelete


export const fieldSchemaGet = {
	args: {
		_id: TYPE_ID
	},
	resolve: ({
		args: {
			_id
		}
	}) => getSchema({_id}),
	type: TYPE_SCHEMA
}; // fieldSchemaGet


export const fieldSchemaQuery = {
	resolve: () => {
		const readConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
		const res = readConnection.query({
			count: -1,
			filters: addQueryFilter({
				filter: hasValue('_nodeType', [NT_SCHEMA])
			}),
			query: ''
		});
		//log.debug(`res:${toStr(res)}`);
		res.hits = res.hits
			.map(({id}) => readConnection.get(id))
			.map(({_id, _name, _path, _versionKey, properties}) =>
				({
					_id,
					_name,
					_path,
					_versionKey,
					properties: forceArray(properties) // GraphQL Schema doesn't ensure array
				}));
		return res;
	}, // resolve
	type: createObjectType({
		name: 'QuerySchema',
		fields: {
			total: { type: nonNull(GraphQLInt) },
			count: { type: nonNull(GraphQLInt) },
			hits: {
				type: list(TYPE_SCHEMA)
			}
		}
	}) // type
}; // fieldSchemaQuery


export const fieldSchemaUpdate = {
	args: {
		_id: TYPE_ID,
		_name: TYPE_NAME,
		_versionKey: GraphQLString,
		properties: list(INPUT_TYPE_SCHEMA_PROPERTIES)
	},
	resolve({
		args: {
			_id: schemaId,
			_name: newSchemaName,
			_versionKey,
			properties = []
		}
	}) {
		const writeConnection = connect({ principals: [PRINCIPAL_EXPLORER_WRITE] });
		const oldNode = writeConnection.get(schemaId);
		if (!oldNode) {
			throw new Error(`Could not find schema with id:${schemaId}!`);
		}
		log.debug(`schemaId:${schemaId} newSchemaName:${newSchemaName} _versionKey:${_versionKey} activeVersionKey:${oldNode._versionKey}`);
		if (_versionKey !== oldNode._versionKey) {
			const msg = `Denying update! Schema changed since _versionKey:${_versionKey} activeVersionKey:${oldNode._versionKey} schemaId:${schemaId}`;
			log.error(msg);
			throw new Error(msg);
		}
		const {
			_name: oldName
		} = oldNode;
		if (newSchemaName !== oldName) {
			//log.debug(`Trying to move/rename _id:${_id} from oldName:${oldName} to name:${_name}...`);
			const boolMovedorRenamed = writeConnection.move({

				// Path or id of the node to be moved or renamed
				source: schemaId,

				// New path or name for the node. If the target ends in slash '/',
				// it specifies the parent path where to be moved.
				// Otherwise it means the new desired path or name for the node.
				target: newSchemaName

			}); // NOTE: Will throw if _path already occupied :)
			if (boolMovedorRenamed) {
				log.debug(`Moved/renamed id:${schemaId} from oldName:${oldName} to name:${newSchemaName}`);
				writeConnection.refresh();
			} else {
				throw new Error(`Something went wrong when trying to move/rename id:${schemaId} from oldName:${oldName} to name:${newSchemaName}`);
			}
		}
		// No point in forceArray, since Enonic will "destroy" on store,
		// but we're using forceArray so sort don't throw...
		properties = forceArray(properties).sort((a, b) => (a.name > b.name) ? 1 : -1);
		const enonifiedProperties = enonify(properties);
		if (!deepEqual(oldNode.properties, enonifiedProperties)) {
			//log.debug(`Changes detected diff:${toStr(detailedDiff(oldNode.properties, enonifiedProperties))}`); // Too narrow
			//log.debug(`Changes detected diff:${toStr(Diff.diffJson(oldNode.properties, enonifiedProperties))}`); // Too noisy

			// Pretty good. (can crash on complicated data, perhaps circular structures, which we shouldn't have anyway)
			log.debug(`Changes detected diff:${toStr(diffSchemaProperties(oldNode.properties, enonifiedProperties))}`);

			const updatedNode = writeConnection.modify({
				key: schemaId,
				editor: (schemaNode) => {
					schemaNode.properties = properties;
					return schemaNode;
				}
			});
			writeConnection.refresh();

			const collectionsUsingSchemaQueryParams = {
				count: -1,
				filters: addQueryFilter({
					filter: hasValue('_nodeType', [NT_COLLECTION]),
					filters: addQueryFilter({
						filter: hasValue('schemaId', [schemaId])
					})
				}),
				query: ''
			};
			//log.debug(`collectionsUsingSchemaQueryParams:${toStr(collectionsUsingSchemaQueryParams)}`);

			const collectionIds = writeConnection.query(collectionsUsingSchemaQueryParams).hits.map(({id})=>id);
			log.debug(`collectionIds:${toStr(collectionIds)}`);

			reindexCollections({collectionIds});

			return updatedNode;
		} // if schema changed
		log.debug('No changes detected.');
		return oldNode;
	},
	type: TYPE_SCHEMA
}; // fieldSchemaUpdate
