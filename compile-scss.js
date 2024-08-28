const sass = require('sass');
const fs = require('fs');
const path = require('path');

const inputFilePath1 = path.resolve(__dirname, 'client/styles/main.scss');
const outputFilePath1 = path.resolve(__dirname, 'public/css/main.css');
const inputFilePath2 = path.resolve(__dirname, 'client/styles/ga-main.scss');
const outputFilePath2 = path.resolve(__dirname, 'public/css/ga-main.css');

sass.render({
  file: inputFilePath1,
  outFile: outputFilePath1,
  outputStyle: 'compressed'
}, (error, result) => {
  if (error) {
    console.error('Sass compilation error:', error);
    return;
  }
  fs.writeFileSync(outputFilePath1, result.css);
  console.log('Sass compiled successfully!');
});

sass.render({
  file: inputFilePath2,
  outFile: outputFilePath2,
  outputStyle: 'compressed'
}, (error, result) => {
  if (error) {
    console.error('Sass compilation error:', error);
    return;
  }
  fs.writeFileSync(outputFilePath2, result.css);
  console.log('Sass compiled successfully!');
});
