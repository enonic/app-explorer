const global = (1, eval)('this'); // eslint-disable-line no-eval

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
