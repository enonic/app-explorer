export const MODE = 'production';
//export const MODE = 'development';

export const BOOL_LIB_EXPLORER_EXTERNAL = MODE === 'production';
//export const BOOL_LIB_EXPLORER_EXTERNAL = false;

export const BOOL_LOCAL_JS_UTILS = MODE !== 'production';
//export const BOOL_LOCAL_JS_UTILS = true;

export const BOOL_LOCAL_SEMANTIC_UI_REACT_FORM = MODE !== 'production';
//export const BOOL_LOCAL_SEMANTIC_UI_REACT_FORM = true;

export const BOOL_MINIMIZE = MODE === 'production';
//export const BOOL_MINIMIZE = true;
//export const BOOL_MINIMIZE = false;
