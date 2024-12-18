
import type { Request } from '@enonic-types/core';

export type RoutedRequest = Request & {
	pathParams: {
		collectionName?: string
		documentId?: string
		path?: string
	};
};
