//import {toStr} from '@enonic/js-utils';
import hasOwn from 'object.hasown';

import {
	newSchemaGenerator
} from '/lib/graphql';

if (!Object.hasOwn) {
	hasOwn.shim();
}

export class Glue {

	// Private fields
	#uniqueNames = {};
	#enumTypes = {};
	#inputTypes = {};
	#interfaceTypes = {};
	#objectTypes = {};
	#scalarTypes = {};

	// Public fields
	schemaGenerator;

	constructor() {
		this.schemaGenerator = newSchemaGenerator();
	}

	addEnumType({
		name,
		values
	}) {
		//log.debug(`addEnumType({name:${name}})`);
		if(this.#enumTypes[name]) {
			throw new Error(`Enum type ${name} already defined!`);
		}
		if(this.#uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this.#uniqueNames[name]}!`);
		}
		this.#uniqueNames[name] = 'enumType';
		this.#enumTypes[name] = this.schemaGenerator.createEnumType({
			name,
			values
		});
		return this.#enumTypes[name];
	}

	addInputType({
		fields,
		name
	}) {
		//log.debug(`addInputType({name:${name},fields:${toStr(fields)}})`);
		//log.debug(`addInputType({name:${name}})`);
		if(this.#inputTypes[name]) {
			throw new Error(`Input type ${name} already defined!`);
		}
		if(this.#uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this.#uniqueNames[name]}!`);
		}
		this.#uniqueNames[name] = 'inputType';
		this.#inputTypes[name] = this.schemaGenerator.createInputObjectType({
			fields,
			name
		});
		return this.#inputTypes[name];
	}

	addInterfaceType({
		fields,
		name,
		typeResolver
	}) {
		//log.debug(`addInterfaceType({name:${name},fields:${toStr(fields)}})`);
		//log.debug(`addInterfaceType({name:${name}})`);
		if(this.#interfaceTypes[name]) {
			throw new Error(`Interface type ${name} already defined!`);
		}
		if(this.#uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this.#uniqueNames[name]}!`);
		}
		this.#uniqueNames[name] = 'interfaceType';
		this.#interfaceTypes[name] = this.schemaGenerator.createInterfaceType({
			fields,
			name,
			typeResolver
		});
		return this.#interfaceTypes[name];
	}

	addObjectType({
		fields,
		name
	}) {
		//log.debug(`addObjectType({name:${name},fields:${toStr(fields)})`);
		//log.debug(`addObjectType({name:${name}})`);
		if(this.#objectTypes[name]) {
			throw new Error(`Object type ${name} already defined!`);
		}
		if(this.#uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this.#uniqueNames[name]}!`);
		}
		this.#uniqueNames[name] = 'objectType';
		this.#objectTypes[name] = this.schemaGenerator.createObjectType({
			fields,
			name
		});
		return this.#objectTypes[name];
	}

	addScalarType({
		name,
		type
	}) {
		//log.debug(`addScalarType({name:${name}})`);
		if(this.#scalarTypes[name]) {
			throw new Error(`Scalar type ${name} already defined!`);
		}
		if(this.#uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this.#uniqueNames[name]}!`);
		}
		this.#uniqueNames[name] = 'scalarType';
		this.#scalarTypes[name] = type;
		return this.#scalarTypes[name];
	}

	getInputType(name) {
		//log.debug(`getInputType(${name})`);
		if (!Object.hasOwn(this.#inputTypes, name)) { // true also when property is set to undefined
			throw new Error(`name:${name} not found in inputTypes, perhaps you're trying to use it before it's defined?`);
		}
		const type = this.#inputTypes[name];
		if (!type) {
			throw new Error(`inputType name:${name} is falsy!`);
		}
		//log.debug(`getinputType(${name}) --> ${typeof type}`);
		return type;
	}

	getObjectType(name) {
		//log.debug(`getobjectType(${name})`);
		if (!Object.hasOwn(this.#objectTypes, name)) { // true also when property is set to undefined
			throw new Error(`name:${name} not found in objectTypes, perhaps you're trying to use it before it's defined?`);
		}
		const type = this.#objectTypes[name];
		if (!type) {
			throw new Error(`objectType name:${name} is falsy!`);
		}
		//log.debug(`getobjectType(${name}) --> ${typeof type}`);
		return type;
	}

	getObjectTypes() {
		return this.#objectTypes;
	}

	getScalarType(name) {
		//log.debug(`getScalarType(${name})`);
		if (!Object.hasOwn(this.#scalarTypes, name)) { // true also when property is set to undefined
			throw new Error(`name:${name} not found in scalarTypes, perhaps you're trying to use it before it's defined?`);
		}
		const type = this.#scalarTypes[name];
		if (!type) {
			throw new Error(`scalarType name:${name} is falsy!`);
		}
		//log.debug(`getScalarType(${name}) --> ${typeof type}`);
		return type;
	}

	getSortedObjectTypeNames() {
		return Object.keys(this.#objectTypes).sort();
	}
} // Glue
