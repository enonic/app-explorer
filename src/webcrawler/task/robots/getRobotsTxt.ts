import type {
	HttpClientRequest,
	Response
} from '@enonic-types/lib-explorer';
import type { RobotsTxt } from './RobotsTxt';


// import {startsWith} from '@enonic/js-utils/string/startsWith';
// import {toStr} from '@enonic/js-utils/value/toStr';

// TODO: Perhaps use robots-parser instead of robots-txt-guard?
import guard from 'robots-txt-guard';

// @ts-ignore
import {request as httpClientRequest} from '/lib/http-client';
import {readText} from '/lib/xp/io';

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
	// log.debug('robotsRes:%s', toStr(robotsRes));

	const body = robotsRes.body || readText(robotsRes.bodyStream);
	// log.debug('robotsRes.bodyStream:%s', body);

	let robots: RobotsTxt;
	if (
		robotsRes.status === 200
		// && startsWith(robotsRes.contentType, 'text/plain') // Some servers don't set Content-Type :(
	) {
		try {
			const parsedRobotsTxt = parseRobotsTxt(body);
			// log.debug('getRobotsTxt parsedRobotsTxt:%s', toStr(parsedRobotsTxt));
			try {
				robots = guard(parsedRobotsTxt);
			} catch (e) {
				log.error('getRobotsTxt: Unable to guard parsedRobotsTxt:%s', parsedRobotsTxt, e);
			}
		} catch (e) {
			log.error('getRobotsTxt: Error parsing robots.txt:%s', body, e);
		}
	}
	return robots;
}
