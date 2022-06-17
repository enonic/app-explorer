import {
	camelize,
	toStr,
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
}) {
	log.debug('objToGraphQL documentTypeName:%s obj:%s', documentTypeName, toStr(obj));
	return traverse(obj).map(function(value) { // Fat arrow destroys this
		//log.debug(`this:${toStr(this)}`); // JSON.stringify got a cyclic data structure
		//log.debug(`key:${toStr(this.key)} value:${toStr(value)} isLeaf:${toStr(this.isLeaf)}`);
		// NOTE Because of recursion this.level and this.path is flattened!
		//log.debug(`this.level:${toStr(this.level)} this.key:${toStr(this.key)} this.path:${toStr(this.path)} this.node:${toStr(this.node)} value:${toStr(value)}`);
		if (this.notRoot) {
			if (this.notLeaf) {
				log.debug('objToGraphQL value:%s', value);
				const {
					_max = 0,
					_min = 0,
					_valueType
				} = value;
				log.debug('objToGraphQL _max:%s _min:%s _valueType:%s', _max, _min, _valueType);
				if (_valueType) {
					let type = valueTypeToGraphQLType(_valueType);
					if (_min > 0) {
						type = nonNull(type);
					}
					if (_max > 1) { // 0 could be list, 1 is NOT list, >1 list
						type = list(type);
					}
					/*if (_min > 0) {
						type = nonNull(type); // A non null type cannot wrap an existing non null type 'String!'
					}*/
					this.update({ type }, true); // Avoiding infinite loop by setting stopHere=true
				} else {
					this.update({
						type: glue.addObjectType({
							name: `${documentTypeName}${ucFirst(camelize(this.key, /[.]/g))}`, // Must be unique
							fields: objToGraphQL({
								documentTypeName,
								glue,
								obj: value
							}) // Recurse NOTE This FLATTENES this.path :(
						})
					}, true); // Avoiding infinite loop by setting stopHere=true
				}
			}
		}
	}); // traverse
} // objToGraphQL
