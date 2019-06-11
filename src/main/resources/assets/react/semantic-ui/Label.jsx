import classNames from 'classnames';


export const Label = ({
	attached, basic, circular, corner, image, pointing, ribbon, tag,
	label = basic || pointing || tag,
	below, left, right, top, bottom, horizontal,
	red, orange, yellow, olive, green, teal, blue, violet, purple, pink, brown,
	grey, black,
	mini, tiny, small, medium, large, big, huge, massive,
	children,
	text,
	...rest
}) => <label
	className={classNames({
		label,
		attached, basic, circular, corner, image, pointing, ribbon, tag,
		below, left, right, top, bottom, horizontal,
		red, orange, yellow, olive, green, teal, blue, violet, purple, pink,
		brown, grey, black,
		mini, tiny, small, medium, large, big, huge, massive
	}, 'ui')}
	{...rest}
>{children || text}</label>;
