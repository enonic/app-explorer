import {
	RESPONSE_TYPE_HTML,
	toStr
} from '@enonic/js-utils';


export function collectionResponse(request) {
	log.debug(`request:${toStr(request)}`);
	const {
		pathParams: {
			collection
		}
	} = request;
	log.debug(`collection:${toStr(collection)}`);
	return {
		body: `<html>
	<head>
		<title>Endpoints - Version 1 - API documentation</title>
	</head>
	<body>
		<h1>API documentation</h1>
		<h2>Endpoints</h2>
		<ul>
			<li><a href="/api/v1/collections/${collection}/documents">documents</a></li>
		</ul>
	</body>
</html>`,
		contentType: RESPONSE_TYPE_HTML
	};
}
