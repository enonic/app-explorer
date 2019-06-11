import classNames from 'classnames';


export const Segment = ({
	children,
	className,
	red, orange, yellow, olive, green, teal, blue, violet, purple, pink, brown,
	grey, black,
	basic, circular, disabled, inverted, loading, piled, placeholder, raised,
	secondary, stacked, tall, tertiary, vertical,
	bottom, top, attached, very, padded, compact, clearing,
	left, right, floated, center, aligned,
	...rest
}) => {
	return <div
		className={classNames(
			className,
			{
				red, orange, yellow, olive, green, teal, blue, violet, purple,
				pink, brown, grey, black,
				basic, circular, disabled, inverted, loading, piled, placeholder,
				raised, secondary, stacked, tall, tertiary, vertical,
				bottom, top, attached, very, padded, compact, clearing,
				left, right, floated, center, aligned
			},
			'ui segment')}
		{...rest}
	>{children}</div>;
}
