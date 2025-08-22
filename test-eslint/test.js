// Test file for ESLint
const test = 'test';
console.log(test);

// This should trigger a linting error
const unused = 'unused';

// This is a function that uses the unused variable
function testFunction() {
  console.log(unused);
}

testFunction();
