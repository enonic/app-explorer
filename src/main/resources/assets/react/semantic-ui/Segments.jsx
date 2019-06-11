import classNames from 'classnames';


export const Segments = ({
	children,
	className,
	horizontal,
	piled,
	raised,
	stacked,
	...rest
}) => {
	return <div
		className={classNames(
			className,
			{
				horizontal,
				piled,
				raised,
				stacked
			},
			'ui segments')}
		{...rest}
	>{children}</div>;
}
