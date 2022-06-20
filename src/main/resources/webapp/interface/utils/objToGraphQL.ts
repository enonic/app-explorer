import type {Glue} from './Glue';
import type {
	Branch,
	Fields,
	GraphQLObjectType
} from './index.d';


import {
	VALUE_TYPE_SET,
	camelize,
	//toStr,
	ucFirst
} from '@enonic/js-utils';
import traverse from 'traverse';
import {
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {valueTypeToGraphQLType} from './valueTypeToGraphQLType';


export function objToGraphQL({
	documentTypeName,
	glue,
	obj
} :{
	documentTypeName :string
	glue :Glue
	obj :Branch
}) :Fields {
	//log.debug('objToGraphQL documentTypeName:%s obj:%s', documentTypeName, toStr(obj));

	const emptyObj = {};
	traverse(obj).forEach(function(value) { // Fat arrow destroys this
		//log.debug(`this:${toStr(this)}`); // JSON.stringify got a cyclic data structure
		//log.debug(`key:${toStr(this.key)} value:${toStr(value)} isLeaf:${toStr(this.isLeaf)}`);
		// NOTE Because of recursion this.level and this.path is flattened!
		//log.debug(`this.level:${toStr(this.level)} this.key:${toStr(this.key)} this.path:${toStr(this.path)} this.node:${toStr(this.node)} value:${toStr(value)}`);
		if (this.notRoot) {
			if (this.notLeaf) {
				//log.debug('objToGraphQL value:%s', value);
				const {
					_max = 0,
					_min = 0,
					_valueType
				} = value;
				//log.debug('objToGraphQL documentTypeName:%s this.key:%s (maybe flattened?!) _max:%s _min:%s _valueType:%s', documentTypeName, this.key, _max, _min, _valueType);

				if (_valueType) {
					let type :GraphQLObjectType;
					if (_valueType === VALUE_TYPE_SET) {
						this.block(); // No need to continue walking down this branch, since we recurse it instead
						const nestedObjectTypeName = `${documentTypeName}${ucFirst(camelize(this.key, /[.]/g))}`; // Must be unique
						type = glue.addObjectType({
							name: nestedObjectTypeName, // Must be unique
							fields: objToGraphQL({
								documentTypeName: nestedObjectTypeName, // So nested.name and nested.name.name don't get the same documentTypeName :)
								glue,
								obj: value
							}) // Recurse NOTE This FLATTENES this.path :(
						});
					} else {
						type = valueTypeToGraphQLType(_valueType); // VALUE_TYPE_SET becomes GraphQLString :(
					}

					if (_min > 0) {
						type = nonNull(type); // Can be wrapped with list, so it becomes list(nonNull(type))
					}

					// max:0 could be list, definetly is when min>1
					// max:1 is NOT list
					if (_max > 1 || _min > 1) {
						type = list(type); // list(type) or list(nonNull(type))
						if (_min > 0) {
							// When this if was one scope out, I got this error:
							// A non null type cannot wrap an existing non null type 'String!'
							type = nonNull(type); // nonNull(list(type)) or nonNull(list(nonNull(type)))
						}
					}

					// _min:0 means no lower limit, aka optional
					// _max:0 means no upper limit, aka infinite
					// _min:0 is allowed with any size of _max (0 to any)
					// _max:0 is allowed with any size of _min (any to infinite)
					//if (_min > 1 && _max === 1) {
					if (_min !== 0 && _max !== 0 && _min > _max) {
						log.error('Min:%s is larger than max:%s! Inconsistency in documentType:%s on key:%s', _min, _max, documentTypeName, this.key);
					}

					//log.debug('objToGraphQL documentTypeName:%s setting key:%s', documentTypeName, this.key);
					emptyObj[this.key] = {type};
				} // if valueType
			} // if !leaf
		} // if !root
	}); // traverse
	return emptyObj;
} // objToGraphQL
