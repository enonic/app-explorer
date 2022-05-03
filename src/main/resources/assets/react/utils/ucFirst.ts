import {isFunction} from './isFunction';
import {isString} from './isString';


export const ucFirst = s => isString(s) && isFunction(s.charAt)
	? `${s.charAt(0).toUpperCase()}${s.substr(1)}`
	: s;
