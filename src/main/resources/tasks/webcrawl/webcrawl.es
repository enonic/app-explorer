// TypeError: Object.getOwnPropertyDescriptors is not a function
require('object.getownpropertydescriptors').shim();

//import 'babel-es6-polyfill'; // TypeError: Cannot read property "document" from undefined

// Polyfill Reflect to avoid "Reflect" not defined.
// But introduces: TypeError: null has no such function "ownKeys"
//var Reflect = require('harmony-reflect');

//'use strict'; // This doesn't help debugging: TypeError: Cannot read property "Symbol" from undefined

//import 'symbol-es6'; // This does not fix: TypeError: Cannot read property "Symbol" from undefined

require('array.prototype.find').shim();
import {
	//VALUE_TYPE_STRING,
	toStr
} from '@enonic/js-utils';
import guard from 'robots-txt-guard';

// Cheerio import causes:
// TypeError: Cannot read property "TYPED_ARRAY_SUPPORT" from undefined
// And requires global to be provided by webpack.
import cheerio from 'cheerio';
//import cheerio from '/lib/cheerio';


//import safeStringify from 'fast-safe-stringify';
//import {parseDOM} from 'htmlparser2';

// WARNING Causes TypeError: Cannot read property "Symbol" from undefined in production mode!
/*import { // Runtime Errors with MAP and symbol?
	normalize, parse, resolve, serialize
} from 'uri-js/src/uri.ts';
//'uri-js/dist/esnext/uri.js';
//'uri-js';*/

//import normalizeUrl from 'normalize-url'; // Uses reflect :(
//import normalizeUri from 'normalize-uri';
//import normalizeUrl from 'conservative-normalize-url';
//import {resolve} from 'relative-to-absolute-iri';
//import Uri from 'jsuri';
import {URL} from '/lib/galimatias';


import {request as httpClientRequest} from '/lib/http-client';

import {
	NT_DOCUMENT
} from '/lib/explorer/model/2/constants';
import {query} from '/lib/explorer/connection/query';
import {exists} from '/lib/explorer/node/exists';
import {get} from '/lib/explorer/node/get';
import {addFilter} from '/lib/explorer/query/addFilter';
import {hasValue} from '/lib/explorer/query/hasValue';
import {hash} from '/lib/explorer/string/hash';

import {Collector} from '/lib/explorer/collector/Collector';

import {parseRobotsTxt} from './parseRobotsTxt';


/*function normalizeUri(uri) {
  return encodeURI(decodeURI(uri))
}*/


const DEBUG = false;
const TRACE = false;

const DEFAULT_UA = 'Mozilla/5.0 (compatible; Enonic XP Explorer Collector Web crawler/1.0.0)';


const querySelector = (node, selector) => cheerio(node.find(selector)[0]);

const querySelectorAll = (node, selector) => node.find(selector).toArray()
	.map((element) => cheerio(element));

const getAttributeValue = (node, name) => {
	const attributeValue = node.attr(name);

	if (typeof attributeValue === 'string') {
		return attributeValue;
	}

	//throw new Error(`Could not find a string value attribute:${name}!`);
	return undefined;
};

//const textContent = node => node.text();
const outerHTML = node => node.clone().wrap('<div>').parent().html();
//const innerHTML = node => node.html();


