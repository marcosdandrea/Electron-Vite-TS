const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/app/main.ts',
    target: 'node',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist/headless'),
        clean: true,
        library: {
            type: 'commonjs2'
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        configFile: 'tsconfig-headless.json'
                    }
                },
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        extensionAlias: {
            '.js': ['.ts', '.tsx', '.js']
        },
        plugins: [
            new TsconfigPathsPlugin({ 
                configFile: './tsconfig-headless.json',
                extensions: ['.ts', '.tsx', '.js']
            })
        ]
    },
    externals: {
        'electron': 'commonjs electron',
        'fs': 'commonjs fs',
        'path': 'commonjs path',
        'os': 'commonjs os',
        'url': 'commonjs url',
        'dotenv/config': 'commonjs dotenv/config'
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    mangle: true,
                    compress: {
                        drop_console: true,
                        drop_debugger: true,
                    },
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
    },
    plugins: [
        {
            apply: (compiler) => {
                compiler.hooks.afterEmit.tap('CopyFiles', () => {
                    // Copy package.json
                    const packageSource = path.resolve(__dirname, 'headless-package.json');
                    const packageDest = path.resolve(__dirname, 'dist/headless/package.json');
                    fs.copyFileSync(packageSource, packageDest);
                    console.log('Copied package.json for headless distribution');
                    
                    // Copy start script
                    const scriptSource = path.resolve(__dirname, 'start-headless.bat');
                    const scriptDest = path.resolve(__dirname, 'dist/headless/start.bat');
                    fs.copyFileSync(scriptSource, scriptDest);
                    console.log('Copied start script for headless distribution');
                });
            }
        }
    ]
};