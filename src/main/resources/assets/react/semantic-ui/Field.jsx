import classNames from 'classnames';


export const Field = ({
	children,
	className,
	two,
	three,
	four,
	five,
	six,
	seven,
	eight,
	nine,
	ten,
	eleven,
	twelve,
	wide,
	...rest
}) => <div className={classNames(
	className,
	{
		two,
		three,
		four,
		five,
		six,
		seven,
		eight,
		nine,
		ten,
		eleven,
		twelve,
		wide
	},
	'field'
)} {...rest}>{children}</div>;
