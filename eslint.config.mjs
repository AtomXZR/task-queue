import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";


/** @type {import("@typescript-eslint/utils").TSESLint.FlatConfig.ConfigFile} */
export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { files: ["**/*.js"], languageOptions: { sourceType: "script" } },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,

    {
        plugins: {
            "@stylistic": stylistic,
        },
        rules: {

            // Spacing
            "@stylistic/arrow-spacing": ["error", {
                before: true,
                after: true,
            }],
            "@stylistic/block-spacing": ["error", "always"],
            "@stylistic/comma-spacing": ["error", {
                before: false,
                after: true,
            }],
            "@stylistic/computed-property-spacing": ["error", "never"],
            "@stylistic/generator-star-spacing": ["error", "before"],
            "@stylistic/key-spacing": ["error", {
                beforeColon: false,
                afterColon: true,
                mode: "strict"
            }],
            "@stylistic/keyword-spacing": ["error", {
                before: true,
                after: true,
            }],
            "@stylistic/no-mixed-spaces-and-tabs": "error",
            "@stylistic/no-trailing-spaces": "error",
            "@stylistic/no-whitespace-before-property": "error",
            "@stylistic/object-curly-spacing": ["error", "always"],
            "@stylistic/rest-spread-spacing": ["error", "never"],
            "@stylistic/semi-spacing": ["error", {
                before: false,
                after: true,
            }],
            "@stylistic/space-before-blocks": ["error", "always"],
            "@stylistic/space-before-function-paren": ["error", {
                anonymous: "always",
                named: "never",
                asyncArrow: "always"
            }],
            "@stylistic/space-in-parens": ["error", "never"],
            "@stylistic/space-infix-ops": "error",
            "@stylistic/space-unary-ops": "error",
            "@stylistic/spaced-comment": ["error", "always"],
            "@stylistic/switch-colon-spacing": ["error", {
                before: false,
                after: true,
            }],
            "@stylistic/template-curly-spacing": ["error", "never"],
            "@stylistic/type-annotation-spacing": ["error", {
                before: false,
                after: true,
            }],
            "@stylistic/type-generic-spacing": ["error"],
            "@stylistic/type-named-tuple-spacing": ["error"],
            "@stylistic/yield-star-spacing": ["error", "after"],

            //

            "@stylistic/eol-last": ["error", "always"],
            "@stylistic/linebreak-style": ["error", "unix"],

            "@stylistic/indent": ["error", 4],

            "@stylistic/quote-props": ["error", "as-needed"],
            "@stylistic/quotes": ["error", "double"],

            "@stylistic/comma-style": ["error", "last"],

            "@stylistic/semi": ["error", "always"],
            "@stylistic/semi-style": ["error", "last"],

            "@stylistic/dot-location": ["error", "property"],

            "@stylistic/lines-around-comment": ["error", {
                beforeBlockComment: true,
                beforeLineComment: true,
                allowBlockStart: true,
                allowBlockEnd: true,
                allowObjectStart: true,
                allowObjectEnd: true,
                allowArrayStart: true,
                allowArrayEnd: true,
                allowClassStart: true,
                allowClassEnd: true,
                afterHashbangComment: true,
            }],

            "@stylistic/no-confusing-arrow": ["error", {
                allowParens: true,
                onlyOneSimpleParam: false
            }],
            "@stylistic/no-extra-parens": ["error", "all"],
            "@stylistic/no-extra-semi": "error",
            "@stylistic/no-floating-decimal": "error",
            "@stylistic/no-mixed-operators": "error",
            "@stylistic/no-multi-spaces": ["error", {
                ignoreEOLComments: true
            }],
            "@stylistic/no-multiple-empty-lines": ["error", {
                max: 2
            }],
            "@stylistic/no-tabs": "error",

            "@stylistic/padded-blocks": ["error", "never"],
        }
    }
];
