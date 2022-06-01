import * as React from 'react';
import {Form, Header} from 'semantic-ui-react';
import {
	Form as EnonicForm,
	ResetButton,
	SubmitButton
	//@ts-ignore
} from '@enonic/semantic-ui-react-form';

import {Emails} from './notifications/Emails';


type NotificationsFormValues = {
	emails ?:Array<string>
}

export function Notifications(props :{
	servicesBaseUrl :string
}) {
	const {servicesBaseUrl} = props;
	//console.debug('servicesBaseUrl', servicesBaseUrl);

	const [initialValues, setInitialValues] = React.useState<NotificationsFormValues>(undefined);
	//console.debug('initialValues', initialValues);

	const memoizedFetchNotifications = React.useCallback(() => {
		fetch(`${servicesBaseUrl}/notifications`)
			.then(response => response.json())
			.then(data => {
				//console.debug('data', data);
				setInitialValues(data);
			});
	}, [
		servicesBaseUrl
	]);

	React.useEffect(() => memoizedFetchNotifications(), [
		memoizedFetchNotifications
	]);

	//console.debug('initialValues', initialValues);

	return <>
		<Header as='h1'>Notifications</Header>
		{initialValues
			? <EnonicForm<NotificationsFormValues>
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
