import classNames from 'classnames';


export const Buttons = ({
	children,
	className,
	two, three, four, five, six, seven, eight, nine, ten, eleven, twelve,
	mini, tiny, small, medium, large, big, huge, massive,
	bottom, top, attached, left, right, floated,
	vertical, labeled, icon,
	...rest
}) => <div className={classNames(className, {
	two, three, four, five, six, seven, eight, nine, ten, eleven, twelve,
	mini, tiny, small, medium, large, big, huge, massive,
	bottom, top, attached, left, right, floated,
	vertical, labeled, icon
}, 'ui buttons')} {...rest}>{children}</div>;
