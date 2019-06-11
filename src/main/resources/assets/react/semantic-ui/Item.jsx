import classNames from 'classnames';


export const Item = ({
	children,
	className,
	...rest
}) => <div className={classNames(className, 'item')} {...rest}>{children}</div>;
