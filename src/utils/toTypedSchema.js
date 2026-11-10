// VeeValidate 4.15+ accepts Standard Schema validators directly. Zod 4
// implements that contract, so JavaScript consumers do not need the legacy
// @vee-validate/zod adapter (which only supports vulnerable Zod 3 releases).
export const toTypedSchema = (schema) => schema;
