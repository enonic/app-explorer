import type {AnyObject} from '/lib/explorer/types/index.d';

import {
	hasOwnProperty//,
	//toStr
} from '@enonic/js-utils';

import {
	newSchemaGenerator
	//@ts-ignore
} from '/lib/graphql';

type Fields = AnyObject;

type EnumType = AnyObject;
type InputObjectType = AnyObject;
type InterfaceType = AnyObject;
type ObjectType = AnyObject;
type ScalarType = AnyObject;

type FieldResolver = <
	Env extends AnyObject = AnyObject,
	ResultGraph = unknown
>(env :Env) => ResultGraph

type TypeResolver = () => ObjectType

export class Glue {

	// Private fields
	_enumTypes :Record<string,EnumType> = {};
	_fields :Record<string,Fields> = {};
	_inputTypes :Record<string,InputObjectType> = {};
	_interfaceTypes :Record<string,{
		fields :unknown
		type :InterfaceType
	}> = {};
	_mutations :Record<string,{
		args :AnyObject
		resolve :FieldResolver
		type :unknown
	}> = {};
	_objectTypes :Record<string,ObjectType> = {};
	_queries :Record<string,{
		args :AnyObject
		resolve :FieldResolver
		type :unknown
	}> = {};
	_scalarTypes :Record<string,ScalarType> = {};
	_uniqueFieldNames :AnyObject = {}; // mutation and query field names should be unique?
	_uniqueNames :AnyObject = {};
	_unionTypes :AnyObject = {};

	// Public fields
	schemaGenerator :{
		createEnumType :(params :{
			name :string
			values :Array<string>
		}) => EnumType,
		createInputObjectType :(params :{
			fields :unknown
			name :string
		}) => InputObjectType
		createInterfaceType :(params :{
			fields :unknown
			name :string
			typeResolver :TypeResolver
		}) => InterfaceType
		createObjectType :(params :{
			fields :AnyObject
			interfaces ?:Array<unknown>
			name :string
		}) => ObjectType
		createSchema :(params :{
			mutation :ObjectType
			query :ObjectType
		}) => unknown
		createUnionType :(params :{
			name :string
			typeResolver :TypeResolver
			types :Array<unknown>
		}) => unknown
	};

	constructor() {
		this.schemaGenerator = newSchemaGenerator();
	}

	addEnumType({
		name,
		values
	} :{
		name :string
		values :Array<string>
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
	} :{
		name :string
		fields :Fields
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

	addInputType({
		fields,
		name
	} :{
		fields :Fields
		name :string
	}) {
		//log.debug(`addInputType({name:${name},fields:${toStr(fields)}})`);
		//log.debug(`addInputType({name:${name}})`);
		if(this._inputTypes[name]) {
			throw new Error(`Input type ${name} already defined!`);
		}
		if(this._uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this._uniqueNames[name]}!`);
		}
		this._uniqueNames[name] = 'inputType';
		this._inputTypes[name] = this.schemaGenerator.createInputObjectType({
			fields,
			name
		});
		return this._inputTypes[name];
	}

	addInterfaceType({
		fields,
		name,
		typeResolver
	} :{
		fields :Fields
		name :string
		typeResolver :TypeResolver
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

	addObjectType({
		fields,
		interfaces = [],
		name
	} :{
		fields :Fields
		interfaces :Array<unknown>
		name :string
	}) {
		//log.debug(`addObjectType({name:${name},fields:${toStr(fields)})`);
		//log.debug(`addObjectType({name:${name}})`);
		if(this._objectTypes[name]) {
			throw new Error(`Object type ${name} already defined!`);
		}
		if(this._uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this._uniqueNames[name]}!`);
		}
		this._uniqueNames[name] = 'objectType';
		this._objectTypes[name] = this.schemaGenerator.createObjectType({
			fields,
			interfaces,
			name
		});
		return this._objectTypes[name];
	}

	addMutation({
		args = {},
		name,
		resolve,
		type
	} :{
		args :AnyObject
		name :string
		resolve :FieldResolver
		type :ObjectType
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

	addQuery({
		args = {},
		name,
		resolve,
		type
	} :{
		args :AnyObject
		name :string
		resolve :FieldResolver
		type :ObjectType
	}) {
		//log.debug(`addEnumType({name:${name}})`);
		if(this._queries[name]) {
			throw new Error(`Query ${name} already defined!`);
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
		return this._queries[name];
	}

	addScalarType({
		name,
		type
	} :{
		name :string
		type :ScalarType
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

	addUnionType({
		name,
		typeResolver,
		types = []
	} :{
		name :string
		typeResolver :TypeResolver
		types :Array<unknown>
	}) {
		//log.debug(`addUnionType({name:${name}})`);
		if(this._unionTypes[name]) {
			throw new Error(`Union type ${name} already defined!`);
		}
		if(this._uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this._uniqueNames[name]}!`);
		}
		this._uniqueNames[name] = 'unionType';
		this._unionTypes[name] = {
			type: this.schemaGenerator.createUnionType({
				name,
				typeResolver,
				types
			}),
			typeResolver,
			types
		};
		return this._unionTypes[name];
	}

	getFields(name :string) {
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

	getInputType(name :string) {
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

	getInterfaceType(name :string) {
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

	getInterfaceTypeFields(name :string) {
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

	getInterfaceTypeObj(name :string) {
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

	getObjectType(name :string) {
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
		return type;
	}

	getObjectTypes() {
		return this._objectTypes;
	}

	getScalarType(name :string) {
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

	getUnionTypeObj(name :string) {
		//log.debug(`getUnionTypeObj(${name})`);
		if (!hasOwnProperty(this._unionTypes, name)) { // true also when property is set to undefined
			if (this._uniqueNames[name]) {
				throw new Error(`name:${name} is not an unionType! but ${this._uniqueNames[name]}`);
			}
			throw new Error(`name:${name} not found in unionTypes, perhaps you're trying to use it before it's defined?`);
		}
		const obj = this._unionTypes[name];
		if (!obj) {
			throw new Error(`unionType[${name}].type is falsy!`);
		}
		//log.debug(`getUnionTypeObj(${name}) --> ${typeof type}`);
		return obj;
	}

	getUnionTypes() {
		return this._unionTypes;
	}
} // Glue
