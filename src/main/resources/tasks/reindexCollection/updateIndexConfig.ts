/*Array.prototype.findIndex = Array.prototype.findIndex || function(callback) {
	if (this === null) {
		throw new TypeError('Array.prototype.findIndex called on null or undefined');
	} else if (typeof callback !== 'function') {
		throw new TypeError('callback must be a function');
	}
	var list = Object(this);
	// Makes sures is always has an positive integer as length.
	var length = list.length >>> 0;
	var thisArg = arguments[1];
	for (var i = 0; i < length; i++) {
		if ( callback.call(thisArg, list[i], i, list) ) {
			return i;
		}
	}
	return -1;
};*/


function findIndex(array, callback) {
	var length = array.length >>> 0;
	var thisArg = arguments[1];
	for (var i = 0; i < length; i++) {
		if ( callback.call(thisArg, array[i], i, array) ) {
			return i;
		}
	}
	return -1;
}


export function updateIndexConfig({
	_indexConfig,
	path,
	config
}) {
	const dereffedIndexConfig = JSON.parse(JSON.stringify(_indexConfig));
	//log.debug(`dereffedIndexConfig:${toStr(dereffedIndexConfig)}`);
	//if (!dereffedIndexConfig.configs) { dereffedIndexConfig.configs = []; } // Not needed?
	//if (!Array.isArray(dereffedIndexConfig.configs)) { dereffedIndexConfig.configs = [dereffedIndexConfig.configs]; } // Not needed?
	const index = findIndex(dereffedIndexConfig.configs, ({path:p}) => p === path);
	//const index = dereffedIndexConfig.configs.findIndex(({path:p}) => p === path); // Not polyfilled
	if (index !== -1) {
		dereffedIndexConfig.configs.splice(index, 1, {path,config});
	} else {
		dereffedIndexConfig.configs.push({path,config});
		dereffedIndexConfig.configs.sort((a, b) => (a.path > b.path) ? 1 : -1); // Slow?
	}
	return dereffedIndexConfig;
}
