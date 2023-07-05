import type { Node } from '/lib/xp/node';
import type {
	AnyNode,
	Cheerio,
	SelectorType
} from 'cheerio';
import type { Response } from '@enonic-types/lib-explorer';
import type { WebCrawlConfig } from './webcrawl.d';


import 'core-js/stable/array/from';
import 'core-js/stable/object/assign';
import 'core-js/stable/string/includes';
import 'core-js/stable/string/from-code-point';
import 'core-js/stable/string/trim-end';
import 'core-js/stable/array/find';
import 'core-js/stable/array/find-index';
import 'core-js/stable/array/includes';
// TypeError: Object.getOwnPropertyDescriptors is not a function
require('object.getownpropertydescriptors').shim(); // eslint-disable-line @typescript-eslint/no-var-requires

import {
	// VALUE_TYPE_STRING,
	forceArray,
	toStr
} from '@enonic/js-utils';

// Cheerio import causes:
// TypeError: Cannot read property "TYPED_ARRAY_SUPPORT" from undefined
// And requires global to be provided by webpack.
import cheerio from 'cheerio'; // uses Array.from
// cheerio: str.trimEnd is not a function
// import cheerio from '/lib/cheerio';
import { ElementType } from "domelementtype";
// import pretty from 'pretty';

// import safeStringify from 'fast-safe-stringify';
// import {parseDOM} from 'htmlparser2';

// WARNING: Causes TypeError: Cannot read property "Symbol" from undefined in production mode!
// NOTE: Now that the server files are build using tsup, the error seems gone on my laptop.
import { // Runtime Errors with MAP and symbol?
	normalize, parse, resolve, serialize
} from 'uri-js';

// @ts-ignore
import {request as httpClientRequest} from '/lib/http-client';

import {exists} from '/lib/explorer/node/exists';
import {get} from '/lib/explorer/node/get';
import {hash} from '/lib/explorer/string/hash';
import {Collector} from '/lib/explorer/collector/Collector';
import { DEFAULT_UA } from './constants';
import ContentTypeException from './ContentTypeException';
import getRobotsTxt from './getRobotsTxt';
import NotFoundException from './NotFoundException';
import RobotsException from './RobotsException';
import throwIfNotAllowed from './throwIfNotAllowed';
import throwIfNotIndexable from './throwIfNotIndexable';


interface WebCrawlDocument {
	// displayName: string
	links?: string[]
	text: string
	title: string
	url: string
	_id?: string
	html?: string
}

const DEBUG = true;
const TRACE = false;

const querySelector = (
	node: Cheerio<AnyNode>,
	selector: SelectorType
) => cheerio(node.find(selector)[0]);


const querySelectorAll = (
	node: Cheerio<AnyNode>,
	selector: SelectorType
) => node.find(selector).toArray()
	.map((element) => cheerio(element));


const getAttributeValue = (
	node: Cheerio<AnyNode>,
	name: string
) => {
	const attributeValue = node.attr(name);

	if (typeof attributeValue === 'string') {
		return attributeValue;
	}

	// throw new Error(`Could not find a string value attribute:${name}!`);
	return undefined;
};

const remove = (
	node: Cheerio<AnyNode>,
	selector: SelectorType
) => {
	const elsToRemove = querySelectorAll(node, selector);
	elsToRemove.forEach((elToRemove) => {
		// log.info('Removing outerHTML:%s', pretty(outerHTML(elToRemove)));
		elToRemove.remove();
	});
}


