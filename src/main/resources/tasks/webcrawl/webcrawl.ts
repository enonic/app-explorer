import type {
	AnyNode,
	Cheerio,
	SelectorType
} from 'cheerio';
import type {
	HttpClientRequest,
	Response
} from '/lib/explorer/types/index.d';


import 'core-js/stable/array/from';
import 'core-js/stable/object/assign';
import 'core-js/stable/string/includes';
import 'core-js/stable/string/from-code-point';
import 'core-js/stable/string/trim-end';
import 'core-js/stable/array/includes';
import 'core-js/stable/array/find-index';
// import 'core-js-pure/actual/array/from';
// import 'core-js-pure/actual/object/assign'; // Doesn't work
// TypeError: Object.getOwnPropertyDescriptors is not a function
require('object.getownpropertydescriptors').shim(); // eslint-disable-line @typescript-eslint/no-var-requires

// import 'babel-es6-polyfill'; // TypeError: Cannot read property "document" from undefined

// Polyfill Reflect to avoid "Reflect" not defined.
// But introduces: TypeError: null has no such function "ownKeys"
// var Reflect = require('harmony-reflect');

// 'use strict'; // This doesn't help debugging: TypeError: Cannot read property "Symbol" from undefined

// import 'symbol-es6'; // This does not fix: TypeError: Cannot read property "Symbol" from undefined

require('array.prototype.find').shim(); // eslint-disable-line @typescript-eslint/no-var-requires
import {
	// VALUE_TYPE_STRING,
	toStr
} from '@enonic/js-utils';
import guard from 'robots-txt-guard';

// Cheerio import causes:
// TypeError: Cannot read property "TYPED_ARRAY_SUPPORT" from undefined
// And requires global to be provided by webpack.
import cheerio from 'cheerio'; // uses Array.from
// cheerio: str.trimEnd is not a function
// import cheerio from '/lib/cheerio';
import pretty from 'pretty';

// import safeStringify from 'fast-safe-stringify';
// import {parseDOM} from 'htmlparser2';

// WARNING Causes TypeError: Cannot read property "Symbol" from undefined in production mode!
/*import { // Runtime Errors with MAP and symbol?
	normalize, parse, resolve, serialize
} from 'uri-js/src/uri.ts';
// 'uri-js/dist/esnext/uri.js';
// 'uri-js';*/

// import normalizeUrl from 'normalize-url'; // Uses reflect :(
// import normalizeUri from 'normalize-uri';
// import normalizeUrl from 'conservative-normalize-url';
// import {resolve} from 'relative-to-absolute-iri';
// import Uri from 'jsuri';
// @ts-ignore
import {URL} from '/lib/galimatias';
// @ts-ignore
import {request as httpClientRequest} from '/lib/http-client';

import {exists} from '/lib/explorer/node/exists';
import {get} from '/lib/explorer/node/get';
import {hash} from '/lib/explorer/string/hash';

import {Collector} from '/lib/explorer/collector/Collector';

import {parseRobotsTxt} from './parseRobotsTxt';


type RobotsTxt = {
	isAllowed :(userAgent :string, path :string) => boolean
	isDisallowAll :(userAgent :string) => boolean
	isIndexable :(userAgent :string, path :string) => boolean
}

type Url = {
	getHost :() => string
	getScheme :() => string
	normalize :() => string
}


/*function normalizeUri(uri) {
  return encodeURI(decodeURI(uri))
}*/


const DEBUG = false;
const TRACE = false;

const DEFAULT_UA = 'Mozilla/5.0 (compatible; Enonic XP Explorer Collector Web crawler/1.0.0)';


const querySelector = (
	node :Cheerio<AnyNode>,
	selector :SelectorType
) => cheerio(node.find(selector)[0]);


const querySelectorAll = (
	node :Cheerio<AnyNode>,
	selector :SelectorType
) => node.find(selector).toArray()
	.map((element) => cheerio(element));


const getAttributeValue = (
	node :Cheerio<AnyNode>,
	name :string
) => {
	const attributeValue = node.attr(name);

	if (typeof attributeValue === 'string') {
		return attributeValue;
	}

	// throw new Error(`Could not find a string value attribute:${name}!`);
	return undefined;
};

const remove = (
	node :Cheerio<AnyNode>,
	selector :SelectorType
) => {
	const elsToRemove = querySelectorAll(node, selector);
	elsToRemove.forEach((elToRemove) => {
		// log.info('Removing outerHTML:%s', pretty(outerHTML(elToRemove)));
		elToRemove.remove();
	});
}


