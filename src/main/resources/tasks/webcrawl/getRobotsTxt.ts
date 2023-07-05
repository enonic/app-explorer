import type {
	HttpClientRequest,
	Response
} from '@enonic-types/lib-explorer';
import type { RobotsTxt } from './webcrawl.d';


import {
	startsWith,
	// toStr
} from '@enonic/js-utils';
import guard from 'robots-txt-guard';
// TODO: Perhaps use robots-parser instead of robots-txt-guard?
// @ts-ignore
import {request as httpClientRequest} from '/lib/http-client';
import {parseRobotsTxt} from './parseRobotsTxt';


export default function getRobotsTxt(
	userAgent: string,
	scheme: string,
	domain: string
) {
	const robotsReq: HttpClientRequest = {
		contentType: 'text/plain',
		followRedirects: false,
		headers: {
			'accept': 'text/plain',
			'accept-charset': 'utf-8, iso-8859-1;q=0.5, *;q=0.1',
			'accept-encoding': 'identity',
			'user-agent': userAgent
		},
		method: 'GET',
		url: `${scheme}://${domain}/robots.txt`
	};
	// log.debug('robotsReq:%s', toStr(robotsReq));

	const robotsRes = httpClientRequest(robotsReq) as Response;
	// log.debug(toStr({robotsRes}));

	let robots: RobotsTxt;
	if (
		robotsRes.status === 200
		&& startsWith(robotsRes.contentType, 'text/plain')
	) {
		robots = guard(parseRobotsTxt(robotsRes.body));
	}
	return robots;
}
