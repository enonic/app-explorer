// TypeError: Object.getOwnPropertyDescriptors is not a function
require('object.getownpropertydescriptors').shim();

//import 'babel-es6-polyfill'; // TypeError: Cannot read property "document" from undefined

// Polyfill Reflect to avoid "Reflect" not defined.
// But introduces: TypeError: null has no such function "ownKeys"
//var Reflect = require('harmony-reflect');

//'use strict'; // This doesn't help debugging: TypeError: Cannot read property "Symbol" from undefined

//import 'symbol-es6'; // This does not fix: TypeError: Cannot read property "Symbol" from undefined

require('array.prototype.find').shim();
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
import {toStr} from '/lib/util';

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

const textContent = node => node.text();
const outerHTML = node => node.clone().wrap('<div>').parent().html();
const innerHTML = node => node.html();


export function run({
	name, // Collection name
	collectorId,
	configJson
}) {
	DEBUG && log.info(toStr({name, collectorId, configJson}));

	const collector = new Collector({name, collectorId, configJson});
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
	DEBUG && log.info(`userAgent:${userAgent}`);

	const excludeRegExps = excludes.map(str => new RegExp(str));

	// Galimatias
	if (!baseUri.includes('://')) { baseUri = `https://${baseUri}`;}
	const entryPointUrlObj = new URL(baseUri);

	const normalizedentryPointUrl = entryPointUrlObj.normalize();
	DEBUG && log.info(`normalizedentryPointUrl:${normalizedentryPointUrl}`);

	const domain = entryPointUrlObj.getHost();
	DEBUG && log.info(`domain:${domain}`);

	const scheme = entryPointUrlObj.getScheme();
	DEBUG && log.info(`scheme:${scheme}`);

	// jsuri
	/*
	const entryPointUrlObj = new Uri(baseUri); //log.info(toStr({entryPointUrlObj}));
	const domain = entryPointUrlObj.host(); //log.info(`domain:${domain}`);
	const scheme = entryPointUrlObj.protocol(); //log.info(`scheme:${scheme}`);
	*/

	// uri-js
	/*
	const entryPointUrlObj = parse(baseUri)
	const domain = entryPointUrlObj.host; //log.info(toStr({domain}));
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
	}; DEBUG && log.info(toStr({robotsReq}));
	const robotsRes = httpClientRequest(robotsReq); //log.info(toStr({robotsRes}));
	let robots;
	if(robotsRes.status === 200 && robotsRes.contentType === 'text/plain') {
		robots = guard(parseRobotsTxt(robotsRes.body));
	}
	DEBUG && log.info(toStr({robots}));

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
		DEBUG && log.info(`uri:${uri}`);

		const baseUrlObj = new URL(uri);
		//log.info(toStr({baseUrlObj}));

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
					uris.Each(normalized => handleNormalizedUri(normalized));
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
				}); //log.info(toStr({res}));
				if (res.status != 200) {
					throw new Error(`Status: ${res.status}!`);
				}
				if (!res.contentType.includes('html')) {
					throw new Error(`ContentType:${res.contentType} does not include html!`);
				}

				// X-Robots-Tag HTTP header http://www.searchtools.com/robots/x-robots-tag.html
				//log.info(toStr({headers: res.headers}));
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
				//log.info(toStr({boolFollow, boolIndex}));

				//const dom = parseDOM(res.body, options);
				const rootNode = cheerio.load(res.body, {
					xmlMode: false
				}).root(); //log.info(safeStringify({rootNode})); // Huuuuuuuge!!!
				//log.info(safeStringify({html: rootNode.html()}));

				const headEl = querySelector(rootNode, 'head');
				//log.info(safeStringify({head: head.html()}));

				// Robots <META> tag http://www.searchtools.com/robots/robots-meta.html
				const robotsMetaEl = querySelector(headEl, 'meta[name=robots]');
				if (robotsMetaEl) {
					const robotsMetaHtml = outerHTML(robotsMetaEl);
					//log.info(toStr({robotsMetaHtml}));
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
				//log.info(toStr({boolFollow, boolIndex}));

				const titleEl = querySelector(headEl, 'title');
				const title = titleEl ? titleEl.text() : '';

				const bodyEl = querySelector(rootNode, 'body');
				//log.info(safeStringify({body: body.html()}));

				const uris = [];
				if (boolFollow) {
					const linkEls = querySelectorAll(bodyEl, "a[href]:not([href^='#']):not([href^='mailto:']):not([href^='tel:'])");
					linksForLoop:
					for (var i = 0; i < linkEls.length; i += 1) {
						const el = linkEls[i];
						const rel = getAttributeValue(el, 'rel');
						if (rel && rel.toUpperCase().includes('NOFOLLOW')) {
							continue linksForLoop;
						}
						const href = getAttributeValue(el, 'href');

						// Galimatias
						const resolved = baseUrlObj.resolve(href); //log.info(toStr({resolved}));
						const resolvedUriObj = new URL(resolved);
						const currentHost = resolvedUriObj.getHost(); //log.info(toStr({currentHost}));

						// jsuri
						/*
						const uriObj = new Uri(href);
						const resolved = resolve(href, uri); //log.info(toStr({resolved}));
						const resolvedUriObj = new Uri(resolved);
						const currentHost = resolvedUriObj.host(); //log.info(toStr({currentHost}));
						*/

						// uri-js
						/*
						const resolved = resolve(uri, href); //log.info(toStr({resolved}));
						const uriObj = parse(resolved); //log.info(toStr({uriObj}));
						const currentHost = uriObj.host; //log.info(toStr({host}));
						*/

						if (currentHost === domain) {
							// Galimatias
							const normalized = resolvedUriObj.setFragment('').normalize(); //log.info(toStr({normalized}));

							// jsuri
							//resolvedUriObj.setAnchor('');
							//const normalized = normalizeUrl(resolvedUriObj.toString()); log.info(toStr({normalized}));
							//const normalized = normalizeUri(resolvedUriObj.toString()); //log.info(toStr({normalized}));

							// uri-js
							//delete uriObj.fragment;
							//const normalized = normalize(serialize(uriObj)); //log.info(toStr({normalized}));

							if (!uris.includes(normalized)) {
								uris.push(normalized);
							}
							handleNormalizedUri(normalized);
						}
					} // for linkEls
				} // boolFollow

				if (boolIndex && (!robots || robots.isIndexable('', uri))) {
					collector.persistDocument({
						displayName: title,
						title,
						text: bodyEl.text(),
						uri,
						uris
					});
				} // indexable
			} // resume ... else
			//log.info(`success:${uri}`);
			collector.addSuccess({uri});
		} catch (e) {
			//log.error(`uri:${uri} message:${e.message}`);
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
		//log.info(toStr({filters}));
		const res = query({
			connection: collector.collection.connection,
			count: -1,
			filters,
			query: '',
			sort: null
		});
		//log.info(`res:${toStr(res)}`); // Huuge!
		//log.info(`count:${res.count}`);
		//log.info(`total:${res.total}`);
		//log.info(`res.hits.length:${toStr(res.hits.length)}`);
		//log.info(`res.hits[0]:${toStr(res.hits[0])}`);

		const keys = [];
		const nodeId2Uri = {};
		for (let i = 0; i < res.hits.length; i += 1) {
			const node = res.hits[i]; //log.info(`node:${toStr(node)}`);
			if (node) { // Handle ghost nodes
				const {_id, uri} = node;
				keys.push(_id);
				nodeId2Uri[_id] = uri;
			}
		}
		//log.info(`keys:${toStr(keys)}`);
		//log.info(`nodeId2Uri:${toStr(nodeId2Uri)}`);

		if (keys.length) {
			const deleteRes = collector.collection.connection.delete(keys);
			//log.info(toStr({deleteRes}));
			const uris = deleteRes.map(nodeId => nodeId2Uri[nodeId]);
			//log.info(toStr({uris}));
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
