import RobotsException from '../exceptions/RobotsException';


export function throwIfExcluded({
	excludeRegExps,
	urlWithoutSchemeAndDomain,
}: {
	excludeRegExps: RegExp[]
	urlWithoutSchemeAndDomain: string
}) {
	for (let i = 0; i < excludeRegExps.length; i += 1) {
		if (excludeRegExps[i].test(urlWithoutSchemeAndDomain)) {
			throw new RobotsException(urlWithoutSchemeAndDomain, 'Matches an exclude regexp!');
		}
	}
}
