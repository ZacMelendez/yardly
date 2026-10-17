import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

const eslintConfig = [{
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
}, ...compat.extends("next/core-web-vitals", "next/typescript"), {
    ignores: [
        ".next/**/*",
        "node_modules/**/*",
        "dist/**/*",
        "build/**/*",
        "scripts/**/*"
    ]
}, {
    rules: {
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_"
            }
        ],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@next/next/no-img-element": "off",
        "@typescript-eslint/no-empty-object-type": "off",
        "@typescript-eslint/triple-slash-reference": "off",
        "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
        "react/no-unescaped-entities": "off"
    }
}];

export default eslintConfig;