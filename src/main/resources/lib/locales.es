const BEAN = __.newBean('com.enonic.explorer.Locales');

export const getLocales = () => __.toNativeObject(BEAN.getLocales());
//export const getLocales = () => BEAN.getLocales();
