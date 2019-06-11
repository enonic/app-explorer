import classNames from 'classnames';
//import {toStr} from '../utils/toStr';


export const Button = ({
	className,
	children,
	type = 'button', // default is submit

	basic, circular, compact, fluid, labeled, icon, toggle,
	positive, negative,
	left, right, floated, bottom, top, attached,
	mini, tiny, small, medium, large, big, huge, massive,
	red, orange, yellow, olive, green, teal, blue, violet, purple, pink, brown,
	grey, black,

	...rest
}) => {
	//console.debug(toStr({component: 'Button', className, rest}));
	return <button
		className={classNames(
			className,
			{
				basic, circular, compact, fluid, labeled, icon, toggle,
				positive, negative,
				left, right, floated, bottom, top, attached,
				mini, tiny, small, medium, large, big, huge, massive,
				red, orange, yellow, olive, green, teal, blue, violet, purple,
				pink, brown, grey, black
			},
			'ui button'
		)}
		type={type}
		{...rest}
	>{children}</button>;
}
