// highly performant from underscore
export const isFunction = v => !!(v && v.constructor && v.call && v.apply);
