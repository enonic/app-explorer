import type {Brand} from '@enonic-types/core'
import type {
	AnyObject,
	EmptyObject,
	OneOrMore,
} from '/lib/explorer/types/index.d';


import {
	hasOwnProperty,
	isSet,
	//toStr,
} from '@enonic/js-utils';
import {
	// GraphQLBoolean,
	// GraphQLString,
	newSchemaGenerator
	//@ts-ignore
} from '/lib/graphql';


export type GraphQLFields<T> = {
	[P in keyof T] :{
		resolve?: ({
			args,
			context,
			source
		}: {
			args?: object
			context?: object
			source?: object
		}) => T
		type: T[P]
	}
}

type GraphQLArgs<T> = {
	[P in keyof T] :{
		type: T[P]
	}
}

// type List<T extends object> = T & {
// 	'__list__': true
// };


// type ArgumentType =
// 	| typeof GraphQLBoolean
// 	| typeof GraphQLString
//
// type QueryArgs = Record<string, OneOrMore<ArgumentType>>;

type Fields<T extends object = EmptyObject> = GraphQLFields<T>;

type EnumType = Brand<object,'GraphQLEnumType'>;
type InputObjectType = Brand<object,'GraphQLInputObjectType'>;
type InterfaceType<T extends object = object> = Brand<T,'GraphQLInterfaceType'>;
export type ObjectType<T extends object = object> = Brand<T,'GraphQLObjectType'>;
type ScalarType = Brand<string,'GraphQLString'>;
export type UnionType<T extends object = object> = Brand<T,'GraphQLUnionType'>;

type TypeResolver<T extends object> = (object: T) => ObjectType<T>

type UnionTypesItem<T extends object = EmptyObject> = {
	type: UnionType<T>
	typeResolver: TypeResolver<T>
	types: Reference<ObjectType<T>|InterfaceType<T>>[]
}

type UnionTypes<T extends object = EmptyObject> = {
	[name: string]: UnionTypesItem<T>
}

// reference
// Returns a special type that allows an object/interface type to reference a
// type by its key. Necessary for self reference.
export type Reference<
	OI extends ObjectType|InterfaceType
> = Brand<Omit<OI,'__type__'>, 'GraphQLReference'> & {
	'__objectOrInterfaceType__': OI['__type__']
}; // Bascially rebrand, but keep around original brand

interface EnvObject {
	args?: object
	context?: object
	source?: object
}

// type Env<
// 	Args extends object = EmptyObject,
// 	Context extends object = EmptyObject,
// 	Source extends null|object = null
// > = {
// 	args: Args
// 	context?: Context
// 	source?: Source
// }

type FieldResolver<
	Env extends EnvObject,
	ResultGraph = unknown
> = (env: Env) => ResultGraph


export type QueriesItem<
	Args extends object = object,
	Context extends object = object	,
	Source extends object = object,
	//Source extends null|object = null,
	T extends object = object
> = {
	args?: GraphQLArgs<Args>
	resolve: FieldResolver<{
		args?: Args
		context?: Context
		source?: Source
	}, OneOrMore<T>>
	type: OneOrMore<ObjectType<T>|UnionType<T>>
}

type Queries = {
	[name: string]: QueriesItem
}

export class Glue<Context extends object = EmptyObject> {

	// Private fields
	_enumTypes: Record<string,EnumType> = {};
	_fields: Record<string, Fields> = {};
	_inputTypes: Record<string,InputObjectType> = {};
	_inputFields: Record<string, AnyObject> =  {};
	_interfaceTypes: Record<string,{
		fields: Fields
		type: InterfaceType
	}> = {};
	_mutations: Record<string,{
		args: AnyObject
		resolve: FieldResolver
		type: unknown
	}> = {};
	_objectTypes: Record<string, ObjectType> = {};
	_queries: Queries = {};
	_scalarTypes: Record<string,ScalarType> = {};
	_uniqueFieldNames: AnyObject = {}; // mutation and query field names should be unique?
	_uniqueNames: AnyObject = {};
	_unionTypes: UnionTypes = {};

	// Public fields
	schemaGenerator: {
		createEnumType: (params: {
			name: string
			values: string[]
		}) => EnumType,
		createInputObjectType: (params: {
			fields: unknown
			name: string
		}) => InputObjectType
		createInterfaceType: (params: {
			fields: unknown
			name: string
			typeResolver: TypeResolver
		}) => InterfaceType
		createObjectType: <T extends object = EmptyObject>(params: {
			fields: Fields<T>
			interfaces?: InterfaceType[]
			name: string
		}) => ObjectType<T>
		createSchema: (params: {
			mutation: ObjectType
			query: ObjectType
		}) => unknown
		createUnionType: <
			T extends object,
			OI extends ObjectType<T>|InterfaceType<T>
		>(params: {
			name: string
			typeResolver: TypeResolver<T>
			types: Reference<OI>
		}) => UnionType<T>
	};

