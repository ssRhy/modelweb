module.exports = {
  extends: ["next", "next/core-web-vitals"],
  rules: {
    // Disable some strict TypeScript rules that might be causing problems
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "react/no-unknown-property": "off",
  },
};
