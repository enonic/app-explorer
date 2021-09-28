import {toStr} from '@enonic/js-utils';

import {
	newSchemaGenerator
} from '/lib/graphql';


export class Glue {

	// Private fields
	#uniqueNames = {};

	// Public fields
	enumTypes = {};
	inputTypes = {};
	interfaceTypes = {};
	objectTypes = {};
	scalarTypes = {};
	schemaGenerator;

	constructor() {
		this.schemaGenerator = newSchemaGenerator();
	}

	addEnumType({
		name,
		values
	}) {
		log.debug(`addEnumType({name:${name}})`);
		if(this.enumTypes[name]) {
			throw new Error(`Enum type ${name} already defined!`);
		}
		if(this.#uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this.#uniqueNames[name]}!`);
		}
		this.#uniqueNames[name] = 'enumType';
		this.enumTypes[name] = this.schemaGenerator.createEnumType({
			name,
			values
		});
		return this.enumTypes[name];
	}

	addInputType({
		fields,
		name
	}) {
		log.debug(`addInputType({name:${name},fields:${toStr(fields)}})`);
		if(this.inputTypes[name]) {
			throw new Error(`Input type ${name} already defined!`);
		}
		if(this.#uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this.#uniqueNames[name]}!`);
		}
		this.#uniqueNames[name] = 'inputType';
		this.inputTypes[name] = this.schemaGenerator.createInputObjectType({
			fields,
			name
		});
		return this.inputTypes[name];
	}

	addInterfaceType({
		fields,
		name,
		typeResolver
	}) {
		log.debug(`addInterfaceType({name:${name},fields:${toStr(fields)}})`);
		if(this.interfaceTypes[name]) {
			throw new Error(`Interface type ${name} already defined!`);
		}
		if(this.#uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this.#uniqueNames[name]}!`);
		}
		this.#uniqueNames[name] = 'interfaceType';
		this.interfaceTypes[name] = this.schemaGenerator.createInterfaceType({
			fields,
			name,
			typeResolver
		});
		return this.interfaceTypes[name];
	}

	addObjectType({
		fields,
		name
	}) {
		log.debug(`addObjectType({name:${name},fields:${toStr(fields)})`);
		if(this.objectTypes[name]) {
			throw new Error(`Object type ${name} already defined!`);
		}
		if(this.#uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this.#uniqueNames[name]}!`);
		}
		this.#uniqueNames[name] = 'objectType';
		this.objectTypes[name] = this.schemaGenerator.createObjectType({
			fields,
			name
		});
		return this.objectTypes[name];
	}

	addScalarType({
		name,
		type
	}) {
		log.debug(`addScalarType({name:${name}})`);
		if(this.scalarTypes[name]) {
			throw new Error(`Scalar type ${name} already defined!`);
		}
		if(this.#uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this.#uniqueNames[name]}!`);
		}
		this.#uniqueNames[name] = 'scalarType';
		this.scalarTypes[name] = type;
		return this.scalarTypes[name];
	}
} // Glue
