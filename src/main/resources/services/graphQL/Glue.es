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
	#enumTypes = {};
	#fields = {};
	#inputTypes = {};
	#interfaceTypes = {};
	#mutations = {};
	#objectTypes = {};
	#queries = {};
	#scalarTypes = {};
	#uniqueFieldNames = {}; // mutation and query field names should be unique?
	#uniqueNames = {};
	#unionTypes = {};

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

	addFields({
		name,
		fields
	}) {
		//log.debug(`addEnumType({name:${name}})`);
		if(this.#fields[name]) {
			throw new Error(`Field ${name} already defined!`);
		}
		/*if(this.#uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this.#uniqueNames[name]}!`);
		}
		this.#uniqueNames[name] = 'enumType';*/
		this.#fields[name] = fields;
		return fields;
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
		this.#interfaceTypes[name] = {
			fields,
			type: this.schemaGenerator.createInterfaceType({
				fields,
				name,
				typeResolver
			})//,
			//typeResolver // NOTE This should be fetched from the unionType instead...
		};
		return this.#interfaceTypes[name].type;
	}

	addObjectType({
		fields,
		interfaces = [],
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
			interfaces,
			name
		});
		return this.#objectTypes[name];
	}

	addMutation({
		args = {},
		name,
		resolve,
		type
	}) {
		//log.debug(`addEnumType({name:${name}})`);
		if(this.#mutations[name]) {
			throw new Error(`Enum type ${name} already defined!`);
		}
		if(this.#uniqueFieldNames[name]) {
			throw new Error(`Name ${name} already used as ${this.#uniqueFieldNames[name]}!`);
		}
		this.#uniqueFieldNames[name] = 'mutation';
		this.#mutations[name] = {
			args,
			resolve,
			type
		};
		return this.#mutations[name];
	}

	addQuery({
		args = {},
		name,
		resolve,
		type
	}) {
		//log.debug(`addEnumType({name:${name}})`);
		if(this.#queries[name]) {
			throw new Error(`Enum type ${name} already defined!`);
		}
		if(this.#uniqueFieldNames[name]) {
			throw new Error(`Name ${name} already used as ${this.#uniqueFieldNames[name]}!`);
		}
		this.#uniqueFieldNames[name] = 'query';
		this.#queries[name] = {
			args,
			resolve,
			type
		};
		return this.#queries[name];
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

	addUnionType({
		name,
		typeResolver,
		types = []
	}) {
		//log.debug(`addUnionType({name:${name}})`);
		if(this.#unionTypes[name]) {
			throw new Error(`Union type ${name} already defined!`);
		}
		if(this.#uniqueNames[name]) {
			throw new Error(`Name ${name} already used as ${this.#uniqueNames[name]}!`);
		}
		this.#uniqueNames[name] = 'unionType';
		this.#unionTypes[name] = {
			type: this.schemaGenerator.createUnionType({
				name,
				typeResolver,
				types
			}),
			typeResolver,
			types
		};
		return this.#unionTypes[name];
	}

	getFields(name) {
		//log.debug(`getFields(${name})`);
		if (!Object.hasOwn(this.#fields, name)) { // true also when property is set to undefined
			/*if (this.#uniqueNames[name]) {
				throw new Error(`name:${name} is not an inputType! but ${this.#uniqueNames[name]}`);
			}*/
			throw new Error(`fields[${name}] not found! Perhaps you're trying to use it before it's defined?`);
		}
		const fields = this.#fields[name];
		if (!fields) {
			throw new Error(`inputType[${name}] is falsy!`);
		}
		//log.debug(`getFields(${name}) --> ${typeof type}`);
		return fields;
	}

	getInputType(name) {
		//log.debug(`getInputType(${name})`);
		if (!Object.hasOwn(this.#inputTypes, name)) { // true also when property is set to undefined
			if (this.#uniqueNames[name]) {
				throw new Error(`name:${name} is not an inputType! but ${this.#uniqueNames[name]}`);
			}
			throw new Error(`inputTypes[${name}] not found! Perhaps you're trying to use it before it's defined?`);
		}
		const type = this.#inputTypes[name];
		if (!type) {
			throw new Error(`inputType[${name}] is falsy!`);
		}
		//log.debug(`getinputType(${name}) --> ${typeof type}`);
		return type;
	}

	getInterfaceType(name) {
		//log.debug(`getInterfaceType(${name})`);
		if (!Object.hasOwn(this.#interfaceTypes, name)) { // true also when property is set to undefined
			if (this.#uniqueNames[name]) {
				throw new Error(`name:${name} is not an interfaceType! but ${this.#uniqueNames[name]}`);
			}
			throw new Error(`name:${name} not found in interfaceTypes, perhaps you're trying to use it before it's defined?`);
		}
		const type = this.#interfaceTypes[name].type;
		if (!type) {
			throw new Error(`interfaceType[${name}].type is falsy!`);
		}
		//log.debug(`getInterfaceType(${name}) --> ${typeof type}`);
		return type;
	}

	getInterfaceTypeFields(name) {
		//log.debug(`getInterfaceTypeFields(${name})`);
		if (!Object.hasOwn(this.#interfaceTypes, name)) { // true also when property is set to undefined
			throw new Error(`interfaceTypes[${name}] not found! Perhaps you're trying to use it before it's defined?`);
		}
		const fields = this.#interfaceTypes[name].fields;
		if (!fields) {
			throw new Error(`interfaceTypes[${name}].fields is falsy!`);
		}
		//log.debug(`getInterfaceTypeFields(${name}) --> ${typeof type}`);
		return fields;
	}

	getInterfaceTypeObj(name) {
		//log.debug(`getInterfaceTypeObj(${name})`);
		if (!Object.hasOwn(this.#interfaceTypes, name)) { // true also when property is set to undefined
			if (this.#uniqueNames[name]) {
				throw new Error(`name:${name} is not an interfaceType! but ${this.#uniqueNames[name]}`);
			}
			throw new Error(`name:${name} not found in interfaceTypes, perhaps you're trying to use it before it's defined?`);
		}
		const obj = this.#interfaceTypes[name];
		if (!obj) {
			throw new Error(`interfaceType[${name}].type is falsy!`);
		}
		//log.debug(`getInterfaceTypeObj(${name}) --> ${typeof type}`);
		return obj;
	}

	getMutations() {
		return this.#mutations;
	}

	getQueries() {
		return this.#queries;
	}

	getObjectType(name) {
		//log.debug(`getobjectType(${name})`);
		if (!Object.hasOwn(this.#objectTypes, name)) { // true also when property is set to undefined
			if (this.#uniqueNames[name]) {
				throw new Error(`name:${name} is not an objectType! but ${this.#uniqueNames[name]}`);
			}
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
			if (this.#uniqueNames[name]) {
				throw new Error(`name:${name} is not an scalarType! but ${this.#uniqueNames[name]}`);
			}
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

	getUnionTypeObj(name) {
		//log.debug(`getUnionTypeObj(${name})`);
		if (!Object.hasOwn(this.#unionTypes, name)) { // true also when property is set to undefined
			if (this.#uniqueNames[name]) {
				throw new Error(`name:${name} is not an unionType! but ${this.#uniqueNames[name]}`);
			}
			throw new Error(`name:${name} not found in unionTypes, perhaps you're trying to use it before it's defined?`);
		}
		const obj = this.#unionTypes[name];
		if (!obj) {
			throw new Error(`unionType[${name}].type is falsy!`);
		}
		//log.debug(`getUnionTypeObj(${name}) --> ${typeof type}`);
		return obj;
	}

	getUnionTypes() {
		return this.#unionTypes;
	}
} // Glue
