import type { RobotsTxt } from './RobotsTxt';


import RobotsException from '../exceptions/RobotsException';


export default function throwIfNotIndexable({
	path,
	robots,
	userAgent = '' // meaning * (all user agents)
}: {
	path: string
	robots: RobotsTxt,
	userAgent?: string
}) {
	if (robots && !robots.isIndexable(userAgent, path)) {
		throw new RobotsException(path, 'Not indexable in robots.txt');
	}
}
