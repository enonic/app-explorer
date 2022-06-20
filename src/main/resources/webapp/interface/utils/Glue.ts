import type {AnyObject} from '/lib/explorer/types/index.d';
import type {GraphQL} from '../index.d';
import type {
	FieldResolver,
	Fields,
	GraphQLObjectType,
	Interfaces,
	TypeResolver,
	Types
} from './index.d';


import {hasOwnProperty} from '@enonic/js-utils';


/*

Goals:
 1. GraphQL type names must be unique
 2. Avoid unused names?
 3. Easy access to all types

*/
//──────────────────────────────────────────────────────────────────────────────
// EnumType
//──────────────────────────────────────────────────────────────────────────────
function addEnumType({
	description,
	name,
	values
} :{
	description ?:string
	name :string
	values :GraphQL.EnumValues
}) :GraphQL.EnumType {
	//log.debug(`addEnumType({ name: ${name} })`);
	if(this.uniqueNames[name]) {
		throw new Error(`Name ${name} already used as ${this.uniqueNames[name]}!`);
	}
	this.uniqueNames[name] = 'enumType';
	this.enumTypes[name] = this.schemaGenerator.createEnumType({
		description,
		name,
		values
	});
	return this.enumTypes[name];
}


function getEnumType(name :string) :GraphQL.EnumType {
	return this.enumTypes[name];
}

//──────────────────────────────────────────────────────────────────────────────
// InputFields
//──────────────────────────────────────────────────────────────────────────────
function addInputFields<InputFields extends AnyObject = AnyObject>({
	name,
	fields
} : {
	name :string
	fields :InputFields
}) {
	if (this.inputFields[name]) {
		throw new Error(`InputFields ${name} already added!`);
	}
	this.inputFields[name] = fields;
	return this.inputFields[name];
}

function getInputFields(name :string) {
	return this.inputFields[name];
}

//──────────────────────────────────────────────────────────────────────────────
// InputType
//──────────────────────────────────────────────────────────────────────────────
function addInputType({
	description,
	fields,
	name
} :{
	description ?:string
	fields :Fields
	name :string
}) {
	//log.debug(`addInputType({ name: ${name} })`);
	if(this.uniqueNames[name]) {
		throw new Error(`Name ${name} already used as ${this.uniqueNames[name]}!`);
	}
	this.uniqueNames[name] = 'inputType';
	this.inputTypes[name] = this.schemaGenerator.createInputObjectType({
		description,
		fields,
		name
	});
	return this.inputTypes[name];
}

function getInputType(name :string) {
	return this.inputTypes[name];
}

//──────────────────────────────────────────────────────────────────────────────
// ObjectType
//──────────────────────────────────────────────────────────────────────────────
function addObjectType({
	description,
	fields,
	interfaces = [],
	name
} : {
	description ?:string
	fields :Fields
	interfaces ?:Interfaces
	name :string
}) {
	//log.debug('Glue addObjectType({ name: %s })', name);
	if(this.objectTypes[name]) {
		//log.debug('objectType "%s" already added, returning previous', name);
		return this.objectTypes[name].type;
	}
	if(this.uniqueNames[name]) {
		throw new Error(`Name ${name} already used as ${this.uniqueNames[name]}!`);
	}
	this.uniqueNames[name] = 'objectType';
	this.objectTypes[name] = {
		interfaces,
		type: this.schemaGenerator.createObjectType({
			description,
			fields,
			interfaces,
			name
		})
	};
	return this.objectTypes[name].type;
}

function getObjectType(name :string) {
	return this.objectTypes[name].type;
}

//──────────────────────────────────────────────────────────────────────────────
// OutputFields
//──────────────────────────────────────────────────────────────────────────────
function addOutputFields<OutputFields extends AnyObject = AnyObject>({
	name,
	fields
} : {
	name :string
	fields :OutputFields
}) {
	if (this.outputFields[name]) {
		//throw new Error(`OutputFields ${name} already added!`);
		//log.error('OutputFields "%s" already added, returning previous', name)
		return this.outputFields[name];
	}
	this.outputFields[name] = fields;
	return this.outputFields[name];
}

function getOutputFields(name :string) {
	return this.outputFields[name];
}

//──────────────────────────────────────────────────────────────────────────────
// UnionType
//──────────────────────────────────────────────────────────────────────────────
function addUnionType({
	name,
	typeResolver,
	types
} :{
	name :string
	typeResolver :TypeResolver
	types :Types
}) {
	//log.debug(`addUnionType({ name: ${name} })`);
	if(this.uniqueNames[name]) {
		throw new Error(`Name ${name} already used as ${this.uniqueNames[name]}!`);
	}
	this.uniqueNames[name] = 'unionType';
	this.unionTypes[name] = {
		type: this.schemaGenerator.createUnionType({
			name,
			typeResolver,
			types
		}),
		typeResolver,
		types
	};
	return this.unionTypes[name].type;
}

