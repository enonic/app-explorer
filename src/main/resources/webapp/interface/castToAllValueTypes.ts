// This code is currently not in use, but it useful to see what is possible, and how to do it.

import {
	//VALUE_TYPE_ANY,
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_REFERENCE,
	//VALUE_TYPE_SET,
	VALUE_TYPE_STRING,
	isBoolean,
	isDateString,
	isNumber,
	isObject,
	isString,
	toStr
} from '@enonic/js-utils';
import {v4 as isUuid4} from 'is-uuid';

import {
	JAVA_MAX_SAFE_INT,
	JAVA_MIN_SAFE_INT
} from './constants';

const VALUE_TYPE_VARIANTS = [
	//VALUE_TYPE_ANY,
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_REFERENCE,
	//VALUE_TYPE_SET,
	VALUE_TYPE_STRING
];

export function castToAllValueTypes({
	washedNode
}) {
	// Old way to provide a field once per all valueTypes (cast into that valueType, or null if cast fails)
	Object.keys(washedNode).forEach((k) => {
		//log.debug(`k:${toStr(k)}`);
		VALUE_TYPE_VARIANTS.forEach((v) => {
			//log.debug(`v:${toStr(v)}`);
			let value = washedNode[k];
			//java.time.OffsetDateTime
			//log.debug(`k:${k} value:${value} toStr(value):${toStr(value)} typeof value:${typeof value} Object.prototype.toString.call(value):${Object.prototype.toString.call(value)}`);
			switch (v) {
			case VALUE_TYPE_BOOLEAN:
				// WARN  n.g.execution.ExecutionStrategy - Can't serialize value (/search/hits[0]/instant_as_boolean)
				// : Expected something we can convert to 'java.time.OffsetDateTime' but was 'Boolean'.
				//value = !!value;
				if (!isBoolean(value)) {
					value = null;
				}
				break;
			case VALUE_TYPE_DOUBLE:
				if (isBoolean(value) || isDateString(value)) {
					value = null;
				} else {
					// language_as_double : Expected type 'Float' but was 'Double'
					const maybeFloat = parseFloat(value);
					if (isNaN(maybeFloat)) {
						value = null;
						//value = 0.0;
					} else {
						value = maybeFloat;
					}
				}
				break;
			case VALUE_TYPE_GEO_POINT:
				// '59.9090442,10.7423389' // Enonic always returns this
				// [59.9090442,10.7423389] // Enonic never returns this...
				if (Array.isArray(value)) {
					log.warning(`Enonic XP should never return GeoPoint as Array??? k:${toStr(k)} v:${toStr(v)} value:${toStr(value)}`);
					if (value.length !== 2) {
						value = null; // Not GeoPoint
					} else { // value.length === 2
						const [lat, lon] = value;
						const parsedLat = parseFloat(lat);
						const parsedLon = parseFloat(lon);
						if (isNumber(parsedLat) && isNumber(parsedLon)) {
							value = `${parsedLat},${parsedLon}`;
						} else {
							value = null; // Not GeoPoint
						}
					}
				} else /* !Array */	if (!isString(value)) {
					value = null; // Not GeoPoint
				} else { // isString
					let [lat, lon] = value.split(',');
					const parsedLat = parseFloat(lat);
					const parsedLon = parseFloat(lon);
					if (isNumber(parsedLat) && isNumber(parsedLon)) {
						value = `${parsedLat},${parsedLon}`;
					} else {
						value = null; // Not GeoPoint
					}
				}
				break;
			case VALUE_TYPE_INSTANT:
				if (!isDateString(value)) {
					value = null;
				} else {
					//value = value // date_as_instant : Invalid RFC3339 value : '2021-12-31'. because of : 'Text '2021-12-31' could not be parsed at index 10
					//value = new Date(Date.parse(value)); // date_as_instant : Expected something we can convert to 'java.time.OffsetDateTime' but was 'Date'
					value = new Date(Date.parse(value)).toISOString();
				}
				break;
			case VALUE_TYPE_LOCAL_DATE:
				if (!isDateString(value)) {
					value = null;
				} else {
					value = new Date(Date.parse(value)).toLocaleDateString();
				}
				break;
			case VALUE_TYPE_LOCAL_DATE_TIME:
				if (!isDateString(value)) {
					value = null;
				} else {
					// Can't serialize value (instant_as_localDateTime) : null graphql.schema.CoercingSerializeException: null
					// However in Chrome console:
					//  new Date(Date.parse("2021-12-31T23:59:59Z")).toLocaleString();
					//    '01/01/2022, 00:59:59'
					//  new Date(Date.parse("2021-12-31T23:59:59Z")).toLocaleString('nb-NO' ,{ timeZone: 'UTC'});
					//    '31.12.2021, 23:59:59'
					//log.debug(`k:${k} value:${value} Date.parse(value):${Date.parse(value)} new Date(Date.parse(value)):${new Date(Date.parse(value))}`);
					//log.debug(`k:${k} new Date(Date.parse(value)).toLocaleString():${new Date(Date.parse(value)).toLocaleString()}`);
					// NOTE So the seems to be that GraphQL doesn't like what toLocaleString produces...
					//value = new Date(Date.parse(value)).toLocaleString();
					//value = new Date(Date.parse(value)); // Expected something what can convert to 'java.time.LocalDateTime' but was 'Date'
					//value = new Date(Date.parse(value)).toISOString(); // graphql.schema.CoercingSerializeException: null
					value = null; // TODO
				}
				break;
			case VALUE_TYPE_LOCAL_TIME:
				if (!isDateString(value)) {
					value = null;
				} else {
					value = new Date(Date.parse(value)).toLocaleTimeString();
				}
				break;
			case VALUE_TYPE_LONG:
				if (isBoolean(value) || isDateString(value)) {
					value = null;
				} else {
					//const maybeInt = parseInt(value, 10); // Actually returns Double  // https://github.com/enonic/xp/issues/8462
					const maybeFloat = parseFloat(value);
					if (isNaN(maybeFloat) || maybeFloat < JAVA_MIN_SAFE_INT || maybeFloat > JAVA_MAX_SAFE_INT) {
						value = null;
					} else {
						value = maybeFloat|0; // Rounding towards zero
					}
				}
				break;
			case VALUE_TYPE_REFERENCE:
				if (!isUuid4(value)) {
					value = null;
				}
				break;
			case VALUE_TYPE_STRING:
				if (!isString(value)) {
					if (Array.isArray(value)) {
						if (isString(value[0])) {
							value = value.join(',');
						} else {
							value = JSON.stringify(value);
						}
					} else if (isObject(value)) { // Includes Date
						value = JSON.stringify(value);
					} else { // Boolean, Float, Int, Reference?
						value = `${value}`; // false stayed false???
						//value = value.toString(); // false still stayed false???
						//value = '' + value;
						//log.debug(`k:${k} value:${value} toStr(value):${toStr(value)} typeof value:${typeof value} Object.prototype.toString.call(value):${Object.prototype.toString.call(value)}`);
					}
				}
				break;
			default:
				log.warning(`Unhandeled value type:${v}`);
			}
			//washedNode[`${k}_as_${v}`] = value;
		}); // VALUE_TYPE_VARIANTS.forEach
	}); // Object.keys(washedNode).forEach
}
