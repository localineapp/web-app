import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "lucide-react",
              importNames: ["Link"],
              message:
                "Import 'LinkIcon' from 'lucide-react' instead of 'Link' to avoid confusion with 'next/link'.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["src/app/api/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "src/components/ui/**",
    "next-env.d.ts",
  ]),
])
