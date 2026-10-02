import CopyPlugin from 'copy-webpack-plugin';
import 'dotenv/config';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const PROJECT_ROOT = import.meta.dirname;
const OUTPUT_PATH = process.env.BUILD_PATH;

export default function (env, argv) {
  const mode = argv.mode ?? 'development';
  const isProduction = mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    context: PROJECT_ROOT,
    entry: './src/main.js',
    output: {
      path: OUTPUT_PATH,
      filename: 'main.js',
      library: { type: 'commonjs2' },
      clean: true,
    },
    devtool: isProduction ? false : 'inline-source-map',
    module: {
      rules: [
        {
          test: /\.m?js$/,
          resolve: { fullySpecified: false },
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
          ],
        },
      ],
    },
    externals: ['obsidian'],
    plugins: [
      new MiniCssExtractPlugin({ filename: 'styles.css' }),
      new CopyPlugin({ patterns: [{ from: 'manifest.json' }, { from: '.hotreload' }] }),
    ],
  };
}