const removeDisplayNoneAndVisibilityHidden = (
	node :Cheerio<AnyNode>
) => {
	const elsWithStyleAttribute = querySelectorAll(node, '[style]');
	for (let i = 0; i < elsWithStyleAttribute.length; i++) {
		const elWithStyleAttribute = elsWithStyleAttribute[i];
		// log.info('Looking at outerHTML:%s', pretty(outerHTML(elWithStyleAttribute)));

		// const styleValue = getAttributeValue(elWithStyleAttribute, 'style');
		// log.info('styleValue:%s', toStr(styleValue));

		const {
			display,
			visibility
		} = elWithStyleAttribute.css(['display', 'visibility']);

		// const display = elWithStyleAttribute.css('display');
		// log.info('display:%s', toStr(display));

		// const visibility = elWithStyleAttribute.css('visibility');
		// log.info('visibility:%s', toStr(visibility));

		if (
			display === 'none'
			|| visibility === 'hidden'
		) {
			// log.info('Removing outerHTML:%s', pretty(outerHTML(elWithStyleAttribute)));
			elWithStyleAttribute.remove();
		}
	}
}

// const textContent = node => node.text();
const outerHTML = (node :Cheerio<AnyNode>) => node.clone().wrap('<div>').parent().html();
// const innerHTML = node => node.html();


