import classNames from 'classnames';


export const Content = ({
	aligned,
	bottom,
	children,
	className,
	middle,
	top,
	...rest
}) => <div className={classNames(className, {
	bottom,
	middle,
	top,
	aligned
}, 'content')} {...rest}>{children}</div>;
