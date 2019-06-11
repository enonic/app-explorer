import classNames from 'classnames';


export const Labels = ({
	className,
	red, orange, yellow, olive, green, teal, blue, violet, purple, pink, brown,
	grey, black,
	mini, tiny, small, medium, large, big, huge, massive,
	circular, tag,
	...rest
}) => <div
	className={classNames(
		className,
		{
			red, orange, yellow, olive, green, teal, blue, violet, purple, pink,
			brown, grey, black,
			mini, tiny, small, medium, large, big, huge, massive,
			circular, tag
		},
		'ui labels'
	)}
	{...rest}
></div>;
