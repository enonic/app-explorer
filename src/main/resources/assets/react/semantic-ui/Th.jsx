import classNames from 'classnames';


export const Th = ({
	children,
	className,
	collapsing,
	noSort,
	...rest
}) => <th
	className={classNames(className, {
		collapsing,
		'no-sort': noSort
	})}
	{...rest}
>{children}</th>
