//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
//type AnyObject = Record<PropertyKey,unknown>
type MyGlobal = {
	frames: typeof globalThis
	globalThis: typeof globalThis
	self: typeof globalThis
	window: typeof globalThis
}
/* Google uses this:
type GlobalThis = typeof globalThis & Window & {
	NaN: never;
	Infinity: never;
};*/

// https://stackoverflow.com/questions/9107240/1-evalthis-vs-evalthis-in-javascript
//@ts-ignore TS2451: Cannot redeclare block-scoped variable 'global'.
const global :typeof globalThis = (1, eval)('this'); // eslint-disable-line no-eval

global.global = global;
(global as unknown as MyGlobal).globalThis = global;
(global as unknown as MyGlobal).frames = global;
(global as unknown as MyGlobal).self = global;
(global as unknown as MyGlobal).window = global;

// Attempt at avoiding ReferenceError: "console" is not defined
/*global.console = {
	assert: log.debug,
	clear: () => {log.warning('console.clear called')},
	count: () => {log.warning('console.count called')},
	countReset: () => {log.warning('console.countReset called')},
	debug: log.debug,
	dir: log.debug,
	dirxml: log.debug,
	error: log.error,
	exception: log.error,
	group: () => {log.warning('console.group called')},
	groupCollapsed: () => {log.warning('console.groupCollapsed called')},
	groupEnd: () => {log.warning('console.groupEnd called')},
	info: log.info,
	log: log.info,
	profile: log.debug,
	profileEnd: () => {log.warning('console.profileEnd called')},
	table: log.info,
	time: () => {log.warning('console.time called')},
	timeEnd: () => {log.warning('console.timeEnd called')},
	timeLog: () => {log.warning('console.timeLog called')},
	timeStamp: () => {log.warning('console.timeStamp called')},
	trace: log.debug,
	warn: log.warning
} // console*/

module.exports = global;

//──────────────────────────────────────────────────────────────────────────────
// require('core-js/stable/number/is-finite')
Number.isFinite = Number.isFinite || isFinite;
//──────────────────────────────────────────────────────────────────────────────
// import 'core-js/stable/math/trunc';
// require('core-js/stable/math/trunc')
Math.trunc = Math.trunc || function (v) {
	return v < 0 ? Math.ceil(v) : Math.floor(v);
};
//──────────────────────────────────────────────────────────────────────────────
// TypeError: Number.parseFloat is not a function
// require('core-js/stable/parse-float')
Number.parseFloat = Number.parseFloat || parseFloat;
//──────────────────────────────────────────────────────────────────────────────
// TypeError: Cannot read property "navigator" from undefined
//──────────────────────────────────────────────────────────────────────────────
