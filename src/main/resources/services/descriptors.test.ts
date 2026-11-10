import {
	describe,
	expect,
	test
} from '@jest/globals';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';


const SERVICES_DIR = __dirname;

const ADMIN_PRINCIPALS = [
	'role:com.enonic.app.explorer.admin',
	'role:system.admin'
];

const serviceNames = readdirSync(SERVICES_DIR, { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map((entry) => entry.name);

function readAllow(serviceName: string): string[] {
	const yaml = readFileSync(join(SERVICES_DIR, serviceName, `${serviceName}.yaml`), 'utf8');
	const match = yaml.match(/^allow:\n((?:[ \t]+-[^\n]*\n?)+)/m);
	if (!match) {
		return [];
	}
	return match[1]
		.split('\n')
		.map((line) => line.replace(/^[ \t]*-[ \t]*/, '').replace(/^"(.*)"$/, '$1').trim())
		.filter(Boolean);
}


describe('service descriptors', () => {
	test('every service has a descriptor', () => {
		expect(serviceNames.length).toBeGreaterThan(0);
	});
	test.each(serviceNames)('%s is only allowed for Explorer administrators', (serviceName) => {
		expect(readAllow(serviceName).sort()).toStrictEqual(ADMIN_PRINCIPALS);
	});
});
