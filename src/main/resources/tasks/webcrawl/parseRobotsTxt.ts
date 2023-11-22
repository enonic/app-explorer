// import {toStr} from '@enonic/js-utils/value/toStr';

const DIRECTIVE_ALLOW = 'allow';
const DIRECTIVE_DISALLOW = 'disallow';
const DIRECTIVE_NOINDEX = 'noindex';
const DIRECTIVE_USER_AGENT = 'user-agent';

const START_GROUP = 'START_GROUP';
const GROUP_MEMBER = 'GROUP_MEMBER';
const NON_GROUP = 'NON_GROUP';


type Directive =
	| typeof DIRECTIVE_ALLOW
	| typeof DIRECTIVE_DISALLOW
	| typeof DIRECTIVE_NOINDEX
	| typeof DIRECTIVE_USER_AGENT

type Extension = {
	extension: Directive
	value: string
}

type Group = {
	agents: any[],
	rules: any[]
}

type Token =
	| typeof GROUP_MEMBER
	| typeof NON_GROUP
	| typeof START_GROUP

type Result = {
	groups: Group[],
	extensions: Extension[]
}


export function parseRobotsTxt(txt: string) {
	// log.debug('parseRobotsTxt(%s)', txt);
	const result: Result = {
		groups: [],
		extensions: []
	};
	const lines = txt.split('\n');
	let currentGroup: Group = null;
	let prevToken: Token = null;
	for (let i = 0; i < lines.length; i += 1) {
		// log.debug('lines[%s]:%s', i, lines[i]);
		const commentFree = lines[i].replace(/#.*$/, '');
		// log.debug('commentFree:%s', commentFree);
		const index = commentFree.indexOf(':');
		if(index === -1) {continue;}
		const directive = commentFree.substr(0, index).trim().toLowerCase() as Directive;
		const value = commentFree.substr(index + 1).trim();
		switch (directive) {
		case DIRECTIVE_USER_AGENT: {
			if (prevToken !== START_GROUP) {
				currentGroup = { // New reference
					agents: [],
					rules: []
				};
				result.groups.push(currentGroup); // Use new reference
			}
			//log.info(toStr({value}));
			currentGroup.agents.push(value); // Use reference
			prevToken = START_GROUP;
			break;
		}
		case DIRECTIVE_ALLOW:
		case DIRECTIVE_DISALLOW:
		case DIRECTIVE_NOINDEX: {
			if (currentGroup) {
				currentGroup.rules.push({ // Use reference
					rule: directive,
					path: value
				});
			}
			prevToken = GROUP_MEMBER;
			break;
		}
		default:
			// Non-standard directives:
			// Allow
			// Crawl-delay
			// Host
			// Sitemap
			result.extensions.push({
				extension: directive,
				value
			});
			prevToken = NON_GROUP;
		} // switch directive
	} // for lines
	// log.debug('parseRobotsTxt result:%s', toStr(result));
	return result;
} // function parse
