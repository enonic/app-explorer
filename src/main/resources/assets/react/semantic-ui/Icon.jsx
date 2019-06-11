import classNames from 'classnames';
//import {toStr} from '../utils/toStr';


export const Icon = ({
	className, // loading fitted
	children,
	size = '', // TODO remove

	disabled, link,
	mini, tiny, small, large, big, huge, massive,
	red, orange, yellow, olive, green, teal, blue, violet, purple, pink, brown,
	grey, black,

	window, close,
	trash, alternate, outline,
	...rest
}) => {
	const classStr = classNames(
		className,
		{
			disabled, link,
			mini, tiny, small, large, big, huge, massive,
			red, orange, yellow, olive, green, teal, blue, violet, purple, pink,
			brown, grey, black,
			window, close,
			trash, alternate, outline
		},
		`${size} icon`,
	);
	//console.debug(toStr({component: 'Icon', className, size, classStr, rest}));
	return <i
		className={classStr}
		disabled={disabled}
		{...rest}
	>{children}</i>;
}
