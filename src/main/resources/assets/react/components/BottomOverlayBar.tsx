import type {SemanticICONS} from 'semantic-ui-react';


import {
	Icon,
	Message,
	Segment,
	Sidebar,
} from 'semantic-ui-react';
import Flex from './Flex';


function BottomOverlayBar({
	icon,
	iconLoading,
	message,
	messageHeader,
	visible
} :{
	icon?: SemanticICONS
	iconLoading?: boolean
	message: string
	messageHeader?: string
	visible: boolean
}) {
	return <Sidebar
		as={Segment}
		animation='overlay'
		className='bgc-admin-ui-gray'
		direction='bottom'
		inverted
		style={{
			paddingBottom: 13,
			paddingLeft: 0,
			paddingRight: 0,
			paddingTop: 13
		}}
		visible={visible}
	>
		<Flex
			justifyContent='center'
		>
			<Flex.Item
				className={[
					'w-fullExceptGutters-mobileDown',
					'w-mi-tabletExceptGutters-tabletUp',
					'w-mi-computerExceptGutters-computerUp',
					'w-mi-largeExceptGutters-largeUp',
					'w-mi-widescreenExceptGutters-widescreenUp',
					'w-ma-fullExceptGutters'
				].join(' ')}
			>
				<Message icon={!!icon}>
					{icon ? <Icon name={icon} loading={iconLoading} /> : null}
					<Message.Content>
						{messageHeader ? <Message.Header content={messageHeader}/> : null}
						{message}
					</Message.Content>
				</Message>
			</Flex.Item>
		</Flex>
	</Sidebar>;
}

export default BottomOverlayBar;
