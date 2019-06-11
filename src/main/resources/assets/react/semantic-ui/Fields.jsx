import classNames from 'classnames';


export const Fields = ({
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
	grouped,
	inline,
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
		grouped,
		inline
	},
	'fields'
)} {...rest}>{children}</div>;