function getUnionType(name :string) {
	if (!hasOwnProperty(this.unionTypes, name)) { // true also when property is set to undefined
		if (this.uniqueNames[name]) {
			throw new Error(`name:${name} is not an unionType! but ${this.uniqueNames[name]}`);
		}
		throw new Error(`name:${name} not found in unionTypes, perhaps you're trying to use it before it's defined?`);
	}
	return this.unionTypes[name].type;
}

/*function getUnionTypeResolver(name) {
	return this.unionTypes[name].typeResolver;
}*/

//──────────────────────────────────────────────────────────────────────────────
// InterfaceType
//──────────────────────────────────────────────────────────────────────────────
function addInterfaceType<Node extends AnyObject = AnyObject>({
	description,
	fields,
	name,
	typeResolver
} : {
	description ?:string
	fields :Fields
	name :string
	typeResolver :TypeResolver<Node>
}) {
	if(this.interfaceTypes[name]) {
		//log.debug('interfaceType "%s" already added, returning previous', name);
		return this.interfaceTypes[name].type;
	}
	if(this.uniqueNames[name]) {
		throw new Error(`Name ${name} already used as ${this.uniqueNames[name]}!`);
	}
	this.uniqueNames[name] = 'interfaceType';
	this.interfaceTypes[name] = {
		fields,
		type: this.schemaGenerator.createInterfaceType({
			description,
			fields,
			name,
			typeResolver
		})//,
		//typeResolver // NOTE This should be fetched from the unionType instead...
	};
	return this.interfaceTypes[name].type;
}

function getInterfaceType(name :string) {
	return this.interfaceTypes[name].type;
}

function getInterfaceTypeFields(name :string) {
	return this.interfaceTypes[name].fields;
}

function getInterfaceTypeObject(name :string) {
	return this.interfaceTypes[name];
}

//──────────────────────────────────────────────────────────────────────────────
// QueryField
//──────────────────────────────────────────────────────────────────────────────
function addQueryField<
	Env extends AnyObject = AnyObject,
	ResultGraph extends AnyObject = AnyObject
>({
	args = {},
	name,
	resolve,// = () => {},
	type
} : {
	args ?:AnyObject
	name :string
	resolve :FieldResolver<Env, ResultGraph>
	type :GraphQLObjectType
}) {
	//log.debug('Glue addQueryField({ name: %s })', name);
	if(this.queryFields[name]) {
		throw new Error(`Name ${name} already added!`);
	}
	this.queryFields[name] = {
		args,
		resolve,
		type
	};
	return this.queryFields[name];
}


function buildSchema() {
	//log.debug('Glue buildSchema');
	/*
	 GIVEN that an objectType that implements an interface
	 AND that objectType is NOT directly added/available in the schema
	 WHEN a query result includes the interfaceType
	 THEN GraphQL will throw an error that the objectType is not a valid type

	 This happens because the interfaceType.typeResolver() returns an objectType
	 that doesn't exist in the schema.
	 Simply adding the objectType to the dictionary, solves the problem.
	*/
	const objectTypesWithInterfaces = [];
	const objectTypeNames = Object.keys(this.objectTypes);
	//log.debug('objectTypeNames:%s', objectTypeNames);

	for (let i = 0; i < objectTypeNames.length; i++) {
		const objectTypeName = objectTypeNames[i];
		if (
			this.objectTypes[objectTypeName].interfaces
			&& Array.isArray(this.objectTypes[objectTypeName].interfaces)
			&& this.objectTypes[objectTypeName].interfaces.length
		) {
			//log.debug('Glue objectTypeName:%s has interfaces', objectTypeName);
			objectTypesWithInterfaces.push(this.objectTypes[objectTypeName].type);
		}
	} // for objectTypeNames
	//log.debug(`Number of objectTypes:${Object.keys(this.objectTypes).length} Number of objectTypes implementing interfaces:${objectTypesWithInterfaces.length}`);

	//log.debug('queryFields:%s', Object.keys(this.queryFields));
	return this.schemaGenerator.createSchema({
		//dictionary: Object.keys(this.objectTypes).map((k) => this.objectTypes[k].type), // No need to add all objectTypes...
		dictionary: objectTypesWithInterfaces,

		//mutation:,
		query: this.addObjectType({
			name: 'Query',
			fields: this.queryFields
		})//,
		//subscription:
	});
}


export function constructGlue({
	schemaGenerator
}) {
	return {
		addEnumType, // function
		addInputFields, // function
		addInputType, // function
		addInterfaceType, // function
		addObjectType, // function
		addOutputFields, // function
		addQueryField, // function
		addUnionType, // function
		buildSchema, // function
		enumTypes: {},
		getEnumType, // function
		getInputFields, // function
		getInputType, // function
		getInterfaceType, // function
		getInterfaceTypeFields, // function
		getInterfaceTypeObject, // function
		getObjectType, // function
		getOutputFields, // function
		getUnionType, // function
		//getUnionTypeResolver, // function
		inputFields: {},
		inputTypes: {},
		interfaceTypes: {},
		objectTypes: {},
		outputFields: {},
		queryFields: {},
		schemaGenerator,
		unionTypes: {},
		uniqueNames: {}
	};
}

export type Glue = ReturnType<typeof constructGlue>;
