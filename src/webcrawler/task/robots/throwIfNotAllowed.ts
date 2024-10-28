import type { RobotsTxt } from './RobotsTxt';


import RobotsException from '../exceptions/RobotsException';


export default function throwIfNotAllowed({
	path,
	robots,
	userAgent = '' // meaning * (all user agents)
}: {
	path: string
	robots: RobotsTxt,
	userAgent?: string
}) {
	if (robots && !robots.isAllowed(userAgent, path)) {
		throw new RobotsException(path, 'Not allowed in robots.txt');
	}
}
