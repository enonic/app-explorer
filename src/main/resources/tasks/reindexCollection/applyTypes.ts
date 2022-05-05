import {
	VALUE_TYPE_ANY,
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_REFERENCE,
	VALUE_TYPE_SET,
	VALUE_TYPE_STRING,
	isInt,
	isObject,
	isSet,
	isString,
	toStr
} from '@enonic/js-utils';
import {getIn} from '@enonic/js-utils';
import setIn from 'set-value';

import {ValidationError} from '/lib/explorer/document/ValidationError';
import {
	geoPoint, // [lat, long]
	geoPointString, // 'lat,long'
	instant,
	localDate,
	localDateTime,
	localTime,
	reference
	//@ts-ignore
} from '/lib/xp/value';

import {updateIndexConfig} from './updateIndexConfig';


// Any Float number with a zero decimal part are implicitly cast to Integer,
// so it is not possible to check if they are Float or not.
function isFloat(n){
	return Number(n) === n;
	//return Number(n) === n && n % 1 !== 0; //

	// Test whether a value is a number primitive value that has no fractional
	// part and is within the size limits of what can be represented as an exact integer
	//return n === +n && n !== (n|0);
}


export function applyTypes({
	boolRequireValid = false,
	documentNode,
	languages = [],
	documentType
}) {
	const dereffedDocumentNode = JSON.parse(JSON.stringify(documentNode));
	let boolValid = true;
	documentType.properties.forEach(({
		enabled = false,
		fulltext = false,
		includeInAllText = false,
		max = 0, // 0 means infinite
		min = 0, // 0 means not required
		ngram = false,
		name: propertyPath,
		valueType = VALUE_TYPE_STRING
	}) => {
		const value = getIn(dereffedDocumentNode, propertyPath);
		if (!isSet(value)) {
			if (min > 0) { // Required
				const message = `Required, but no value set at propertyPath:${propertyPath}!`;
				if (boolRequireValid) {
					throw new ValidationError(message);
				} else {
					log.warning(message);
					boolValid = false;
				}
			}
		} else { // isSet(value)
			if (
				min > 1 // At least two values
				&& (
					!Array.isArray(value) // Only one value (aka less than two)
					|| value.length < min // Too few values (less than minimum)
				)
			) {
				const message = `Min:${min} occurrences required, only ${Array.isArray(value) ? value.length : 1} occurrence(s) provided at propertyPath:${propertyPath}!`;
				if (boolRequireValid) {
					throw new ValidationError(message);
				} else {
					log.warning(message);
					boolValid = false;
				}
			}
			if (
				max > 0 // Not infinite
				&& Array.isArray(value) // and value an array
				&& value.length > max // and array count larger than limit
			) {
				const message = `Max:${max} occurrences allowed, ${value.length} occurrences provided at propertyPath:${propertyPath}!`;
				if (boolRequireValid) {
					throw new ValidationError(message);
				} else {
					log.warning(message);
					boolValid = false;
				}
			}
			if (enabled) {
				if(!(valueType && valueType === VALUE_TYPE_ANY)) {
					switch (valueType) {
					case VALUE_TYPE_STRING:
						if (Array.isArray(value)) {
							value.forEach((shouldBeString, index) => {
								if (!isString(shouldBeString)) {
									const message = `Value at propertyPath:${propertyPath} is an array, but item:${toStr(shouldBeString)} at index:${index} is not a string!`;
									if (boolRequireValid) {
										throw new ValidationError(message);
									} else {
										log.warning(message);
										boolValid = false;
									}
								}
							});
						} else if (!isString(value)) {
							const message = `Not a string:${toStr(value)} at propertyPath:${propertyPath}!`;
							if (boolRequireValid) {
								throw new ValidationError(message);
							} else {
								log.warning(message);
								boolValid = false;
							}
						}
						break;
					case VALUE_TYPE_BOOLEAN:
						if (Array.isArray(value)) {
							value.forEach((shouldBeBoolean, index) => {
								if (typeof shouldBeBoolean !== VALUE_TYPE_BOOLEAN) {
									const message = `Value at propertyPath:${propertyPath} is an array, but item:${toStr(shouldBeBoolean)} at index:${index} is not a boolean!`;
									if (boolRequireValid) {
										throw new ValidationError(message);
									} else {
										log.warning(message);
										boolValid = false;
									}
								}
							});
						} else if (typeof value !== VALUE_TYPE_BOOLEAN) {
							const message = `Not a boolean:${toStr(value)} at propertyPath:${propertyPath}!`;
							if (boolRequireValid) {
								throw new ValidationError(message);
							} else {
								log.warning(message);
								boolValid = false;
							}
						}
						break;
					case VALUE_TYPE_LONG:
						if (Array.isArray(value)) {
							value.forEach((shouldBeInt, index) => {
								if (!isInt(shouldBeInt)) {
									const message = `Value at propertyPath:${propertyPath} is an array, but item:${toStr(shouldBeInt)} at index:${index} is not a integer!`;
									if (boolRequireValid) {
										throw new ValidationError(message);
									} else {
										log.warning(message);
										boolValid = false;
									}
								}
							});
						} else if (!isInt(value)) {
							const message = `Not an integer:${toStr(value)} at propertyPath:${propertyPath}!`;
							if (boolRequireValid) {
								throw new ValidationError(message);
							} else {
								log.warning(message);
								boolValid = false;
							}
						}
						break;
					case VALUE_TYPE_DOUBLE:
						if (Array.isArray(value)) {
							(value).forEach((shouldBeDouble, index) => {
								if (!isFloat(shouldBeDouble)) {
									const message = `Value at propertyPath:${propertyPath} is an array, but item:${toStr(shouldBeDouble)} at index:${index} is not a number!`;
									if (boolRequireValid) {
										throw new ValidationError(message);
									} else {
										log.warning(message);
										boolValid = false;
									}
								}
							});
						} else if (!isFloat(value)) {
							const message = `Not a number:${toStr(value)} at propertyPath:${propertyPath}!`;
							if (boolRequireValid) {
								throw new ValidationError(message);
							} else {
								log.warning(message);
								boolValid = false;
							}
						}
						break;
					case VALUE_TYPE_SET:
						if (Array.isArray(value)) {
							value.forEach((shouldBeObject, index) => {
								if (!isObject(shouldBeObject)) {
									const message = `Value at propertyPath:${propertyPath} is an array, but item:${toStr(shouldBeObject)} at index:${index} is not a set!`;
									if (boolRequireValid) {
										throw new ValidationError(message);
									} else {
										log.warning(message);
										boolValid = false;
									}
								}
							});
						} else if (!isObject(value)) {
							const message = `Not a set:${toStr(value)} at propertyPath:${propertyPath}!`;
							if (boolRequireValid) {
								throw new ValidationError(message);
							} else {
								log.warning(message);
								boolValid = false;
							}
						}
						break;
					case VALUE_TYPE_GEO_POINT: {
						// TODO Handle arrays of geopoint array
						try {
							const typedValue = Array.isArray(value)
								? geoPoint(...value) // Doesn't take array, must spread
								: geoPointString(value);
							setIn(dereffedDocumentNode, propertyPath, typedValue);
						} catch (e) {
							log.error('e', e);
							const message = `Not a geoPoint:${toStr(value)} at propertyPath:${propertyPath}!`;
							if (boolRequireValid) {
								throw new ValidationError(message);
							} else {
								log.warning(message);
								boolValid = false;
							}
						}
						break;
					}
					case VALUE_TYPE_INSTANT: {
						if (Array.isArray(value)) {
							let allInstant = true;
							const instants=[];
							value.forEach((shouldBeInstant, index) => {
								try {
									const typedValue = instant(shouldBeInstant);
									instants.push(typedValue);
								} catch (e) {
									log.error('e', e);
									const message = `Value at propertyPath:${propertyPath} is an array, but item:${toStr(shouldBeInstant)} at index:${index} is not an instant!`;
									if (boolRequireValid) {
										throw new ValidationError(message);
									} else {
										log.warning(message);
										allInstant = false;
									}
								}
							}); // value.forEach
							if (allInstant) {
								setIn(dereffedDocumentNode, propertyPath, instants);
							} else {
								boolValid = false;
							}
						} else {
							try {
								const typedValue = instant(value);
								setIn(dereffedDocumentNode, propertyPath, typedValue);
							} catch (e) {
								log.error('e', e);
								const message = `Not an instant:${toStr(value)} at propertyPath:${propertyPath}!`;
								if (boolRequireValid) {
									throw new ValidationError(message);
								} else {
									log.warning(message);
									boolValid = false;
								}
							}
						}
						break;
					}
					case VALUE_TYPE_LOCAL_DATE: {
						try {
							const typedValue = localDate(value);
							setIn(dereffedDocumentNode, propertyPath, typedValue);
						} catch (e) {
							log.error('e', e);
							const message = `Not a localDate:${toStr(value)} at propertyPath:${propertyPath}!`;
							if (boolRequireValid) {
								throw new ValidationError(message);
							} else {
								log.warning(message);
								boolValid = false;
							}
						}
						break;
					}
					case VALUE_TYPE_LOCAL_DATE_TIME: {
						if (Array.isArray(value)) {
							let allLocalDateTime = true;
							const localDateTimes=[];
							value.forEach((shouldBeLocalDateTime, index) => {
								try {
									const typedValue = localDateTime(shouldBeLocalDateTime);
									localDateTimes.push(typedValue);
								} catch (e) {
									log.error('e', e);
									const message = `Value at propertyPath:${propertyPath} is an array, but item:${toStr(shouldBeLocalDateTime)} at index:${index} is not an localDateTime!`;
									if (boolRequireValid) {
										throw new ValidationError(message);
									} else {
										log.warning(message);
										allLocalDateTime = false;
									}
								}
							}); // value.forEach
							if (allLocalDateTime) {
								setIn(dereffedDocumentNode, propertyPath, localDateTimes);
							} else {
								boolValid = false;
							}
						} else {
							try {
								const typedValue = localDateTime(value);
								setIn(dereffedDocumentNode, propertyPath, typedValue);
							} catch (e) {
								log.error('e', e);
								const message = `Not a localDateTime:${toStr(value)} at propertyPath:${propertyPath}!`;
								if (boolRequireValid) {
									throw new ValidationError(message);
								} else {
									log.warning(message);
									boolValid = false;
								}
							}
						}
						break;
					}
					case VALUE_TYPE_LOCAL_TIME: {
						if (Array.isArray(value)) {
							let allLocalTime = true;
							const localTimes=[];
							value.forEach((shouldBeLocalTime, index) => {
								try {
									const typedValue = localTime(shouldBeLocalTime);
									localTimes.push(typedValue);
								} catch (e) {
									log.error('e', e);
									const message = `Value at propertyPath:${propertyPath} is an array, but item:${toStr(shouldBeLocalTime)} at index:${index} is not an localTime!`;
									if (boolRequireValid) {
										throw new ValidationError(message);
									} else {
										log.warning(message);
										allLocalTime = false;
									}
								}
							}); // value.forEach
							if (allLocalTime) {
								setIn(dereffedDocumentNode, propertyPath, localTimes);
							} else {
								boolValid = false;
							}
						} else {
							try {
								const typedValue = localTime(value);
								setIn(dereffedDocumentNode, propertyPath, typedValue);
							} catch (e) {
								log.error('e', e);
								const message = `Not a localTime:${toStr(value)} at propertyPath:${propertyPath}!`;
								if (boolRequireValid) {
									throw new ValidationError(message);
								} else {
									log.warning(message);
									boolValid = false;
								}
							}
						}
						break;
					}
					case VALUE_TYPE_REFERENCE: {
						if (Array.isArray(value)) {
							let allReference = true;
							const references=[];
							value.forEach((shouldBeReference, index) => {
								try {
									const typedValue = reference(shouldBeReference);
									references.push(typedValue);
								} catch (e) {
									log.error('e', e);
									const message = `Value at propertyPath:${propertyPath} is an array, but item:${toStr(shouldBeReference)} at index:${index} is not an reference!`;
									if (boolRequireValid) {
										throw new ValidationError(message);
									} else {
										log.warning(message);
										allReference = false;
									}
								}
							}); // value.forEach
							if (allReference) {
								setIn(dereffedDocumentNode, propertyPath, references);
							} else {
								boolValid = false;
							}
						} else {
							try {
								const typedValue = reference(value);
								setIn(dereffedDocumentNode, propertyPath, typedValue);
							} catch (e) {
								log.error('e', e);
								const message = `Not a reference:${toStr(value)} at propertyPath:${propertyPath}!`;
								if (boolRequireValid) {
									throw new ValidationError(message);
								} else {
									log.warning(message);
									boolValid = false;
								}
							}
						}
						break;
					}
					default:
						log.error(`Unhandeled valueType:${valueType}!`);
					} // switch
				} // !VALUE_TYPE_ANY
			} // if enabled
		} // isSet(value)
		dereffedDocumentNode._indexConfig = updateIndexConfig({
			_indexConfig: dereffedDocumentNode._indexConfig,
			path: propertyPath,
			config: {
				enabled,
				decideByType: enabled && true, // TODO Hardcode
				fulltext: enabled && fulltext,
				includeInAllText: enabled && includeInAllText,
				languages,
				ngram: enabled && ngram,
				path: enabled && false // TODO Hardcode
			}
		}); // updateIndexConfig
	}); // documentType.properties.forEach
	if (!dereffedDocumentNode.document_metadata) {
		dereffedDocumentNode.document_metadata = {};
	}
	dereffedDocumentNode.document_metadata.valid = boolValid;
	return dereffedDocumentNode;
}
