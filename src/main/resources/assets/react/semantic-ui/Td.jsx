import classNames from 'classnames';


export const Td = ({
	children,
	className,
	collapsing,
	dataSortValue,
	...rest
}) => <td
	className={classNames(className, {
		collapsing
	})}
	data-sort-value={dataSortValue}
	{...rest}
>{children}</td>
