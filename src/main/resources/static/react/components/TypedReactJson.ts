import type {ReactJsonViewProps} from 'react-json-view';

export type MyReactJson = React.ComponentType<ReactJsonViewProps & {
	displayArrayKey ?:boolean
}>;

import ReactJson from 'react-json-view';

const TypedReactJson = ReactJson as MyReactJson;

export default TypedReactJson;
