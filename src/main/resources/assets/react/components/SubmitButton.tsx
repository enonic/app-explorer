import type {StrictButtonProps} from 'semantic-ui-react';


import {isFunction} from '@enonic/js-utils';
import {Button, Icon} from 'semantic-ui-react';


export function SubmitButton(props :Omit<
	StrictButtonProps, 'color'|'onClick'|'type'
> & {
	// Required
	isStateChanged :boolean|(() => boolean)
	onClick :() => void
	// Optional
	color ?:(params :{
		//disabled :boolean
		errorsArr :Array<unknown>
		primary :boolean
	}) => StrictButtonProps['color']|null
	errorsArr ?:Array<unknown>
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
		errorsArr = [],
		children = <>
			<Icon name='save'/>{
				errorsArr.length
					? `${errorsArr.length} validation error${errorsArr.length > 1 ? 's' : ''}`
					: booleanIsStateChanged
						? 'Save'
						: 'No changes to save'
			}
		</>,
		color = ({
			//disabled,
			errorsArr,
			primary
		}) => errorsArr.length
			? 'red'
			: primary
				? null
				: 'green',
		disabled: disabledProp = !!errorsArr.length,
		primary = false,
		...rest
	} = props;

	const calculatedDisabled = disabledProp || !booleanIsStateChanged;

	return <Button
		{...rest}
		color={color({
			//disabled: calculatedDisabled,
			errorsArr,
			primary
		})}
		disabled={calculatedDisabled}
		onClick={onClick}
		primary={primary}
		type='submit'
	>{children}</Button>;
}
