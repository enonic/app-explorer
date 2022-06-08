import {
	Button,
	Form,
	Grid,
	Header,
	Icon,
	Segment
} from 'semantic-ui-react';
import {ResetButton} from '../components/ResetButton';
import {SubmitButton} from '../components/SubmitButton';
import {Emails} from './Emails';
import {useNotificationsState} from './useNotificationsState';


export function Notifications({
	servicesBaseUrl
} :{
	servicesBaseUrl :string
}) {
	const {
		durationSinceLastUpdate,
		emails,
		isLoading,
		isStateChanged,
		memoizedFetchNotifications,
		resetState,
		setEmails,
		setIsLoading
	} = useNotificationsState({
		servicesBaseUrl
	});
	return <>
		<Segment basic className='page'>
			<Grid>
				<Grid.Column floated='left' width={3}>
					<Header as='h1'>Notifications</Header>
				</Grid.Column>
				<Grid.Column floated='right' width={4}>
					<Button
						basic
						floated='right'
						color='blue'
						loading={isLoading}
						onClick={memoizedFetchNotifications}><Icon className='refresh'/>Last updated: {durationSinceLastUpdate}</Button>
				</Grid.Column>
			</Grid>
		</Segment>
		<Form>
			<Emails
				emails={emails}
				isLoading={isLoading}
				setEmails={setEmails}
			/>
			<Form.Field>
				<ResetButton
					disabled={isLoading}
					isStateChanged={isStateChanged}
					loading={isLoading}
					onClick={() => resetState()}
					secondary
				/>
				<SubmitButton
					disabled={isLoading}
					isStateChanged={isStateChanged}
					loading={isLoading}
					onClick={() => {
						setIsLoading(true);
						fetch(`${servicesBaseUrl}/notifications?json=${JSON.stringify({emails})}`, {
							method: 'POST'
						}).then(response => {
							if (response.status === 200) {
								memoizedFetchNotifications(); // also does setIsLoading(false)
							} else {
								setIsLoading(false);
							}
						})
					}}
					primary
				/>
			</Form.Field>
		</Form>
	</>;
} // Notifications
