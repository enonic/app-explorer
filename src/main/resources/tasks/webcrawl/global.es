// https://stackoverflow.com/questions/9107240/1-evalthis-vs-evalthis-in-javascript
const global = (1, eval)('this'); // eslint-disable-line no-eval
global.global = global;
global.globalThis = global;
global.frames = global;
global.self = global;
global.window = global;

//const window = global;
// Avoid Error: Secure random number generation is not supported by this browser. Use Chrome, Firefox or Internet Explorer 11
// Which comes from the randombytes node module, which is used runtime by serialize-javascript
// Offending code
//var crypto = global.crypto || global.msCrypto;
//if (crypto && crypto.getRandomValues)
//module.exports = randomBytes;
//} else {
//module.exports = oldBrowser;
//}
// The crypto node module v0.0.1 and v0.0.3 has no reference to getRandomValues??? (1.0.0 and 1.0.1 are empty)
// crypto-js does not define getRandomValues it tries to use it
// crypto-browserify does not mention getRandomValues
// get-random-values-polypony uses crypto node module?

// Actually works, but:
// WARNING Prefer a proper cryptographic entropy source over this module. If you are out of luck you can use this in a pinch
global.crypto = { getRandomValues: require('polyfill-crypto.getrandomvalues') };

// get-random-values uses crypto node module randomBytes()
//global.crypto = { getRandomValues: require('get-random-values') };

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

Number.isInteger = Number.isInteger || function(value) {
	return typeof value === 'number' &&
	isFinite(value) &&
	Math.floor(value) === value;
};
