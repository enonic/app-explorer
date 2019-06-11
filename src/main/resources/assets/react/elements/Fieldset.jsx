export const Fieldset = ({children, legend, ...rest}) =>
	<fieldset {...rest}><legend>{legend}</legend>{children}</fieldset>;
