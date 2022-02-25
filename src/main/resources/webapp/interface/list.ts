import type {Request} from '../../types/Request';

import {
	RESPONSE_TYPE_HTML,
	toStr
} from '@enonic/js-utils';


export function list(request :Request) {
	log.debug('request:%s', toStr(request));
	return {
		body: `<html>
	<head>
		<title>Interfaces - Version 1 - API documentation</title>
	</head>
	<body>
		<h1>API documentation</h1>
		<h2>Interfaces</h2>
		<ul>
			<li><a href="/api/v1">..</a></li>
		</ul>
	</body>
</html>`,
		contentType: RESPONSE_TYPE_HTML
	};
}
