//const Locale = Java.type('java.util.Locale');
//const {Locale} = Java.type('java.util');
export const {getAvailableLocales: getLocales} = Java.type('java.util.Locale');

/*export const getLocales = () => {
	//const BEAN = __.newBean('com.enonic.explorer.Locales');
	//return __.toNativeObject(BEAN.getLocales());
	//return __.toNativeObject(Locale.getLocales());
	return __.toNativeObject(getAvailableLocales());
};*/
//export const getLocales = () => BEAN.getLocales();
