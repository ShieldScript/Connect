import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'prisma/**',
      'scripts/**',
      'migrations/**',
    ],
  },
  {
    rules: {
      // Downgrade no-explicit-any to warning (will fix incrementally)
      '@typescript-eslint/no-explicit-any': 'warn',
      // Downgrade unused vars to warning
      '@typescript-eslint/no-unused-vars': 'warn',
      // Downgrade unescaped entities to warning (style issue, not functional)
      'react/no-unescaped-entities': 'warn',
      // Downgrade no-html-link-for-pages to warning
      '@next/next/no-html-link-for-pages': 'warn',
    },
  },
];

export default eslintConfig;
