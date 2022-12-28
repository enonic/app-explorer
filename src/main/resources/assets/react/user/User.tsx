import type {
	// Group,
	Principal,
	// Role,
	User as UserType
} from '/lib/xp/auth';

type ExtendedPrincipal = Principal & {
	inherited: boolean
	parent?: ExtendedPrincipal
}

import {
	Card,
	Header,
	List,
	Segment,
} from 'semantic-ui-react';
import Flex from '../components/Flex';
import useUserState from './useUserState';


function User({
	servicesBaseUrl,
	userState
}: {
	servicesBaseUrl: string
	userState: UserType & {
		memberships: ExtendedPrincipal[]
	}
}) {
	const {
		displayName,
		email,
		login,
		memberships = [],
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
			<Flex
				justifyContent='flex-start'
				gap
			>
				<Flex.Item>
					<Header as='h2' content="Groups"/>
					<List items={memberships.filter(({type}) => type === 'group').map(({
						displayName,
						inherited,
						parent,
					}, i) => ({
						icon: 'group',
						content: inherited
							? <>
								{`${displayName} `}
								<span className='c-gr'>
									{`(inherited${parent ? ` from ${parent.displayName}` : ''})`}
								</span>
							</>
							: displayName,
						key: i,
					}))}/>
				</Flex.Item>
				<Flex.Item>
					<Header as='h2' content="Roles"/>
					<List items={memberships.filter(({type}) => type === 'role').map(({
						displayName,
						inherited,
						parent,
					}, i) => ({
						icon: 'student', // 'user secret'
						content: inherited
							? <>
								{`${displayName} `}
								<span className='c-gr'>
									{`(inherited${parent ? ` from ${parent.displayName}` : ''})`}
								</span>
							</>
							: displayName,
						key: i,
					}))}/>
				</Flex.Item>
			</Flex>
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
