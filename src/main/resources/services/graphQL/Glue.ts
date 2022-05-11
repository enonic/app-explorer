import {
	hasOwnProperty//,
	//toStr
} from '@enonic/js-utils';

import {
	newSchemaGenerator
	//@ts-ignore
} from '/lib/graphql';


export class Glue {

	// Private fields
	_enumTypes = {};
	_fields = {};
	_inputTypes = {};
	_interfaceTypes = {};
	_mutations = {};
	_objectTypes = {};
	_queries = {};
	_scalarTypes = {};
	_uniqueFieldNames = {}; // mutation and query field names should be unique?
	_uniqueNames = {};
	_unionTypes = {};

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

	getFields(name) {
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

	getInputType(name) {
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

	getInterfaceType(name) {
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

	getInterfaceTypeFields(name) {
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

	getInterfaceTypeObj(name) {
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

	getObjectType(name) {
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

	getScalarType(name) {
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

	getUnionTypeObj(name) {
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
