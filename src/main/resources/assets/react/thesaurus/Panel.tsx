import type {
	StrictAccordionContentProps,
	StrictAccordionProps
} from 'semantic-ui-react';


import * as React from 'react';
import {
	Accordion,
	Icon
} from 'semantic-ui-react';


export const Panel = (props :StrictAccordionProps & {
	children :StrictAccordionContentProps['children']
	title ?:string
}) => {
	//console.debug('props', props);
	const {
		children,
		fluid = false,
		title = '',
		...rest
	} = props;

	const [active, setActive] = React.useState(true);

	return <Accordion {...rest}>
		<Accordion.Title
			active={active}
			fluid={fluid}
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
