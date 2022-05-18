import * as React from 'react';
import {
	Accordion,
	Icon
} from 'semantic-ui-react';


export const Panel = (props :{
	children :unknown
	title :string
}) => {
	//console.debug('props', props);
	const {
		children,
		title = '',
		...rest
	} = props;

	const [active, setActive] = React.useState(true);

	return <Accordion {...rest}>
		<Accordion.Title
			active={active}
			onClick={(
				//@ts-ignore
				syntheticEvent,
				{active}
			) => setActive(!active)}
		><Icon name='dropdown' />{title}</Accordion.Title>
		<Accordion.Content
			active={active}
		>{children}</Accordion.Content>
	</Accordion>;
}; // Panel