const removeDisplayNoneAndVisibilityHidden = (
	node: Cheerio<AnyNode>
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
const outerHTML = (node: Cheerio<AnyNode>) => node.clone().wrap('<div>').parent().html();
// const innerHTML = node => node.html();

const REPLACEMENT = '&#129'; // HOP illegal in html :)
const REPLACE_ALL_REPLACEMENT_REGEXP = new RegExp(`${REPLACEMENT}+`, 'g');
function getText(node: Cheerio<AnyNode>) {
	TRACE && log.debug('getText(%s)', node);
	// Note that while textContent gets the content of all elements, including <script> and <style> elements, innerText, doesn't.
	// innerText is also aware of style and will not return the text of hidden elements, whereas textContent will.
	// log.info('textContent:%s', node.prop('textContent'));
	// log.info('innerText:%s', node.prop('innerText')); // These doesn't seem to be differences in whitespace between textContent and innerText
	TRACE && log.info('getText innerHTML:%s', node.prop('innerHTML'));
	// return node.prop('innerText').replace(/(\r\n|\n|\r)/gm, ' '); // No whitespace bewteen elements :(
	const innerHTML = node.prop('innerHTML');
	if (!innerHTML) {
		DEBUG && log.warning('getText innerHTML is empty!');
		return '';
	}
	return innerHTML
 	// return node
 		// .text() // No whitespace bewteen elements :(
		// .html() // is this the same as innerHTML or outerHTML ?
		// .prop('innerHTML')
 		//.replaceAll(/<\/?[a-zA-Z0-9=" ]*>/g, ' ') // This doesn't handle <!-- --> and more
		// How to handle tags inside comments... <!-- <div></div> -->
		.replace(/<\/?[^>]+>/g, REPLACEMENT)
		//.replace(/\s\s+/g, ' ') // This will replace newlines, tabs etc...
		.replace(REPLACE_ALL_REPLACEMENT_REGEXP, ' ')
		.trim();
}

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

	const collector = new Collector<WebCrawlConfig>({
		collectionId,
		collectorId,
		configJson,
		language,
		name
	});
	if (!collector.config.baseUri) { throw new Error('Config is missing required parameter baseUri!'); }
	collector.start();

	let {
		baseUri,
	} = collector.config;
	const {
		excludes = [],
		keepHtml = false,
		maxPages = 1000,
		resume = false,
		userAgent = DEFAULT_UA
	} = collector.config;
	DEBUG && log.debug('keepHtml:%s', keepHtml);
	DEBUG && log.debug('userAgent:%s', userAgent);

	const excludeRegExps = forceArray(excludes).map(str => new RegExp(str));

	if (!baseUri.includes('://')) { baseUri = `https://${baseUri}`;}
	const entryPointUrlObj = parse(baseUri);

	const normalizedentryPointUrl = normalize(baseUri);
	DEBUG && log.debug('normalizedentryPointUrl:%s', normalizedentryPointUrl);

	const domain = entryPointUrlObj.host;
	DEBUG && log.debug('domain:%s', domain);

	const scheme = entryPointUrlObj.scheme;
	DEBUG && log.debug('scheme:%s', scheme);

	const robots = getRobotsTxt(userAgent, scheme, domain); // object with functions

	const seenUrisObj = {[normalizedentryPointUrl]: true};
	const queueArr = [normalizedentryPointUrl];

	function throwIfExcluded(urlWithoutSchemeAndDomain: string) {
		for (let i = 0; i < excludeRegExps.length; i += 1) {
			if (excludeRegExps[i].test(urlWithoutSchemeAndDomain)) {
				throw new RobotsException(urlWithoutSchemeAndDomain, 'Matches an exclude regexp!');
			}
		}
	}

	function handleNormalizedUri(normalized: string) {
		if (
			!seenUrisObj[normalized]
		) {
			seenUrisObj[normalized] = true;
			queueArr.push(normalized);
			collector.taskProgressObj.total += 1;
		}
	} // handleNormalizedUri

	let pageCounter = 0;
	whileQueueLoop:
	while(queueArr.length) {
		if (pageCounter >= maxPages || collector.shouldStop()) {
			break whileQueueLoop;
		}
		pageCounter += 1;

		const url = queueArr.shift(); // Normalized before added to queue
		DEBUG && log.debug('url:%s', url);

		const baseUrlObj = parse(url);
		// log.debug(toStr({baseUrlObj}));

		try {
			collector.taskProgressObj.info.uri = url; // eslint-disable-line no-param-reassign
			if (resume) {
				collector.taskProgressObj.info.message = `Resuming ${url}`;
				collector.progress();
				collector.taskProgressObj.current += 1; // eslint-disable-line no-param-reassign
				const nodeName = hash(url);
				if (exists({
					connection: collector.collection.connection,
					_parentPath: '/',
					_name: nodeName
				})) {
					const node = get<WebCrawlDocument>({
						connection: collector.collection.connection,
						_name: nodeName
					});
					const {links} = node as Node<WebCrawlDocument>;
					forceArray(links).forEach(normalized => handleNormalizedUri(normalized));
				} // exists
			} else { // !resume
				collector.taskProgressObj.info.message = `Processing ${url}`;
				collector.progress();
				collector.taskProgressObj.current += 1; // eslint-disable-line no-param-reassign
				throwIfNotAllowed({
					robots,
					path: baseUrlObj.path,
					userAgent
				});
				const urlWithoutSchemeAndDomain = url
					.replace(/^.*?:\/\//, '') // scheme http://
					.replace(/^.*?\//, '/') // domain www.enonic.com
				TRACE && log.debug('urlWithoutSchemeAndDomain:%s', urlWithoutSchemeAndDomain);
				throwIfExcluded(urlWithoutSchemeAndDomain);
				const res = httpClientRequest({
					followRedirects: true, // https://www.enonic.com uses 302
					headers: { // HTTP/2 uses lowercase header keys
						'user-agent': userAgent
					},
					url
				}) as Response; TRACE && log.debug('res:%s', toStr(res));

				if (res.status === 404) {
					throw new NotFoundException(url);
				}

				if (res.status != 200) {
					throw new Error(`Status: ${res.status}!`);
				}

				if (!res.contentType.includes('html')) {
					throw new ContentTypeException(url, `ContentType:${res.contentType} does not include html!`);
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
							throw new RobotsException(url, `HTTP header X-Robots-Tag:${res.headers['X-Robots-Tag']} includes both NOFOLLOW and NOINDEX`);
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
								throw new RobotsException(url, `Found both NOFOLLOW and NOINDEX in ${robotsMetaHtml}`);
							}
						}
						if (robotsMetaUc.includes('NOINDEX')) {
							boolIndex = false;
						}
						if(!boolFollow && !boolIndex) {
							throw new RobotsException(url, `Found both NOFOLLOW and NOINDEX combined from HTTP header X-Robots-Tag:${res.headers['X-Robots-Tag']} and ${robotsMetaHtml}`);
						}
					}
				}
				DEBUG && log.debug(`boolFollow:${toStr(boolFollow)}`);
				DEBUG && log.debug(`boolIndex:${toStr(boolIndex)}`);

				const titleEl = querySelector(headEl, 'title');
				// log.debug(`titleEl:${toStr(titleEl)}`); // JSON.stringify got a cyclic data structure

				const title = titleEl ? getText(titleEl) : '';
				DEBUG && log.debug(`title:${toStr(title)}`);

				const bodyElWithNothingRemoved = querySelector(rootNode, 'body');
				const cleanedBodyEl = bodyElWithNothingRemoved.clone();

				// Remove all elements except tags and text
				cleanedBodyEl.find('*').contents().filter(
					(_i, el) => !(
						el.type === ElementType.Tag
						|| el.type === ElementType.Text
					)
				).remove();

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

				const links = [];
				if (boolFollow) {
					const linkEls = querySelectorAll(bodyElWithNothingRemoved, "a[href]:not([href^='#']):not([href^='mailto:']):not([href^='tel:']):not([href^='content:'])");
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

						try {
							if (href.startsWith('javascript:')) {
								continue linksForLoop;
							}

							const resolved = resolve(url, href);
							DEBUG && log.debug('resolved:%s', resolved);

							const uriObj = parse(resolved);
							DEBUG && log.debug('uriObj:%s', uriObj);

							const currentHost = uriObj.host;
							DEBUG && log.debug('currentHost:%s', currentHost);

							if (currentHost === domain) {
								delete uriObj.fragment;
								const normalized = normalize(serialize(uriObj));
								DEBUG && log.debug('normalized:%s', normalized);

								if (!links.includes(normalized)) {
									links.push(normalized);
								}
								handleNormalizedUri(normalized);
							}
						} catch (e) {
							// Just log and ignore links that we don't support
							log.error(`${url}: Something went wrong while processing a[href]:${href} ${e.message}`, e);
						} // try/catch
					} // for linkEls
				} // boolFollow

				if (boolIndex) {
					throwIfNotIndexable({
						path: baseUrlObj.path,
						robots,
						userAgent
					});
					const documentToPersist: {
						// displayName: string
						links?: string[]
						text: string
						title: string
						url: string
						_id?: string
						html?: string
					} = {
						// displayName: title, // This has no field definition by default
						links,
						text: getText(cleanedBodyEl),
						title,
						url,
					};
					if (keepHtml) {
						documentToPersist.html = res.body;
					}
					TRACE && log.debug('documentToPersist:%s', toStr(documentToPersist));

					// Check if any document with url exists
					const queryDocumentsParams = {
						aggregations: null,
						count: -1,
						filters: null,
						query: {
							boolean: {
								must: {
									term: {
										field: 'url',
										value: url
									}
								}
							}
						},
						sort: null,
						start: null
					};
					const documentsRes = collector.queryDocuments(queryDocumentsParams);
					// log.debug('webcrawl documentsRes:%s', toStr(documentsRes));
					// log.error('webcrawl queryDocumentsParams:%s documentsRes:%s', queryDocumentsParams, documentsRes);

					if (documentsRes.total > 1) {
						for (let i = 0; i < documentsRes.hits.length; i++) {
							const {id} = documentsRes.hits[i]
							const {url: anUrl} = collector.getDocumentNode(id);
							if (anUrl === url) { // Direct case sensitive match
								documentToPersist._id = documentsRes.hits[0].id;
							}
						}
						if (!documentToPersist._id) { // This means create rather than update
							log.debug(`Unable to find a case sensitive match for url among documents with ids:${
								toStr(documentsRes.hits.map(({id}) => id))
							}`);
						}
					} else if (documentsRes.total === 1) {
						// Provide which document node to update (rather than creating a new document node)
						documentToPersist._id = documentsRes.hits[0].id;
					}

					// log.error('documentToPersist:%s', documentToPersist);
					const persistedDocument = collector.persistDocument(
						documentToPersist, {
							// Must be identical to a _name in src/main/resources/documentTypes.json
							documentTypeName: 'webpage'
						}
					);
					DEBUG && log.debug('persistedDocument:%s', toStr(persistedDocument));
				} // indexable
			} // resume ... else
			log.debug(`success url:${toStr(url)}`);
			collector.addSuccess({message: url});
		} catch (e) {
			if (e.name === 'RobotsException') {
				collector.addInformation({message: e.message});
			} else if (e.name === 'NotFoundException') {
				collector.addWarning({message: e.message});
			} else if (e.name === 'ContentTypeException') {
				collector.addInformation({message: e.message});
			} else {
				log.error(`url:${url} message:${e.message}`, e);
				collector.addError({message: `url:${url} ${e.message}`});
			}
		} // try ... catch
	} // while

	// ─────────────────────────────────────────────────────────────────────────
	// 6. Delete old nodes
	// ─────────────────────────────────────────────────────────────────────────
	function deleteOldNodes() {
		/*const filters = addQueryFilter({
			clause: 'mustNot',
			filter: hasValue('url', Object.keys(seenUrisObj))
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
							field: 'url',
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
			const idsToDelete: string[] = [];
			const pathsToDelete: string[] = [];
			const nodeId2Uri: Record<string,string> = {};
			for (let i = 0; i < res.hits.length; i += 1) {
				const {id} = res.hits[i];

				const node = collector.collection.connection.get<{
					_path: string
					url: string
				}>(id);
				// log.debug('node:%s', toStr(node));

				if (node) { // Handle ghost nodes
					const {_path, url} = node;
					idsToDelete.push(id);
					pathsToDelete.push(_path);
					nodeId2Uri[id] = url;
				}
			}
			// log.debug(`nodeId2Uri:${toStr(nodeId2Uri)}`);

			if (idsToDelete.length) {
				DEBUG && log.debug('deleting ids:%s paths:%s', toStr(idsToDelete), toStr(pathsToDelete));
				const deleteRes = collector.collection.connection.delete(idsToDelete);
				// log.debug(toStr({deleteRes}));
				const urls = deleteRes.map(nodeId => nodeId2Uri[nodeId]);
				// log.debug(toStr({uris}));
				if (urls.length) {
					urls.forEach((url) => {
						collector.journal.successes.push({message: `url:${url} deleted`});
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
