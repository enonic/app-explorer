import type {StrictButtonProps} from 'semantic-ui-react';

import {isFunction} from '@enonic/js-utils';
import {Button, Icon} from 'semantic-ui-react';


export function ResetButton(props :Omit<
	StrictButtonProps, 'color'|'onClick'|'type'
> & {
	// Required
	isStateChanged :boolean|(() => boolean)
	onClick :() => void
	// Optional
	color ?:(params :{
		defaultColor :StrictButtonProps['color']
		disabled :boolean
		primary :boolean
		secondary :boolean
	}) => StrictButtonProps['color']|null
}) {
	const {
		isStateChanged: isStateChangedProp
	} = props;
	const booleanIsStateChanged = isFunction(isStateChangedProp) ? isStateChangedProp() : isStateChangedProp;
	const {
		// Required
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		isStateChanged: _isStateChanged, // Make sure it doesn't end up in ...rest
		onClick,
		// Optional
		children=<><Icon name='history'/>{booleanIsStateChanged ? 'Reset' : 'Unchanged'}</>,
		color = ({
			defaultColor,
			disabled,
			primary,
			secondary
		}) => (disabled || secondary || primary)
			? null
			: defaultColor,
		disabled: disabledProp = false,
		primary = false,
		secondary = false,
		...rest
	} = props;

	//console.debug('disabledProp', disabledProp);
	//console.debug('isStateChangedFunction()', isStateChangedFunction());
	const calculatedDisabled = disabledProp || !booleanIsStateChanged;

	return <Button
		{...rest}
		color={color({
			defaultColor: 'olive',
			disabled: calculatedDisabled,
			primary,
			secondary
		})}
		disabled={calculatedDisabled}
		onClick={onClick}
		primary={primary}
		secondary={secondary}
		type='reset'
	>{children}</Button>;
}
