import eslint from "@eslint/js"
import tsParser from "@typescript-eslint/parser"
import astroPlugin from "eslint-plugin-astro"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import globals from "globals"

export default [
    eslint.configs.recommended,
    ...astroPlugin.configs.recommended,
    {
        files: ["**/*.{js,mjs,cjs,ts,tsx}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "off",
        },
    },
    {
        files: ["**/*.{jsx,tsx}"],
        plugins: {
            react: reactPlugin,
            "react-hooks": reactHooksPlugin,
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            ...reactHooksPlugin.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react-hooks/immutability": "off",
        },
    },
    {
        files: ["public/**/*.js"],
        languageOptions: {
            globals: {
                ...globals.serviceworker,
            },
        },
    },
    {
        ignores: ["dist/**", "node_modules/**", ".astro/**"],
    },
]
