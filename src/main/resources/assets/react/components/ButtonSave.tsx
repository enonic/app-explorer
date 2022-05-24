import { Button, Icon } from 'semantic-ui-react';
//@ts-ignore
import {submit} from 'semantic-ui-react-form/actions'
//@ts-ignore
import {getEnonicContext} from 'semantic-ui-react-form/Context';
import traverse from 'traverse';

/**
 * Save button to be used by itself and semanantic-ui-react-form
 * Is disabled by default and will be active on change
 * @param {Object} params All button parameters
 * @param {boolean} [params.enonicForm=false] If it should handle the semantic-ui-react-form context etc.
 * @returns {Button}
 */
export function ButtonSave({
	children = <><Icon name='save'/> Save</>,
	primary = true,
	disabled = true,
	icon = true,
	onClick = () => { return },
	enonicForm = false,
	...rest
}) {
	if (enonicForm) {
		const [context, dispatch] = getEnonicContext();

		// If we ever want validation
		/* const errorsArr = traverse(context.errors)
			.reduce(function (acc, x) {
				if (this.notRoot && this.isLeaf) acc.push(x);
				return acc;
			}, []); */

		const leaves = traverse(context.changes)
			.reduce(function (acc, x) {
				if (this.notRoot && this.isLeaf && x === true) acc.push(x);
				return acc;
			}, []);

		if (leaves.length > 0) {
			disabled = false;
		}

		// Validation needed
		/* if (errorsArr > 0) {
			children = <><Icon name='save' color='red'/> {errorsArr.length} validation error(s)</>
			disabled = true;
			primary = false;
		} */
		onClick = () => dispatch(submit());
	}

	return <Button
		{...rest}
		primary={primary}
		icon={icon}
		disabled={disabled}
		onClick={onClick}
	>{children}
	</Button>;
}
