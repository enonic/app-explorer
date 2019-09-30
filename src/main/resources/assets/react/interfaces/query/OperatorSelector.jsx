import getIn from 'get-value';
import {Form, Radio} from 'semantic-ui-react';

import {getEnonicContext} from '../../enonic/Context';
import {setValue} from '../../enonic/Form';


export function OperatorSelector(props) {
	const [context, dispatch] = getEnonicContext();
	const {
		defaultValue = 'or',
		parentPath,
		path = parentPath ? `${parentPath}.operator` : 'operator',
		value = getIn(context.values, path, defaultValue)
	} = props;
	return <>
		<Form.Field>
			<Radio
				checked={value !== 'and'}
				label="OR"
				name={path}
				onChange={() => dispatch(setValue({path, value: 'or'}))}
			/>
		</Form.Field>
		<Form.Field>
			<Radio
				checked={value === 'and'}
				label="AND"
				name={path}
				onChange={() => dispatch(setValue({path, value: 'and'}))}
			/>
		</Form.Field>
	</>;
} //function OperatorSelector
