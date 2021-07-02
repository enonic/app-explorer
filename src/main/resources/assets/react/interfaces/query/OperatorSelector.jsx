import getIn from 'get-value';
import {Form, Radio} from 'semantic-ui-react';

import {getEnonicContext} from 'semantic-ui-react-form/Context';
import {setValue} from 'semantic-ui-react-form/actions';

import {QUERY_OPERATOR_AND, QUERY_OPERATOR_OR} from '@enonic/js-utils';

export function OperatorSelector(props) {
	const [context, dispatch] = getEnonicContext();
	const {
		defaultValue = QUERY_OPERATOR_OR,
		disabled = false,
		options = [{
			label: 'OR',
			value: QUERY_OPERATOR_OR
		},{
			value: 'AND',
			key: QUERY_OPERATOR_AND
		}],
		parentPath,
		path = parentPath ? `${parentPath}.operator` : 'operator',
		value = getIn(context.values, path, defaultValue)
	} = props;
	//console.debug('path', path, 'value', value);
	return <>
		{options.map(({
			label,
			value: optionValue
		}, index) => <Form.Field key={`${path}.${index}`}>
			<Radio
				checked={value === optionValue}
				disabled={disabled}
				label={label}
				name={path}
				onChange={() => dispatch(setValue({path, value: optionValue}))}
			/>
		</Form.Field>)}
	</>;
} //function OperatorSelector
