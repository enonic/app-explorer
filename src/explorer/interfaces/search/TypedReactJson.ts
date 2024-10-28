import type {ReactJsonViewProps} from 'react-json-view';

export type MyReactJson = React.ComponentType<ReactJsonViewProps & {
	displayArrayKey ?:boolean
}>;

import ReactJson from 'react-json-view';

export const TypedReactJson = ReactJson as MyReactJson;
