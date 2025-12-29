import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.js'],
        // Vitest handles ESM automatically, so no need for complex transform ignore patterns
    },
});
