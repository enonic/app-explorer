import {
	describe,
	expect,
	test as it
} from '@jest/globals';
import Log from '@enonic/mock-xp/dist/Log';
import {parseRobotsTxt} from '../../../src/main/resources/tasks/webcrawl/parseRobotsTxt';

//──────────────────────────────────────────────────────────────────────────────
// Globals
//──────────────────────────────────────────────────────────────────────────────
// @ts-expect-error TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.log = Log.createLogger({
	// loglevel: 'debug'
	// loglevel: 'info'
	// loglevel: 'warn'
	// loglevel: 'error'
	loglevel: 'silent'
});

//──────────────────────────────────────────────────────────────────────────────
// Tests
//──────────────────────────────────────────────────────────────────────────────
describe('parseRobotsTxt', () => {
	it("does it's thing", () => {
		expect(parseRobotsTxt(``)).toStrictEqual({
			groups: [],
			extensions: []
		});
		expect(parseRobotsTxt(`Sitemap: https://enonic.com/sitemap.xml
User-agent: *
Disallow: /docs/
Noindex: /blog/

User-agent: EnonicXpExplorerCollectorWebcrawlerBot
Disallow: /example/`)).toStrictEqual({
			extensions: [{
				extension: "sitemap",
				value: "https://enonic.com/sitemap.xml",
			}],
			groups: [{
				"agents": [
					"*",
				],
				"rules": [{
					"path": "/docs/",
					"rule": "disallow",
				},{
					"path": "/blog/",
					"rule": "noindex",
				}],
			},{
				"agents": [
					"EnonicXpExplorerCollectorWebcrawlerBot",
				],
				"rules": [{
					"path": "/example/",
					"rule": "disallow",
				}],
			}]
		});
		expect(parseRobotsTxt(`User-agent: 008
Disallow: /

User-agent: SiteAuditBot
Crawl-delay: 1
Allow: /

User-agent: Semrushbot-SI
Allow: /

User-agent: Yahoo Pipes 2.0
Disallow: /

User-agent: Facebot
Disallow: /archive/graphs.php

User-agent: Bingbot
Disallow: /archive/graphs.php

User-agent: BingPreview
Disallow: /archive/graphs.php

User-agent: Twitterbot
Allow: /blog/*
Allow: /ranking-factors/*

User-agent: *
Disallow: /blog/*?img=*
Disallow: /archive/graphs.php
Disallow: /forrester-marketing-silos/*
Disallow: /partner/
Disallow: /blog/search/*
Disallow: /analytics/seomagic/
Disallow: /my_reports/reports/*
Disallow: /archive/
Disallow: /admin/
Disallow: /users/
Disallow: /clients/
Disallow: /custom_report/
Disallow: /limit_hits/
Disallow: /payment/
Disallow: /no_cookies/
Disallow: /support/
Disallow: /double_activation/
Disallow: /projects/?*
Disallow: /?*/
Disallow: /activation_successful*
Disallow: /api.html?*
Disallow: /partners/
Disallow: /partner/
Disallow: */dvd-mode/
Disallow: /unsubscribe/
Disallow: /unsubscribe/*
Disallow: /demonstration/
Disallow: /demonstration/*
Allow: /projects/
Disallow: */custom-report/
Disallow: */request-demo/
Allow: */info/kdt/
Disallow: */pleasereg/
Disallow: */custom-report/
Disallow: */custom-report
Allow: */sensor/*
Disallow: /swa/api/*
Disallow: /redirect?url=*
Disallow: /sso/
Disallow: /_/report_blank/
Disallow: /seo-ab-testing/*
Disallow: /seo-old/*
Disallow: /projects2/*
Disallow: /local-seo2/*

# Community rules
Allow: /blog/*
Disallow: /blog/search/*
Disallow: /blog/*utm_source=*
Disallow: /blog-manager/*
Allow: /user/*

# Features new pages
Disallow: /features/index2/
Disallow: /features/for-*

# Solutions
Disallow: /solutions/$

#webinars
Allow: /webinars/*

#landing
Disallow: /landing/
Disallow: /lp/
Allow: /lp/for-agencies/en/
Allow: /lp/growth-quadrant/
Allow: /seo/
Allow: /content-marketing/
Allow: /ppc/
Allow: /competitive-research/
Allow: /analytics/traffic/overview/
Disallow: /listings-management/superpower-landing2/

#academy
Allow: /academy/*
Disallow: /academy/*utm_source=*
Disallow: /academy/*/results

#websites
Allow: /website/*
Disallow: /website/search/*

Disallow: /*/?*
Crawl-delay: 20

# Sitemap files
#Blog
Sitemap: https://www.semrush.com/sitemap.xml
Sitemap: https://pt.semrush.com/blog/sitemap/
Sitemap: https://es.semrush.com/blog/sitemap/
Sitemap: https://it.semrush.com/blog/sitemap/
Sitemap: https://fr.semrush.com/blog/sitemap/
Sitemap: https://de.semrush.com/blog/sitemap/
Sitemap: https://ja.semrush.com/blog/sitemap/
#Academy
Sitemap: https://www.semrush.com/academy/sitemap.xml
Sitemap: https://es.semrush.com/academy/sitemap.xml
Sitemap: https://pt.semrush.com/academy/sitemap.xml
Sitemap: https://it.semrush.com/academy/sitemap.xml
Sitemap: https://fr.semrush.com/academy/sitemap.xml
Sitemap: https://de.semrush.com/academy/sitemap.xml`)).toStrictEqual({
			groups: [
				{
					agents: [
						'008'
					],
					rules: [
						{
							rule: 'disallow',
							path: '/'
						}
					]
				},
				{
					agents: [
						'SiteAuditBot'
					],
					rules: [
						{
							rule: 'allow',
							path: '/'
						}
					]
				},
				{
					agents: [
						'Semrushbot-SI'
					],
					rules: [
						{
							rule: 'allow',
							path: '/'
						}
					]
				},
				{
					agents: [
						'Yahoo Pipes 2.0'
					],
					rules: [
						{
							rule: 'disallow',
							path: '/'
						}
					]
				},
				{
					agents: [
						'Facebot'
					],
					rules: [
						{
							rule: 'disallow',
							path: '/archive/graphs.php'
						}
					]
				},
				{
					agents: [
						'Bingbot'
					],
					rules: [
						{
							rule: 'disallow',
							path: '/archive/graphs.php'
						}
					]
				},
				{
					agents: [
						'BingPreview'
					],
					rules: [
						{
							rule: 'disallow',
							path: '/archive/graphs.php'
						}
					]
				},
				{
					agents: [
						'Twitterbot'
					],
					rules: [
						{
							rule: 'allow',
							path: '/blog/*'
						},
						{
							rule: 'allow',
							path: '/ranking-factors/*'
						}
					]
				},
				{
					agents: [
						'*'
					],
					rules: [
						{
							rule: 'disallow',
							path: '/blog/*?img=*'
						},
						{
							rule: 'disallow',
							path: '/archive/graphs.php'
						},
						{
							rule: 'disallow',
							path: '/forrester-marketing-silos/*'
						},
						{
							rule: 'disallow',
							path: '/partner/'
						},
						{
							rule: 'disallow',
							path: '/blog/search/*'
						},
						{
							rule: 'disallow',
							path: '/analytics/seomagic/'
						},
						{
							rule: 'disallow',
							path: '/my_reports/reports/*'
						},
						{
							rule: 'disallow',
							path: '/archive/'
						},
						{
							rule: 'disallow',
							path: '/admin/'
						},
						{
							rule: 'disallow',
							path: '/users/'
						},
						{
							rule: 'disallow',
							path: '/clients/'
						},
						{
							rule: 'disallow',
							path: '/custom_report/'
						},
						{
							rule: 'disallow',
							path: '/limit_hits/'
						},
						{
							rule: 'disallow',
							path: '/payment/'
						},
						{
							rule: 'disallow',
							path: '/no_cookies/'
						},
						{
							rule: 'disallow',
							path: '/support/'
						},
						{
							rule: 'disallow',
							path: '/double_activation/'
						},
						{
							rule: 'disallow',
							path: '/projects/?*'
						},
						{
							rule: 'disallow',
							path: '/?*/'
						},
						{
							rule: 'disallow',
							path: '/activation_successful*'
						},
						{
							rule: 'disallow',
							path: '/api.html?*'
						},
						{
							rule: 'disallow',
							path: '/partners/'
						},
						{
							rule: 'disallow',
							path: '/partner/'
						},
						{
							rule: 'disallow',
							path: '*/dvd-mode/'
						},
						{
							rule: 'disallow',
							path: '/unsubscribe/'
						},
						{
							rule: 'disallow',
							path: '/unsubscribe/*'
						},
						{
							rule: 'disallow',
							path: '/demonstration/'
						},
						{
							rule: 'disallow',
							path: '/demonstration/*'
						},
						{
							rule: 'allow',
							path: '/projects/'
						},
						{
							rule: 'disallow',
							path: '*/custom-report/'
						},
						{
							rule: 'disallow',
							path: '*/request-demo/'
						},
						{
							rule: 'allow',
							path: '*/info/kdt/'
						},
						{
							rule: 'disallow',
							path: '*/pleasereg/'
						},
						{
							rule: 'disallow',
							path: '*/custom-report/'
						},
						{
							rule: 'disallow',
							path: '*/custom-report'
						},
						{
							rule: 'allow',
							path: '*/sensor/*'
						},
						{
							rule: 'disallow',
							path: '/swa/api/*'
						},
						{
							rule: 'disallow',
							path: '/redirect?url=*'
						},
						{
							rule: 'disallow',
							path: '/sso/'
						},
						{
							rule: 'disallow',
							path: '/_/report_blank/'
						},
						{
							rule: 'disallow',
							path: '/seo-ab-testing/*'
						},
						{
							rule: 'disallow',
							path: '/seo-old/*'
						},
						{
							rule: 'disallow',
							path: '/projects2/*'
						},
						{
							rule: 'disallow',
							path: '/local-seo2/*'
						},
						{
							rule: 'allow',
							path: '/blog/*'
						},
						{
							rule: 'disallow',
							path: '/blog/search/*'
						},
						{
							rule: 'disallow',
							path: '/blog/*utm_source=*'
						},
						{
							rule: 'disallow',
							path: '/blog-manager/*'
						},
						{
							rule: 'allow',
							path: '/user/*'
						},
						{
							rule: 'disallow',
							path: '/features/index2/'
						},
						{
							rule: 'disallow',
							path: '/features/for-*'
						},
						{
							rule: 'disallow',
							path: '/solutions/$'
						},
						{
							rule: 'allow',
							path: '/webinars/*'
						},
						{
							rule: 'disallow',
							path: '/landing/'
						},
						{
							rule: 'disallow',
							path: '/lp/'
						},
						{
							rule: 'allow',
							path: '/lp/for-agencies/en/'
						},
						{
							rule: 'allow',
							path: '/lp/growth-quadrant/'
						},
						{
							rule: 'allow',
							path: '/seo/'
						},
						{
							rule: 'allow',
							path: '/content-marketing/'
						},
						{
							rule: 'allow',
							path: '/ppc/'
						},
						{
							rule: 'allow',
							path: '/competitive-research/'
						},
						{
							rule: 'allow',
							path: '/analytics/traffic/overview/'
						},
						{
							rule: 'disallow',
							path: '/listings-management/superpower-landing2/'
						},
						{
							rule: 'allow',
							path: '/academy/*'
						},
						{
							rule: 'disallow',
							path: '/academy/*utm_source=*'
						},
						{
							rule: 'disallow',
							path: '/academy/*/results'
						},
						{
							rule: 'allow',
							path: '/website/*'
						},
						{
							rule: 'disallow',
							path: '/website/search/*'
						},
						{
							rule: 'disallow',
							path: '/*/?*'
						}
					]
				}
			],
			extensions: [
				{
					extension: 'crawl-delay',
					value: '1'
				},
				{
					extension: 'crawl-delay',
					value: '20'
				},
				{
					extension: 'sitemap',
					value: 'https://www.semrush.com/sitemap.xml'
				},
				{
					extension: 'sitemap',
					value: 'https://pt.semrush.com/blog/sitemap/'
				},
				{
					extension: 'sitemap',
					value: 'https://es.semrush.com/blog/sitemap/'
				},
				{
					extension: 'sitemap',
					value: 'https://it.semrush.com/blog/sitemap/'
				},
				{
					extension: 'sitemap',
					value: 'https://fr.semrush.com/blog/sitemap/'
				},
				{
					extension: 'sitemap',
					value: 'https://de.semrush.com/blog/sitemap/'
				},
				{
					extension: 'sitemap',
					value: 'https://ja.semrush.com/blog/sitemap/'
				},
				{
					extension: 'sitemap',
					value: 'https://www.semrush.com/academy/sitemap.xml'
				},
				{
					extension: 'sitemap',
					value: 'https://es.semrush.com/academy/sitemap.xml'
				},
				{
					extension: 'sitemap',
					value: 'https://pt.semrush.com/academy/sitemap.xml'
				},
				{
					extension: 'sitemap',
					value: 'https://it.semrush.com/academy/sitemap.xml'
				},
				{
					extension: 'sitemap',
					value: 'https://fr.semrush.com/academy/sitemap.xml'
				},
				{
					extension: 'sitemap',
					value: 'https://de.semrush.com/academy/sitemap.xml'
				}
			]
		});
	});
});
