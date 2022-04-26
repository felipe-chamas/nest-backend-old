import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import del from 'rollup-plugin-delete';
import { uglify } from 'rollup-plugin-uglify';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/sdk.js',
      sourcemap: true,
      format: 'umd',
      name: 'sdk',
    },
    plugins: [
      del({ targets: ['dist/*'], hook: 'buildStart' }),
      typescript({ tsconfig: './tsconfig.sdk.json' }),
      nodeResolve(),
      commonjs(),
      uglify(),
    ],
    watch: {
      include: './src/**/*',
      clearScreen: false,
    },
  },
  {
    input: './dist/types/src/index.d.ts',
    output: {
      file: './dist/sdk.d.ts',
      format: 'es',
    },
    plugins: [dts()],
    watch: {
      include: './dist/types/**/*',
      clearScreen: false,
      chokidar: {
        awaitWriteFinish: true,
      },
    },
  },
]);
