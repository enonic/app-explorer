import {
	COLON_SIGN,
	addQueryFilter//,
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
	createObjectType
} = newSchemaGenerator();


const NT_SCHEMA = `${APP_EXPLORER}${COLON_SIGN}schema`;
const SCHEMA_FOLDER_NAME = 'schema';
const SCHEMA_FOLDER_PATH = `/${SCHEMA_FOLDER_NAME}`;


export const fieldSchemaCreate = {
	args: {
		_name: nonNull(GraphQLString)
	},
	resolve(env) {
		//log.debug(`env:${toStr(env)}`);
		const {
			_name
		} = env.args;
		//log.debug(`_name:${toStr(_name)}`);
		const writeConnection = connect({ principals: [PRINCIPAL_EXPLORER_WRITE] });

		if (!writeConnection.exists(SCHEMA_FOLDER_PATH)) {
			writeConnection.create({
				_name: SCHEMA_FOLDER_NAME,
				_nodeType: NT_FOLDER
			});
		}

		const _parentPath = `/${SCHEMA_FOLDER_NAME}`;
		const _path = `${_parentPath}/${_name}`;
		if (writeConnection.exists(_path)) {
			throw new Error(`A schema with _name:${_name} already exists!`);
		}
		const nodeToBeCreated = {
			_name,
			_nodeType: NT_SCHEMA,
			_parentPath
		};
		//log.debug(`nodeToBeCreated:${toStr(nodeToBeCreated)}`);
		const createdNode = writeConnection.create(nodeToBeCreated);
		//log.debug(`createdNode:${toStr(createdNode)}`);
		return {
			_id: createdNode._id,
			_name: createdNode._name,
			_path: createdNode._path
		};
	}, // resolve
	type: createObjectType({
		name: 'createdSchema',
		fields: {
			_id: { type: nonNull(GraphQLString) },
			_name: { type: nonNull(GraphQLString) },
			_path: { type: nonNull(GraphQLString) }
		}
	})
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
			.map(({_id, _name, _path}) => ({_id, _name, _path}));
		return res;
	}, // resolve
	type: createObjectType({
		name: 'QuerySchema',
		fields: {
			total: { type: nonNull(GraphQLInt) },
			count: { type: nonNull(GraphQLInt) },
			hits: {
				type: list(createObjectType({
					name: 'Schema',
					fields: {
						_id: { type: nonNull(GraphQLString) },
						_name: { type: nonNull(GraphQLString) },
						//_nodeType: { type: nonNull(GraphQLString) },
						_path: { type: nonNull(GraphQLString) }
					}
				}))
			}
		}
	}) // type
}; // fieldSchemaQuery