export function run({
	collectionId,
	collectorId,
	configJson,
	language,
	name // Collection name
}) {
	//log.debug(`name:${toStr(name)}`);
	//log.debug(`collectorId:${toStr(collectorId)}`);
	//log.debug(`configJson:${toStr(configJson)}`);
	//log.debug(`language:${toStr(language)}`);

	const collector = new Collector({
		collectionId,
		collectorId,
		configJson,
		/*documentTypeObj: {
			properties: [{
				enabled: true,
				fulltext: true,
				includeInAllText: true,
				max: 0,
				min: 0,
				name: 'text',
				nGram: true,
				path: false,
				valueType: VALUE_TYPE_STRING
			}, {
				enabled: true,
				fulltext: true,
				includeInAllText: true,
				max: 0,
				min: 0,
				name: 'title',
				nGram: true,
				path: false,
				valueType: VALUE_TYPE_STRING
			}, {
				enabled: true,
				fulltext: true,
				includeInAllText: true,
				max: 0,
				min: 0,
				name: 'uri',
				nGram: true,
				path: false,
				valueType: VALUE_TYPE_STRING
			}]
		},*/
		language,
		name
	});
	if (!collector.config.baseUri) { throw new Error('Config is missing required parameter baseUri!'); }
	collector.start();

	let {
		baseUri
	} = collector.config;
	const {
		resume = false,
		excludes = [],
		userAgent = DEFAULT_UA
	} = collector.config;
	DEBUG && log.debug(`userAgent:${userAgent}`);

	const excludeRegExps = excludes.map(str => new RegExp(str));

	// Galimatias
	if (!baseUri.includes('://')) { baseUri = `https://${baseUri}`;}
	const entryPointUrlObj = new URL(baseUri);

	const normalizedentryPointUrl = entryPointUrlObj.normalize();
	DEBUG && log.debug(`normalizedentryPointUrl:${normalizedentryPointUrl}`);

	const domain = entryPointUrlObj.getHost();
	DEBUG && log.debug(`domain:${domain}`);

	const scheme = entryPointUrlObj.getScheme();
	DEBUG && log.debug(`scheme:${scheme}`);

	// jsuri
	/*
	const entryPointUrlObj = new Uri(baseUri); //log.debug(toStr({entryPointUrlObj}));
	const domain = entryPointUrlObj.host(); //log.debug(`domain:${domain}`);
	const scheme = entryPointUrlObj.protocol(); //log.debug(`scheme:${scheme}`);
	*/

	// uri-js
	/*
	const entryPointUrlObj = parse(baseUri)
	const domain = entryPointUrlObj.host; //log.debug(toStr({domain}));
	const scheme = entryPointUrlObj.scheme;
	*/

	const robotsReq = {
		contentType: 'text/plain',
		followRedirects: false,
		headers: {
			'Accept': 'text/plain',
			'Accept-Charset': 'utf-8, iso-8859-1;q=0.5, *;q=0.1',
			'Accept-Encoding': 'identity', // Fix for  ID1ID2: actual != expected
			'User-Agent': userAgent
		},
		method: 'GET',
		url: `${scheme}://${domain}/robots.txt`
	};
	DEBUG && log.debug(toStr({robotsReq}));

	const robotsRes = httpClientRequest(robotsReq); //log.debug(toStr({robotsRes}));
	let robots;
	if(robotsRes.status === 200 && robotsRes.contentType === 'text/plain') {
		robots = guard(parseRobotsTxt(robotsRes.body));
	}
	DEBUG && log.debug(toStr({robots}));

	const seenUrisObj = {[normalizedentryPointUrl]: true};
	const queueArr = [normalizedentryPointUrl];

	function throwIfExcluded(normalized) {
		for (let i = 0; i < excludeRegExps.length; i += 1) {
			if (excludeRegExps[i].test(normalized)) {
				throw new Error('Matches an exclude regexp!');
			}
		}
	}

	function handleNormalizedUri(normalized) {
		if (
			!seenUrisObj[normalized]
		) {
			seenUrisObj[normalized] = true;
			queueArr.push(normalized);
			collector.taskProgressObj.total += 1;
		}
	} // handleNormalizedUri

	whileQueueLoop:
	while(queueArr.length) {
		if (collector.shouldStop()) {
			break whileQueueLoop;
		}
		const uri = queueArr.shift(); // Normalized before added to queue
		DEBUG && log.debug(`uri:${uri}`);

		const baseUrlObj = new URL(uri);
		//log.debug(toStr({baseUrlObj}));

		try {
			collector.taskProgressObj.info.uri = uri; // eslint-disable-line no-param-reassign
			if (resume) {
				collector.taskProgressObj.info.message = `Resuming ${uri}`;
				collector.progress();
				collector.taskProgressObj.current += 1; // eslint-disable-line no-param-reassign
				const nodeName = hash(uri);
				if (exists({
					connection: collector.collection.connection,
					_parentPath: '/',
					_name: nodeName
				})) {
					const node = get({
						connection: collector.collection.connection,
						_name: nodeName
					});
					const {uris} = node;
					uris.forEach(normalized => handleNormalizedUri(normalized));
				} // exists
			} else { // !resume
				collector.taskProgressObj.info.message = `Processing ${uri}`;
				collector.progress();
				collector.taskProgressObj.current += 1; // eslint-disable-line no-param-reassign
				if (robots && !robots.isAllowed('', uri)) {
					throw new Error('Not allowed in robots.txt');
				}
				throwIfExcluded(uri);
				const res = httpClientRequest({
					followRedirects: true, // https://www.enonic.com uses 302
					headers: {
						'User-Agent': userAgent
					},
					url: uri
				}); TRACE && log.debug(`res:${toStr(res)}`);
				if (res.status != 200) {
					throw new Error(`Status: ${res.status}!`);
				}
				if (!res.contentType.includes('html')) {
					throw new Error(`ContentType:${res.contentType} does not include html!`);
				}

				// X-Robots-Tag HTTP header http://www.searchtools.com/robots/x-robots-tag.html
				//log.debug(toStr({headers: res.headers}));
				let boolFollow = true;
				let boolIndex = true;
				if (res.headers['X-Robots-Tag']) {
					const xRobotsTag = res.headers['X-Robots-Tag'].toUpperCase();
					if (xRobotsTag.includes('NOFOLLOW')) {
						boolFollow = false;
					}
					if (xRobotsTag.includes('NOINDEX')) {
						if(!boolFollow) {
							throw new Error(`HTTP header X-Robots-Tag:${res.headers['X-Robots-Tag']} includes both NOFOLLOW and NOINDEX`);
						}
						boolIndex = false;
					}
				}
				//log.debug(toStr({boolFollow, boolIndex}));

				//const dom = parseDOM(res.body, options);
				const rootNode = cheerio.load(res.body, {
					xmlMode: false
				}).root(); //log.debug(safeStringify({rootNode})); // Huuuuuuuge!!!
				//log.debug(safeStringify({html: rootNode.html()}));

				const headEl = querySelector(rootNode, 'head');
				//log.debug(safeStringify({head: head.html()}));

				// Robots <META> tag http://www.searchtools.com/robots/robots-meta.html
				const robotsMetaEl = querySelector(headEl, 'meta[name=robots]');
				if (robotsMetaEl) {
					const robotsMetaHtml = outerHTML(robotsMetaEl);
					//log.debug(toStr({robotsMetaHtml}));
					const robotsMetaContentAttr = getAttributeValue(robotsMetaEl, 'content');
					if (robotsMetaContentAttr) {
						const robotsMetaUc = robotsMetaContentAttr.toUpperCase();
						if (robotsMetaUc.includes('NOFOLLOW')) {
							boolFollow = false;
							if (robotsMetaUc.includes('NOINDEX')) {
								throw new Error(`Found both NOFOLLOW and NOINDEX in ${robotsMetaHtml}`);
							}
						}
						if (robotsMetaUc.includes('NOINDEX')) {
							boolIndex = false;
						}
						if(!boolFollow && !boolIndex) {
							throw new Error(`Found both NOFOLLOW and NOINDEX combined from HTTP header X-Robots-Tag:${res.headers['X-Robots-Tag']} and ${robotsMetaHtml}`);
						}
					}
				}
				DEBUG && log.debug(`boolFollow:${toStr(boolFollow)}`);
				DEBUG && log.debug(`boolIndex:${toStr(boolIndex)}`);

				const titleEl = querySelector(headEl, 'title');
				//log.debug(`titleEl:${toStr(titleEl)}`); // JSON.stringify got a cyclic data structure

				const title = titleEl ? titleEl.text() : '';
				DEBUG && log.debug(`title:${toStr(title)}`);

				const bodyEl = querySelector(rootNode, 'body');
				//log.debug(`bodyEl:${toStr(bodyEl)}`); // JSON.stringify got a cyclic data structure
				//log.debug(safeStringify({body: body.html()}));

				const uris = [];
				if (boolFollow) {
					const linkEls = querySelectorAll(bodyEl, "a[href]:not([href^='#']):not([href^='mailto:']):not([href^='tel:'])");
					DEBUG && log.debug(`linkEls.length:${toStr(linkEls.length)}`);
					linksForLoop:
					for (var i = 0; i < linkEls.length; i += 1) {
						const el = linkEls[i];
						//log.debug(`el:${safeStringify(el)}`); // JSON.stringify got a cyclic data structure
						const rel = getAttributeValue(el, 'rel');
						if (rel && rel.toUpperCase().includes('NOFOLLOW')) {
							continue linksForLoop;
						}
						const href = getAttributeValue(el, 'href'); // javascript:void(0)
						DEBUG && log.debug(`href:${toStr(href)}`);

						if (href.startsWith('javascript:')) {
							continue linksForLoop;
						}

						// Galimatias
						const resolved = baseUrlObj.resolve(href);
						TRACE && log.debug(`resolved:${toStr(resolved)}`);

						const resolvedUriObj = new URL(resolved);
						TRACE && log.debug(`resolvedUriObj:${toStr(resolvedUriObj)}`);

						const currentHost = resolvedUriObj.getHost(); // null has no such function "toString" probably because javascript:void(0) doesn't have any host...
						TRACE && log.debug(`currentHost:${toStr(currentHost)}`);

						// jsuri
						/*
						const uriObj = new Uri(href);
						const resolved = resolve(href, uri); //log.debug(toStr({resolved}));
						const resolvedUriObj = new Uri(resolved);
						const currentHost = resolvedUriObj.host(); //log.debug(toStr({currentHost}));
						*/

						// uri-js
						/*
						const resolved = resolve(uri, href); //log.debug(toStr({resolved}));
						const uriObj = parse(resolved); //log.debug(toStr({uriObj}));
						const currentHost = uriObj.host; //log.debug(toStr({host}));
						*/

						if (currentHost === domain) {
							// Galimatias
							const normalized = resolvedUriObj.setFragment('').normalize();
							log.debug(`normalized:${toStr(normalized)}`);

							// jsuri
							//resolvedUriObj.setAnchor('');
							//const normalized = normalizeUrl(resolvedUriObj.toString()); log.debug(toStr({normalized}));
							//const normalized = normalizeUri(resolvedUriObj.toString()); //log.debug(toStr({normalized}));

							// uri-js
							//delete uriObj.fragment;
							//const normalized = normalize(serialize(uriObj)); //log.debug(toStr({normalized}));

							if (!uris.includes(normalized)) {
								uris.push(normalized);
							}
							handleNormalizedUri(normalized);
						}
					} // for linkEls
				} // boolFollow

				if (boolIndex && (!robots || robots.isIndexable('', uri))) {
					const documentToPersist = {
						displayName: title, // This has no field definition by default
						title,
						text: bodyEl.text(),
						uri,
						uris // This has no field definition by default
					};
					TRACE && log.debug(`documentToPersist:${toStr(documentToPersist)}`);
					const persistedDocument = collector.persistDocument(documentToPersist);
					DEBUG && log.debug(`persistedDocument:${toStr(persistedDocument)}`);
				} // indexable
			} // resume ... else
			log.debug(`success uri:${toStr(uri)}`);
			collector.addSuccess({uri});
		} catch (e) {
			log.error(`uri:${uri} message:${e.message}`, e);
			collector.addError({uri, message: e.message});
		} // try ... catch
	} // while


	//──────────────────────────────────────────────────────────────────────────
	// 6. Delete old nodes
	//──────────────────────────────────────────────────────────────────────────
	function deleteOldNodes() {
		const filters = addFilter({
			filter: hasValue('type', [NT_DOCUMENT])
		});
		addFilter({
			clause: 'mustNot',
			filter: hasValue('uri', Object.keys(seenUrisObj)),
			filters
		});
		//log.debug(toStr({filters}));
		const res = query({
			connection: collector.collection.connection,
			count: -1,
			filters,
			query: '',
			sort: null
		});
		//log.debug(`res:${toStr(res)}`); // Huuge!
		//log.debug(`count:${res.count}`);
		//log.debug(`total:${res.total}`);
		//log.debug(`res.hits.length:${toStr(res.hits.length)}`);
		//log.debug(`res.hits[0]:${toStr(res.hits[0])}`);

		const keys = [];
		const nodeId2Uri = {};
		for (let i = 0; i < res.hits.length; i += 1) {
			const node = res.hits[i]; //log.debug(`node:${toStr(node)}`);
			if (node) { // Handle ghost nodes
				const {_id, uri} = node;
				keys.push(_id);
				nodeId2Uri[_id] = uri;
			}
		}
		//log.debug(`keys:${toStr(keys)}`);
		//log.debug(`nodeId2Uri:${toStr(nodeId2Uri)}`);

		if (keys.length) {
			const deleteRes = collector.collection.connection.delete(keys);
			//log.debug(toStr({deleteRes}));
			const uris = deleteRes.map(nodeId => nodeId2Uri[nodeId]);
			//log.debug(toStr({uris}));
			if (uris.length) {
				uris.forEach((uri) => {
					collector.journal.successes.push({uri, message: 'deleted'});
				});
			}
			collector.collection.connection.refresh();
		}
	} // function deleteOldNodes

	if (!collector.shouldStop()) {
		deleteOldNodes();
	}

	collector.stop();
} // function run
