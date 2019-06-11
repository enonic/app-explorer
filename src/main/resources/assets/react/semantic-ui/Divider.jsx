import classNames from 'classnames';


export const Divider = ({
	className,
	children,

	clearing, hidden,

	...rest
}) => {
	return <div
		className={classNames(
			className,
			{clearing, hidden},
			'ui divider'
		)}
		{...rest}
	>{children}</div>;
}
