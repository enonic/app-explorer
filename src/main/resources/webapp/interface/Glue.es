import hasOwn from 'object.hasown';

import {GQL_OBJECT_TYPE_QUERY} from './constants';


if (!Object.hasOwn) {
	hasOwn.shim();
}


/*

Goals:
 1. GraphQL type names must be unique
 2. Avoid unused names?
 3. Easy access to all types

*/


function addEnumType({
	name,
	values
}) {
	//log.debug(`addEnumType({ name: ${name} })`);
	if(this.uniqueNames[name]) {
		throw new Error(`Name ${name} already used as ${this.uniqueNames[name]}!`);
	}
	this.uniqueNames[name] = 'enumType';
	this.enumTypes[name] = this.schemaGenerator.createEnumType({
		name,
		values
	});
	return this.enumTypes[name];
}


function getEnumType(name) {
	return this.enumTypes[name];
}


function addInputFields({
	_name,
	...rest
}) {
	if (this.inputFields[_name]) {
		throw new Error(`InputFields ${_name} already added!`);
	}
	this.inputFields[_name] = rest;
	return this.inputFields[_name];
}

function getInputFields(name) {
	return this.inputFields[name];
}


function addInputType({
	fields,
	name
}) {
	//log.debug(`addInputType({ name: ${name} })`);
	if(this.uniqueNames[name]) {
		throw new Error(`Name ${name} already used as ${this.uniqueNames[name]}!`);
	}
	this.uniqueNames[name] = 'inputType';
	this.inputTypes[name] = this.schemaGenerator.createInputObjectType({
		fields,
		name
	});
	return this.inputTypes[name];
}

function getInputType(name) {
	return this.inputTypes[name];
}


function addObjectType({
	fields,
	interfaces = [],
	name
}) {
	//log.debug(`addObjectType({ name: ${name} })`);
	if(this.uniqueNames[name]) {
		throw new Error(`Name ${name} already used as ${this.uniqueNames[name]}!`);
	}
	this.uniqueNames[name] = 'objectType';
	this.objectTypes[name] = {
		interfaces,
		type: this.schemaGenerator.createObjectType({
			fields,
			interfaces,
			name
		})
	};
	return this.objectTypes[name].type;
}

function getObjectType(name) {
	return this.objectTypes[name].type;
}


function addUnionType({
	name,
	typeResolver,
	types = []
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

function getUnionType(name) {
	if (!Object.hasOwn(this.unionTypes, name)) { // true also when property is set to undefined
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


function addInterfaceType({
	fields,
	name,
	typeResolver
}) {
	if(this.uniqueNames[name]) {
		throw new Error(`Name ${name} already used as ${this.uniqueNames[name]}!`);
	}
	this.uniqueNames[name] = 'interfaceType';
	this.interfaceTypes[name] = {
		fields,
		type: this.schemaGenerator.createInterfaceType({
			fields,
			name,
			typeResolver
		})//,
		//typeResolver // NOTE This should be fetched from the unionType instead...
	};
	return this.interfaceTypes[name].type;
}

function getInterfaceType(name) {
	return this.interfaceTypes[name].type;
}

function getInterfaceTypeFields(name) {
	return this.interfaceTypes[name].fields;
}

function getInterfaceTypeObject(name) {
	return this.interfaceTypes[name];
}


function addQueryField({
	args = {},
	name,
	resolve,// = () => {},
	type
}) {
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
	/*
	 GIVEN that an objectType that implements an interface
	 AND that objectType is NOT directly added/available in the schema
	 WHEN a query result includes the interfaceType
	 THEN GraphQL will throw an error that the objectType is not a valid type

	 This happens because the interfaceType.typeResolver() returns an objectType
	 that doesn't exist in the schema.
	 Simply adding the objectType to the dictionary, solves the problem.
	*/
	const uniqObjectTypesWithInterfaces = [];
	Object.keys(this.objectTypes).forEach((k) => {
		if (
			this.objectTypes[k].interfaces
			&& Array.isArray(this.objectTypes[k].interfaces)
			&& this.objectTypes[k].interfaces.length
		) {
			let alreadyAdded = false;
			uniqObjectTypesWithInterfaces.forEach((obj) => {
				if (obj === this.objectTypes[k].type) {
					alreadyAdded = true; // TODO Break
				}
			});
			if (!alreadyAdded) {
				uniqObjectTypesWithInterfaces.push(this.objectTypes[k].type);
			}
		}
	});
	//log.debug(`Number of objectTypes:${Object.keys(this.objectTypes).length} Number of objectTypes implementing interfaces:${uniqObjectTypesWithInterfaces.length}`);

	return this.schemaGenerator.createSchema({
		//dictionary: Object.keys(this.objectTypes).map((k) => this.objectTypes[k].type), // No need to add all objectTypes...
		dictionary: uniqObjectTypesWithInterfaces,

		//mutation:,
		query: this.addObjectType({
			name: GQL_OBJECT_TYPE_QUERY,
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
		getUnionType, // function
		//getUnionTypeResolver, // function
		inputFields: {},
		inputTypes: {},
		interfaceTypes: {},
		objectTypes: {},
		queryFields: {},
		schemaGenerator,
		unionTypes: {},
		uniqueNames: {}
	};
}
