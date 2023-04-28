import type {
	EmptyObject,
	EnonicXpRequest
} from '@enonic-types/lib-explorer';



import {
	//RESPONSE_TYPE_JSON,
	RESPONSE_TYPE_HTML//,
	//toStr
} from '@enonic/js-utils';
import {resolve} from 'uri-js';


export type GetCollectionRequest = EnonicXpRequest<EmptyObject, {
	collection :string
}>


export function get(request :GetCollectionRequest) {
	//log.debug(`request:${toStr(request)}`);
	const {
		path/*,
		pathParams: {
			collection
		}*/
	} = request;
	//log.debug('path:%s', path);
	//log.debug(`collection:${toStr(collection)}`);
	// I don't understand why '/collections/collection/anapicollection' is
	// resolved to '/collections/' and not '/collections/collection/',
	// but if it works, it works, right?
	const collectionsHref = resolve(path, '..');
	return {
		body: `<html>
	<head>
		<title>Endpoints - Version 1 - API documentation</title>
	</head>
	<body>
		<h1>API documentation</h1>
		<h2>Endpoints</h2>
		<ul>
			<li><a href="${collectionsHref}">..</a></li>
			<li><a href="${path}/documents">documents</a></li>
		</ul>
	</body>
</html>`,
		contentType: RESPONSE_TYPE_HTML
	};
} // get
