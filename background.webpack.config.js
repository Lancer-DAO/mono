const path = require('path');

module.exports = {
  entry: './src/background/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },{
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
        "@/*": path.resolve(__dirname,"./"),
        "@/assets":  path.resolve(__dirname, "./src/assets"),
        "@/atoms": path.resolve(__dirname,"./src/atoms/index.ts"),
        "@/background": path.resolve(__dirname,"./src/background/index.ts"),
        "@/components": path.resolve(__dirname,"./src/components/index.ts"),
        "@/constants": path.resolve(__dirname,"./src/constants/index.ts"),
        "@/content": path.resolve(__dirname,"./src/content"),
        "@/pages": path.resolve(__dirname,"./src/pages/index.ts"),
        "@/styles": path.resolve(__dirname,"./src/styles"),
        "@/types": path.resolve(__dirname,"./src/types/index.ts"),
        "@/utils": path.resolve(__dirname,"./src/utils/index.ts")
    }
  },
  output: {
    filename: 'background.js',
    path: path.resolve(__dirname, 'extension'),
  },
};