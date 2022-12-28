import type {User as UserType} from '/lib/xp/auth';


import {
	Card,
	Header,
	Segment,
} from 'semantic-ui-react';
import Flex from '../components/Flex';
import useUserState from './useUserState';


function User({
	servicesBaseUrl,
	userState
}: {
	servicesBaseUrl: string
	userState: UserType
}) {
	const {
		displayName,
		email,
		login
	} = userState || {};

	const {
		profileState
	} = useUserState({
		servicesBaseUrl
	});
	return <Flex
		justifyContent='center'
	>
		<Flex.Item
			className={[
				'w-ma-fullExceptGutters',
				'w-mi-tabletExceptGutters-tabletUp',
				'w-fullExceptGutters-mobileDown',
			].join(' ')}
			overflowX='overlay'
		>
			<Header as='h1' content="User"/>
			<Segment basic compact>
				<Card>
					<Card.Content>
						<Card.Header>displayName: {displayName}</Card.Header>
						<Card.Meta>login: {login}</Card.Meta>
						<Card.Description>email: {email}</Card.Description>
					</Card.Content>
				</Card>
			</Segment>
			<Header as='h2' content="Settings"/>
			<Header as='h3' content="Document page"/>
			<Header as='h4' content="Columns"/>
			<ul>
				{profileState.documents.columns.map((c, i) => <li key={i}>{c}</li>)}
			</ul>
		</Flex.Item>
	</Flex>;
}


export default User;
