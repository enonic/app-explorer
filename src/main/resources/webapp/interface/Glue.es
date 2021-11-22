/*

Goals:
 1. GraphQL names must be unique
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
	log.debug(`addObjectType({ name: ${name} })`);
	if(this.uniqueNames[name]) {
		throw new Error(`Name ${name} already used as ${this.uniqueNames[name]}!`);
	}
	this.uniqueNames[name] = 'objectType';
	this.objectTypes[name] = this.schemaGenerator.createObjectType({
		fields,
		interfaces,
		name
	});
	return this.objectTypes[name];
}

function getObjectType(name) {
	return this.objectTypes[name];
}


function addUnionType({
	name,
	typeResolver,
	types = []
}) {
	log.debug(`addUnionType({ name: ${name} })`);
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
	return this.unionTypes[name].type;
}

function getUnionTypeResolver(name) {
	return this.unionTypes[name].typeResolver;
}


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


export function constructGlue({
	schemaGenerator
}) {
	return {
		addEnumType, // function
		addInputType, // function
		addInterfaceType, // function
		addObjectType, // function
		addUnionType, // function
		enumTypes: {},
		getEnumType, // function
		getInputType, // function
		getInterfaceType, // function
		getInterfaceTypeFields, // function
		getInterfaceTypeObject, // function
		getObjectType, // function
		getUnionType, // function
		getUnionTypeResolver, // function
		inputTypes: {},
		interfaceTypes: {},
		objectTypes: {},
		schemaGenerator,
		unionTypes: {},
		uniqueNames: {}
	};
}
