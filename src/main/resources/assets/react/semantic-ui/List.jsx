import classNames from 'classnames';


export const List = ({
	children,
	className,
	animated, bulleted, celled, divided, link, ordered, relaxed, selection,
	...rest
}) => {
	return <div
		className={classNames(
			className,
			{
				animated, bulleted, celled, divided, link, ordered, relaxed,
				selection
			},
			'ui list'
		)}
		{...rest}
	>{children}</div>;
} // List
