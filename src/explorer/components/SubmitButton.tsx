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
		errorCount :number
		primary :boolean
	}) => StrictButtonProps['color']|null
	errorCount ?:number
	//validateForm ?:() => boolean
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
		errorCount = 0,
		children = <>
			<Icon name='save'/>{
				errorCount
					? `${errorCount} validation error${errorCount > 1 ? 's' : ''}`
					: booleanIsStateChanged
						? 'Save'
						: 'No changes to save'
			}
		</>,
		color = ({
			//disabled,
			errorCount,
			primary
		}) => errorCount
			? 'red'
			: primary
				? null
				: 'green',
		disabled: disabledProp = !!errorCount,
		primary = false,
		//validateForm = () => true,
		...rest
	} = props;

	const calculatedDisabled = disabledProp || !booleanIsStateChanged;

	return <Button
		{...rest}
		color={color({
			//disabled: calculatedDisabled,
			errorCount,
			primary
		})}
		disabled={calculatedDisabled}
		onClick={onClick}
		primary={primary}
		type='submit'
	>{children}</Button>;
}
