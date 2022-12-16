import type {
	AnyObject,
	CollectorComponentRef,
	CollectorProps
} from '/lib/explorer/types/index.d';
import {
	App,
	Log
} from './types/index.d';

export {
	App,
	Application,
	Log
} from './types/index.d';


export type CollectorComponent<CollectorConfig extends AnyObject = AnyObject> = (props :CollectorProps & {
	ref :CollectorComponentRef<CollectorConfig>
}) => JSX.Element;
export type CollectorComponents = Record<string,CollectorComponent>;

export interface ExplorerProps {
	basename: string
	collectorComponents: CollectorComponents
	licensedTo: string
	licenseValid: boolean
	servicesBaseUrl: string
	wsBaseUrl: string
}


// Global-modifying module, should be placed in moduleRoot/index.d.ts
declare global {
	const app :App;
	const log :Log;
}