export function run({
	collectionId,
	collectorId,
	configJson,
	language,
	name // Collection name
}) {
	// log.debug('webcrawl: collectionId:%s', collectionId);
	// log.debug('webcrawl: collectorId:%s', collectorId);
	// log.debug('webcrawl: configJson:%s', configJson);
	// log.debug('webcrawl: language:%s', language);
	// log.debug('webcrawl: name:%s', name);

	const collector = new Collector<{
		baseUri :string
		excludes ?:Array<string>
		resume ?:boolean
		userAgent ?:string
	}>({
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
	DEBUG && log.debug('userAgent:%s', userAgent);

	const excludeRegExps = excludes.map(str => new RegExp(str));

	// Galimatias
	if (!baseUri.includes('://')) { baseUri = `https://${baseUri}`;}
	const entryPointUrlObj :Url = new URL(baseUri);

	const normalizedentryPointUrl = entryPointUrlObj.normalize();
	DEBUG && log.debug('normalizedentryPointUrl:%s', normalizedentryPointUrl);

	const domain = entryPointUrlObj.getHost();
	DEBUG && log.debug('domain:%s', domain);

	const scheme = entryPointUrlObj.getScheme();
	DEBUG && log.debug('scheme:%s', scheme);

	// jsuri
	/*
	const entryPointUrlObj = new Uri(baseUri); // log.debug(toStr({entryPointUrlObj}));
	const domain = entryPointUrlObj.host(); // log.debug(`domain:${domain}`);
	const scheme = entryPointUrlObj.protocol(); // log.debug(`scheme:${scheme}`);
	*/

	// uri-js
	/*
	const entryPointUrlObj = parse(baseUri)
	const domain = entryPointUrlObj.host; // log.debug(toStr({domain}));
	const scheme = entryPointUrlObj.scheme;
	*/

	const robotsReq :HttpClientRequest = {
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
	DEBUG && log.debug('robotsReq:%s', toStr(robotsReq));

	const robotsRes = httpClientRequest(robotsReq) as Response; // log.debug(toStr({robotsRes}));
	let robots :RobotsTxt;
	if(robotsRes.status === 200 && robotsRes.contentType === 'text/plain') {
		robots = guard(parseRobotsTxt(robotsRes.body));
	}
	DEBUG && log.debug('robots:%s', toStr(robots));

	const seenUrisObj = {[normalizedentryPointUrl]: true};
	const queueArr = [normalizedentryPointUrl];

	function throwIfExcluded(normalized :string) {
		for (let i = 0; i < excludeRegExps.length; i += 1) {
			if (excludeRegExps[i].test(normalized)) {
				throw new Error('Matches an exclude regexp!');
			}
		}
	}

	function handleNormalizedUri(normalized :string) {
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
		DEBUG && log.debug('uri:%s', uri);

		const baseUrlObj = new URL(uri);
		// log.debug(toStr({baseUrlObj}));

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
					const node = get<{
						uris :Array<string>
					}>({
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
				}) as Response; TRACE && log.debug('res:%s', toStr(res));
				if (res.status != 200) {
					throw new Error(`Status: ${res.status}!`);
				}
				if (!res.contentType.includes('html')) {
					throw new Error(`ContentType:${res.contentType} does not include html!`);
				}

				// X-Robots-Tag HTTP header http://www.searchtools.com/robots/x-robots-tag.html
				// log.debug(toStr({headers: res.headers}));
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
				// log.debug(toStr({boolFollow, boolIndex}));

				// const dom = parseDOM(res.body, options);
				const rootNode = cheerio.load(res.body, {
					// decodeEntities: true, // If set to true, entities within the document will be decoded. Defaults to true.
					// lowerCaseAttributeNames: false,// If set to true, all attribute names will be lowercased. This has noticeable impact on speed, so it defaults to false.
					lowerCaseTags: true, // If set to true, all tags will be lowercased. If xmlMode is disabled, this defaults to true.
					// normalizeWhitespace: true, // Removes NEWLINES, but there are still multiple spaces
					// scriptingEnabled: false, // Disable scripting in parse5, so noscript tags would be parsed.
					xmlMode: false // Tags are lowercased // When xmlMode is false noscript tags are in the dom, but it's content doesn't show up in querySelector!
					// xmlMode: true // Avoid stripping noscript tags?
				}).root(); // log.debug(safeStringify({rootNode})); // Huuuuuuuge!!!
				// log.debug(safeStringify({html: rootNode.html()}));

				const headEl = querySelector(rootNode, 'head');
				// log.debug(safeStringify({head: head.html()}));

				// Robots <META> tag http://www.searchtools.com/robots/robots-meta.html
				const robotsMetaEl = querySelector(headEl, 'meta[name=robots]');
				if (robotsMetaEl) {
					const robotsMetaHtml = outerHTML(robotsMetaEl);
					// log.debug(toStr({robotsMetaHtml}));
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
				// log.debug(`titleEl:${toStr(titleEl)}`); // JSON.stringify got a cyclic data structure

				const title = titleEl ? titleEl.text() : '';
				DEBUG && log.debug(`title:${toStr(title)}`);

				const bodyElWithNothingRemoved = querySelector(rootNode, 'body');
				const cleanedBodyEl = bodyElWithNothingRemoved.clone();
				remove(cleanedBodyEl, 'aside');
				remove(cleanedBodyEl, 'footer');
				remove(cleanedBodyEl, 'noscript'); // This works
				remove(cleanedBodyEl, 'nav');
				remove(cleanedBodyEl, 'script');

				// It seems Cheerio doesn't support *= selectors
				// remove(cleanedBodyEl, '[style*="display:none"]');
				// remove(cleanedBodyEl, '[style*="display: none"]');
				// remove(cleanedBodyEl, '[style*="visibility:hidden"]');
				// remove(cleanedBodyEl, '[style*="visibility: hidden"]');
				removeDisplayNoneAndVisibilityHidden(cleanedBodyEl);
				// throw new Error('DEBUG');

				remove(cleanedBodyEl, '[aria-hidden=true]');
				remove(cleanedBodyEl, '[hidden]');

				// log.debug(`cleanedBodyEl:${toStr(cleanedBodyEl)}`); // JSON.stringify got a cyclic data structure
				// log.debug(safeStringify({body: body.html()}));

				const uris = [];
				if (boolFollow) {
					const linkEls = querySelectorAll(bodyElWithNothingRemoved, "a[href]:not([href^='#']):not([href^='mailto:']):not([href^='tel:'])");
					DEBUG && log.debug('linkEls.length:%s', linkEls.length);
					linksForLoop:
					for (let i = 0; i < linkEls.length; i += 1) {
						const el = linkEls[i];
						// log.debug(`el:${safeStringify(el)}`); // JSON.stringify got a cyclic data structure
						const rel = getAttributeValue(el, 'rel');
						if (rel && rel.toUpperCase().includes('NOFOLLOW')) {
							continue linksForLoop;
						}
						const href = getAttributeValue(el, 'href'); // javascript:void(0)
						DEBUG && log.debug('href:%s', href);

						if (href.startsWith('javascript:')) {
							continue linksForLoop;
						}

						// Galimatias
						const resolved = baseUrlObj.resolve(href);
						TRACE && log.debug('resolved:%s', toStr(resolved));

						const resolvedUriObj = new URL(resolved);
						TRACE && log.debug('resolvedUriObj:%s', toStr(resolvedUriObj));

						const currentHost = resolvedUriObj.getHost(); // null has no such function "toString" probably because javascript:void(0) doesn't have any host...
						TRACE && log.debug('currentHost:%s', toStr(currentHost));

						// jsuri
						/*
						const uriObj = new Uri(href);
						const resolved = resolve(href, uri); // log.debug(toStr({resolved}));
						const resolvedUriObj = new Uri(resolved);
						const currentHost = resolvedUriObj.host(); // log.debug(toStr({currentHost}));
						*/

						// uri-js
						/*
						const resolved = resolve(uri, href); // log.debug(toStr({resolved}));
						const uriObj = parse(resolved); // log.debug(toStr({uriObj}));
						const currentHost = uriObj.host; // log.debug(toStr({host}));
						*/

						if (currentHost === domain) {
							// Galimatias
							const normalized = resolvedUriObj.setFragment('').normalize();
							DEBUG && log.debug('webcrawl: normalized:%s', toStr(normalized));

							// jsuri
							// resolvedUriObj.setAnchor('');
							// const normalized = normalizeUrl(resolvedUriObj.toString()); log.debug(toStr({normalized}));
							// const normalized = normalizeUri(resolvedUriObj.toString()); // log.debug(toStr({normalized}));

							// uri-js
							// delete uriObj.fragment;
							// const normalized = normalize(serialize(uriObj)); // log.debug(toStr({normalized}));

							if (!uris.includes(normalized)) {
								uris.push(normalized);
							}
							handleNormalizedUri(normalized);
						}
					} // for linkEls
				} // boolFollow

				if (boolIndex && (!robots || robots.isIndexable('', uri))) {
					const documentToPersist :{
						// displayName :string
						text :string
						title :string
						uri :string
						uris :Array<string>
						_id ?:string
					} = {
						// displayName: title, // This has no field definition by default
						text: cleanedBodyEl.text(),
						title,
						uri,
						uris // This has no field definition by default
					};
					TRACE && log.debug('documentToPersist:%s', toStr(documentToPersist));

					// Check if any document with uri exists
					const documentsRes = collector.queryDocuments({
						aggregations: null,
						count: 1,
						filters: null,
						query: {
							boolean: {
								must: {
									term: {
										field: 'uri',
										value: uri
									}
								}
							}
						},
						sort: null,
						start: null
					});
					// log.debug('webcrawl documentsRes:%s', toStr(documentsRes));

					if (documentsRes.total > 1) {
						throw new Error(`Multiple documents found with uri:${uri}! uri is supposed to be unique!`);
					} else if (documentsRes.total === 1) {
						// Provide which document node to update (rather than creating a new document node)
						documentToPersist._id = documentsRes.hits[0].id;
					}

					const persistedDocument = collector.persistDocument(
						documentToPersist, {
							// Must be identical to a _name in src/main/resources/documentTypes.json
							documentTypeName: 'webpage'
						}
					);
					DEBUG && log.debug('persistedDocument:%s', toStr(persistedDocument));
				} // indexable
			} // resume ... else
			log.debug(`success uri:${toStr(uri)}`);
			collector.addSuccess({message: uri});
		} catch (e) {
			log.error(`uri:${uri} message:${e.message}`, e);
			collector.addError({message: `uri:${uri} ${e.message}`});
		} // try ... catch
	} // while


	// ─────────────────────────────────────────────────────────────────────────
	// 6. Delete old nodes
	// ─────────────────────────────────────────────────────────────────────────
	function deleteOldNodes() {
		/*const filters = addQueryFilter({
			clause: 'mustNot',
			filter: hasValue('uri', Object.keys(seenUrisObj))
		});*/
		// log.debug(toStr({filters}));
		const res = collector.queryDocuments({
			aggregations: null,
			count: -1,
			filters: null,
			query: {
				boolean: {
					mustNot: {
						in: {
							field: 'uri',
							values: Object.keys(seenUrisObj)
						}
					}
				}
			},
			sort: null,
			start: null
		});
		// log.debug(`res:${toStr(res)}`); // Huuge!
		TRACE && log.debug('count:%s total:%s res.hits.length:%s', res.count, res.total, res.hits.length);

		if (res.hits.length) {
			TRACE && log.debug(`res.hits[0]:${toStr(res.hits[0])}`);
			const idsToDelete = [];
			const pathsToDelete = [];
			const nodeId2Uri = {};
			for (let i = 0; i < res.hits.length; i += 1) {
				const {id} = res.hits[i];

				const node = collector.collection.connection.get<{
					_path :string
					uri :string
				}>(id);
				// log.debug('node:%s', toStr(node));

				if (node) { // Handle ghost nodes
					const {_path, uri} = node;
					idsToDelete.push(id);
					pathsToDelete.push(_path);
					nodeId2Uri[id] = uri;
				}
			}
			// log.debug(`nodeId2Uri:${toStr(nodeId2Uri)}`);

			if (idsToDelete.length) {
				DEBUG && log.debug('deleting ids:%s paths:%s', toStr(idsToDelete), toStr(pathsToDelete));
				const deleteRes = collector.collection.connection.delete(idsToDelete);
				// log.debug(toStr({deleteRes}));
				const uris = deleteRes.map(nodeId => nodeId2Uri[nodeId]);
				// log.debug(toStr({uris}));
				if (uris.length) {
					uris.forEach((uri) => {
						collector.journal.successes.push({message: `uri:${uri} deleted`});
					});
				}
				collector.collection.connection.refresh();
			}
		} // if res.hits.length
	} // function deleteOldNodes

	if (!collector.shouldStop()) {
		deleteOldNodes();
	}

	collector.stop();
} // function run
