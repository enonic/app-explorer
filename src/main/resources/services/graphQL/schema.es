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
	forceArray//,
	//toStr
} from '@enonic/js-utils';
import {
	APP_EXPLORER,
	NT_FOLDER,
	PRINCIPAL_EXPLORER_READ,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {hasValue} from '/lib/explorer/query/hasValue';

import {
	GraphQLInt,
	GraphQLString,
	newSchemaGenerator,
	nonNull,
	list
} from '/lib/graphql';

const {
	createEnumType,
	createInputObjectType,
	createObjectType
} = newSchemaGenerator();


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

const TYPE_NAME = nonNull(GraphQLString);

const FIELDS_PROPERTY = {
	max: { type: nonNull(GraphQLInt) },
	min: { type: nonNull(GraphQLInt) },
	name: { type: TYPE_NAME },
	valueType: { type: nonNull(ENUM_VALUE_TYPES) }
};

const TYPE_SCHEMA_PROPERTIES = createObjectType({
	name: 'SchemaProperties',
	fields: FIELDS_PROPERTY
});

const TYPE_SCHEMA = createObjectType({
	name: 'Schema',
	fields: {
		_id: { type: nonNull(GraphQLString) },
		_name: { type: TYPE_NAME },
		//_nodeType: { type: nonNull(GraphQLString) },
		_path: { type: nonNull(GraphQLString) },
		properties: { type: list(TYPE_SCHEMA_PROPERTIES)}
	}
});

const NT_SCHEMA = `${APP_EXPLORER}${COLON_SIGN}schema`;
const NAME_SCHEMA_FOLDER = 'schema';
const PATH_SCHEMA_FOLDER = `/${NAME_SCHEMA_FOLDER}`;


export const fieldSchemaCreate = {
	args: {
		_name: nonNull(GraphQLString),
		properties: list(createInputObjectType({
			name: 'InputSchemaProperties',
			fields: FIELDS_PROPERTY
		}))
	},
	resolve(env) {
		//log.debug(`env:${toStr(env)}`);
		const {
			_name,
			properties = []
		} = env.args;
		//log.debug(`_name:${toStr(_name)}`);
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
			properties // No point in forceArray, since Enonic will "destroy" on store.
		};
		//log.debug(`nodeToBeCreated:${toStr(nodeToBeCreated)}`);
		const createdNode = writeConnection.create(nodeToBeCreated);
		//log.debug(`createdNode:${toStr(createdNode)}`);
		return {
			_id: createdNode._id,
			_name: createdNode._name,
			_path: createdNode._path,
			properties: forceArray(createdNode.properties) // GraphQL Schema doesn't ensure array
		};
	}, // resolve
	type: TYPE_SCHEMA
}; // fieldSchemaCreate


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
			.map(({_id, _name, _path, properties}) =>
				({
					_id,
					_name,
					_path,
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
