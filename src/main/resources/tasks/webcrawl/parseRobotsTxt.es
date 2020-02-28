//import {toStr} from '/lib/util';


export function parseRobotsTxt(txt) {
	const START_GROUP = 'START_GROUP';
  const GROUP_MEMBER = 'GROUP_MEMBER';
  const NON_GROUP = 'NON_GROUP';
	const result = {
    groups: [],
    extensions: []
  };
	const lines = txt.split('\n');
	let currentGroup = null;
	let prevToken = null;
	for (let i = 0; i < lines.length; i += 1) {
		const commentFree = lines[i].replace(/#.*$/, '');
    const index = commentFree.indexOf(':');
		if(index === -1) {continue;}
  	const directive = commentFree.substr(0, index).trim().toLowerCase();
    const value = commentFree.substr(index + 1).trim();
		switch (directive) {
			case 'user-agent': {
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
			case 'allow':
    	case 'disallow':
    	case 'noindex': {
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
	return result;
} // function parse

/*
require('array.prototype.find').shim();
import guard from 'robots-txt-guard';
const obj = parse(`
Sitemap: http://www.example.com/sitemap.xml

User-agent: *
Disallow: /allDisallow
Noindex: /allNoindex

User-agent: google
Disallow: /googleDisallow
Noindex: /googleNoindex
`);
log.info(toStr({obj}));

const bot = guard(obj);

log.info(toStr({
	isAllowedAllOnAllDisallow: bot.isAllowed('', '/allDisallow'),
	//isAllowedGoogleOnAllDisallow: bot.isAllowed('google', '/allDisallow'),
	//isIndexableAllOnAllDisallow: bot.isIndexable('', '/allDisallow'),
	//isIndexableGoogleOnAllDisallow: bot.isIndexable('google', '/allDisallow'),

	//isAllowedAllOnAllNoindex: bot.isAllowed('', '/allNoindex'),
	//isAllowedGoogleOnAllNoindex: bot.isAllowed('google', '/allNoindex'),
	isIndexableAllNoindex: bot.isIndexable('', '/allNoindex'),
	//isIndexableGoogleOnAllNoindex: bot.isIndexable('google', '/allNoindex'),

	//isAllowedAllOnGoogleDisallow: bot.isAllowed('', '/googleDisallow'),
	isAllowedGoogleOnGoogleDisallow: bot.isAllowed('google', '/googleDisallow'),
	//isIndexableAllOnGoogleDisallow: bot.isIndexable('', '/googleDisallow'),
	//isIndexableGoogleOnGoogleDisallow: bot.isIndexable('google', '/googleDisallow'),

	//isAllowedAllOnGoogleNoindex: bot.isAllowed('', '/googleNoindex'),
	//isAllowedGoogleOnGoogleNoindex: bot.isAllowed('google', '/googleNoindex'),
	//isIndexableAllOnGoogleNoindex: bot.isIndexable('', '/googleNoindex'),
	isIndexableGoogleOnGoogleNoindex: bot.isIndexable('google', '/googleNoindex'),
}));
*/
