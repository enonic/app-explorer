import * as React from 'react';
import {Form, Header} from 'semantic-ui-react';
import {
	Form as EnonicForm,
	ResetButton,
	SubmitButton
	//@ts-ignore
} from 'semantic-ui-react-form';

import {Emails} from './notifications/Emails';


export function Notifications(props) {
	const {servicesBaseUrl} = props;

	const [initialValues, setInitialValues] = React.useState(false);

	function fetchNotifications() {
		fetch(`${servicesBaseUrl}/notifications`)
			.then(response => response.json())
			.then(data => {
				//console.debug('data', data);
				setInitialValues(data);
			});
	}

	React.useEffect(() => fetchNotifications(), []);

	//console.debug('initialValues', initialValues);

	return <>
		<Header as='h1'>Notifications</Header>
		{initialValues
			? <EnonicForm
				initialValues={initialValues}
				onSubmit={(values) => {
					//console.debug('values', values);
					fetch(`${servicesBaseUrl}/notifications?json=${JSON.stringify(values)}`, {
						method: 'POST'
					})
				}}
			>
				<Emails/>
				<Form.Field>
					<SubmitButton/>
					<ResetButton/>
				</Form.Field>
			</EnonicForm>
			: null
		}
	</>;
} // Notifications
