import {
	Accordion,
	Icon
} from 'semantic-ui-react';


export const Panel = (props) => {
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
			onClick={(syntheticEvent,{active}) => setActive(!active)}
		><Icon name='dropdown' />{title}</Accordion.Title>
		<Accordion.Content
			active={active}
		>{children}</Accordion.Content>
	</Accordion>;
}; // Panel