	constructor() {
		this.schemaGenerator = newSchemaGenerator();
	}

	addEnumType({
		name,
		values
	}: {
		name: string
		values: string[]
	}) {
		//log.debug(`addEnumType({name:${name}})`);
		if(this._enumTypes[name]) {
			throw new Error(`Enum type ${name} already defined!`);
		}
		if(this._uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this._uniqueNames[name]}!`);
		}
		this._uniqueNames[name] = 'enumType';
		this._enumTypes[name] = this.schemaGenerator.createEnumType({
			name,
			values
		});
		return this._enumTypes[name];
	}

	addFields({
		name,
		fields
	}: {
		name: string
		fields: Fields
	}) {
		//log.debug(`addEnumType({name:${name}})`);
		if(this._fields[name]) {
			throw new Error(`Field ${name} already defined!`);
		}
		/*if(this._uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this._uniqueNames[name]}!`);
		}
		this._uniqueNames[name] = 'enumType';*/
		this._fields[name] = fields;
		return fields;
	}

	//──────────────────────────────────────────────────────────────────────────────
	// InputFields
	//──────────────────────────────────────────────────────────────────────────────
	addInputFields<InputFields extends AnyObject = AnyObject>({
		name,
		fields
	}:  {
		name: string
		fields: InputFields
	}) {
		if (isSet(this._inputFields[name])) {
			//log.debug(`InputFields ${name} already added :)`);
			return this._inputFields[name];
			//throw new Error(`InputFields ${name} already added!`);
		}
		this._inputFields[name] = fields;
		return this._inputFields[name];
	}

	getInputFields(name: string) {
		return this._inputFields[name];
	}

	//──────────────────────────────────────────────────────────────────────────────
	// InputType
	//──────────────────────────────────────────────────────────────────────────────

	addInputType({
		fields,
		name
	}: {
		fields: Fields
		name: string
	}) {
		//log.debug(`addInputType({name:${name},fields:${toStr(fields)}})`);
		//log.debug(`addInputType({name:${name}})`);
		if(this._uniqueNames[name] && this._uniqueNames[name] !== 'inputType') {
			throw new Error(`Name ${name} already used as ${this._uniqueNames[name]}!`);
		}
		if(this._inputTypes[name]) {
			// throw new Error(`Input type ${name} already defined!`);
			// log.debug(`Name ${name} already added as ${this._uniqueNames[name]} :)`);
			return this._inputTypes[name];
		}
		this._uniqueNames[name] = 'inputType';
		this._inputTypes[name] = this.schemaGenerator.createInputObjectType({
			fields,
			name
		});
		return this._inputTypes[name];
	}

	addInterfaceType<
		T extends object = EmptyObject
	>({
		fields,
		name,
		typeResolver
	}: {
		fields: GraphQLFields<T>
		name: string
		typeResolver: TypeResolver<T>
	}) {
		//log.debug(`addInterfaceType({name:${name},fields:${toStr(fields)}})`);
		//log.debug(`addInterfaceType({name:${name}})`);
		if(this._interfaceTypes[name]) {
			throw new Error(`Interface type ${name} already defined!`);
		}
		if(this._uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this._uniqueNames[name]}!`);
		}
		this._uniqueNames[name] = 'interfaceType';
		this._interfaceTypes[name] = {
			fields,
			type: this.schemaGenerator.createInterfaceType({
				fields,
				name,
				typeResolver
			})//,
			//typeResolver // NOTE This should be fetched from the unionType instead...
		};
		return this._interfaceTypes[name].type;
	}

	addObjectType<T extends object = EmptyObject>({
		fields,
		interfaces = [],
		name
	}: {
		fields: GraphQLFields<T>
		interfaces?: InterfaceType[]
		name: string
	}) {
		//log.debug(`addObjectType({name:${name},fields:${toStr(fields)})`);
		//log.debug(`addObjectType({name:${name}})`);
		if(this._objectTypes[name]) {
			return this._objectTypes[name];
			// throw new Error(`Object type ${name} already defined!`);
		}
		if(this._uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this._uniqueNames[name]}!`);
		}
		this._uniqueNames[name] = 'objectType';
		this._objectTypes[name] = this.schemaGenerator.createObjectType<T>({
			fields,
			interfaces,
			name
		});
		return this._objectTypes[name] as ObjectType<T>;
	}

	addMutation<Args extends AnyObject = AnyObject>({
		//@ts-ignore
		args = {} as AnyObject,
		name,
		resolve,
		type
	}: {
		args: AnyObject
		name: string
		resolve: FieldResolver<{
			args: Args
		}>
		type: ObjectType
	}) {
		//log.debug(`addEnumType({name:${name}})`);
		if(this._mutations[name]) {
			throw new Error(`Enum type ${name} already defined!`);
		}
		if(this._uniqueFieldNames[name]) {
			throw new Error(`Name ${name} already used as ${this._uniqueFieldNames[name]}!`);
		}
		this._uniqueFieldNames[name] = 'mutation';
		this._mutations[name] = {
			args,
			resolve,
			type
		};
		return this._mutations[name];
	}

	addQuery<
		Args extends object = EmptyObject,
		Source extends null|object = null,
		T extends object = object
	>({
		args,
		name,
		resolve,
		type
	}: {
		args: GraphQLArgs<Args>
		name: string
		resolve: FieldResolver<{
			args: Args,
			context: Context,
			source: Source
		}, OneOrMore<T>>
		type: OneOrMore<ObjectType<T>|UnionType<T>>
	}) {
		//log.debug(`addEnumType({name:${name}})`);
		if(this._queries[name]) {
			return this._queries[name];
			// throw new Error(`Query ${name} already defined!`);
		}
		/*if(this._uniqueFieldNames[name]) {
			throw new Error(`Name ${name} already used as ${this._uniqueFieldNames[name]}!`);
		}
		this._uniqueFieldNames[name] = 'query';*/
		this._queries[name] = {
			args,
			resolve,
			type
		};
		return this._queries[name] as QueriesItem<Args, Context, Source, T>;
	}

	addScalarType({
		name,
		type
	}: {
		name: string
		type: ScalarType
	}) {
		//log.debug(`addScalarType({name:${name}})`);
		if(this._scalarTypes[name]) {
			throw new Error(`Scalar type ${name} already defined!`);
		}
		if(this._uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this._uniqueNames[name]}!`);
		}
		this._uniqueNames[name] = 'scalarType';
		this._scalarTypes[name] = type;
		return this._scalarTypes[name];
	}

	addUnionType<
		T extends object,
		OI extends ObjectType<T>|InterfaceType<T>
	>({
		name,
		typeResolver,
		types = []
	}: {
		name: string
		typeResolver: TypeResolver<T>
		types: (OI|Reference<OI>)[]
	}) {
		//log.debug(`addUnionType({name:${name}})`);
		if(this._unionTypes[name]) {
			throw new Error(`Union type ${name} already defined!`);
		}
		if(this._uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this._uniqueNames[name]}!`);
		}
		this._uniqueNames[name] = 'unionType';
		const type = this.schemaGenerator.createUnionType<T, OI>({
			name,
			typeResolver,
			types
		});
		this._unionTypes[name] = {
			type,
			typeResolver,
			types
		};
		return type;
	}

	getEnumType(name: string) {
		if (!hasOwnProperty(this._enumTypes, name)) { // true also when property is set to undefined
			throw new Error(`enumTypes[${name}] not found! Perhaps you're trying to use it before it's defined?`);
		}
		return this._enumTypes[name];
	}

	getFields(name: string) {
		//log.debug(`getFields(${name})`);
		if (!hasOwnProperty(this._fields, name)) { // true also when property is set to undefined
			/*if (this._uniqueNames[name]) {
				throw new Error(`name:${name} is not an inputType! but ${this._uniqueNames[name]}`);
			}*/
			throw new Error(`fields[${name}] not found! Perhaps you're trying to use it before it's defined?`);
		}
		const fields = this._fields[name];
		if (!fields) {
			throw new Error(`inputType[${name}] is falsy!`);
		}
		//log.debug(`getFields(${name}) --> ${typeof type}`);
		return fields;
	}

	getInputType(name: string) {
		//log.debug(`getInputType(${name})`);
		if (!hasOwnProperty(this._inputTypes, name)) { // true also when property is set to undefined
			if (this._uniqueNames[name]) {
				throw new Error(`name:${name} is not an inputType! but ${this._uniqueNames[name]}`);
			}
			throw new Error(`inputTypes[${name}] not found! Perhaps you're trying to use it before it's defined?`);
		}
		const type = this._inputTypes[name];
		if (!type) {
			throw new Error(`inputType[${name}] is falsy!`);
		}
		//log.debug(`getinputType(${name}) --> ${typeof type}`);
		return type;
	}

	getInterfaceType(name: string) {
		//log.debug(`getInterfaceType(${name})`);
		if (!hasOwnProperty(this._interfaceTypes, name)) { // true also when property is set to undefined
			if (this._uniqueNames[name]) {
				throw new Error(`name:${name} is not an interfaceType! but ${this._uniqueNames[name]}`);
			}
			throw new Error(`name:${name} not found in interfaceTypes, perhaps you're trying to use it before it's defined?`);
		}
		const type = this._interfaceTypes[name].type;
		if (!type) {
			throw new Error(`interfaceType[${name}].type is falsy!`);
		}
		//log.debug(`getInterfaceType(${name}) --> ${typeof type}`);
		return type;
	}

	getInterfaceTypeFields(name: string) {
		//log.debug(`getInterfaceTypeFields(${name})`);
		if (!hasOwnProperty(this._interfaceTypes, name)) { // true also when property is set to undefined
			throw new Error(`interfaceTypes[${name}] not found! Perhaps you're trying to use it before it's defined?`);
		}
		const fields = this._interfaceTypes[name].fields;
		if (!fields) {
			throw new Error(`interfaceTypes[${name}].fields is falsy!`);
		}
		//log.debug(`getInterfaceTypeFields(${name}) --> ${typeof type}`);
		return fields;
	}

	getInterfaceTypeObj(name: string) {
		//log.debug(`getInterfaceTypeObj(${name})`);
		if (!hasOwnProperty(this._interfaceTypes, name)) { // true also when property is set to undefined
			if (this._uniqueNames[name]) {
				throw new Error(`name:${name} is not an interfaceType! but ${this._uniqueNames[name]}`);
			}
			throw new Error(`name:${name} not found in interfaceTypes, perhaps you're trying to use it before it's defined?`);
		}
		const obj = this._interfaceTypes[name];
		if (!obj) {
			throw new Error(`interfaceType[${name}].type is falsy!`);
		}
		//log.debug(`getInterfaceTypeObj(${name}) --> ${typeof type}`);
		return obj;
	}

	getMutations() {
		return this._mutations;
	}

	getQueries() {
		return this._queries;
	}

	getObjectType<T extends object = EmptyObject>(name: string) {
		//log.debug(`getobjectType(${name})`);
		if (!hasOwnProperty(this._objectTypes, name)) { // true also when property is set to undefined
			if (this._uniqueNames[name]) {
				throw new Error(`name:${name} is not an objectType! but ${this._uniqueNames[name]}`);
			}
			throw new Error(`name:${name} not found in objectTypes, perhaps you're trying to use it before it's defined?`);
		}
		const type = this._objectTypes[name];
		if (!type) {
			throw new Error(`objectType name:${name} is falsy!`);
		}
		//log.debug(`getobjectType(${name}) --> ${typeof type}`);
		return type as ObjectType<T>;
	}

	getObjectTypes() {
		return this._objectTypes;
	}

	getScalarType(name: string) {
		//log.debug(`getScalarType(${name})`);
		if (!hasOwnProperty(this._scalarTypes, name)) { // true also when property is set to undefined
			if (this._uniqueNames[name]) {
				throw new Error(`name:${name} is not an scalarType! but ${this._uniqueNames[name]}`);
			}
			throw new Error(`name:${name} not found in scalarTypes, perhaps you're trying to use it before it's defined?`);
		}
		const type = this._scalarTypes[name];
		if (!type) {
			throw new Error(`scalarType name:${name} is falsy!`);
		}
		//log.debug(`getScalarType(${name}) --> ${typeof type}`);
		return type;
	}

	getSortedObjectTypeNames() {
		return Object.keys(this._objectTypes).sort();
	}

	getUnionTypeObj<T extends object = EmptyObject>(name: string) {
		//log.debug(`getUnionTypeObj(${name})`);
		if (!hasOwnProperty(this._unionTypes, name)) { // true also when property is set to undefined
			if (this._uniqueNames[name]) {
				throw new Error(`name:${name} is not a unionType! but ${this._uniqueNames[name]}`);
			}
			throw new Error(`name:${name} not found in unionTypes, perhaps you're trying to use it before it's defined?`);
		}
		const obj = this._unionTypes[name];
		if (!obj) {
			throw new Error(`unionType[${name}].type is falsy!`);
		}
		//log.debug(`getUnionTypeObj(${name}) --> ${typeof type}`);
		return obj as UnionTypesItem<T>;
	}

	getUnionTypes() {
		return this._unionTypes;
	}
} // Glue
