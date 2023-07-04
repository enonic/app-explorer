import type {
	executeFunction,
	progress
} from '@enonic-types/lib-task';
import { jest } from '@jest/globals';


export default function mockLibXpTask({
	taskId = 'taskId',
}: {
	taskId?: string
} = {}) {
	jest.mock('/lib/xp/task', () => ({
		executeFunction: jest.fn<typeof executeFunction>(({
			description: _description,
			func
		}) => (() => {
			func();
			return taskId;
		})()),
		progress: jest.fn<typeof progress>(({
			current: _current,//?: number | null;
			total: _total,//?: number | null;
			info: _info,//?: string | null;
		}) => undefined as void)
	}), { virtual: true });
}
