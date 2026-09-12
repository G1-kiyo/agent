module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
  ],
  ignorePatterns: [".eslintrc.js", "node_modules"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    project: true,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "react"],
  rules: {
    // Only warn on unused variables, and ignore variables starting with `_`
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
    ],

    // Await your promises
    "@typescript-eslint/no-floating-promises": "error",

    // Allow explicit `any`s
    "@typescript-eslint/no-explicit-any": "off",

    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-expressions":[
      "error",
      {
        allowShortCircuit:true,
        allowTernary:true
      }
    ]
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};

