import {
	Button,
	Form,
	Header,
	Icon,
} from 'semantic-ui-react';
import Flex from '../components/Flex';
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
	return <Flex
		justifyContent='center'
	>
		<Flex.Item
			className='w-ma-fullExceptGutters w-fullExceptGutters-mobileDown w-mi-tabletExceptGutters-tabletUp'
			overflowX='overlay'
		>
			<Flex justifyContent='space-between' style={{gap:13}}>
				<Flex.Item>
					<Header as='h1'>Notifications</Header>
				</Flex.Item>
				<Flex.Item>
					<Button
						basic
						color='blue'
						loading={isLoading}
						onClick={memoizedFetchNotifications}><Icon className='refresh'/>Last updated: {durationSinceLastUpdate}</Button>
				</Flex.Item>
			</Flex>
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
		</Flex.Item>
	</Flex>;
} // Notifications
