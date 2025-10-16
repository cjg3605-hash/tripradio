const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runBuild() {
  console.log('Starting build process...');
  
  try {
    console.log('Running Prisma generate...');
    await execPromise('npx prisma generate');
    
    console.log('Running Next.js build...');
    const { stdout, stderr } = await execPromise('npx next build');
    
    console.log('Build output:');
    console.log(stdout);
    
    if (stderr) {
      console.error('Build errors:');
      console.error(stderr);
    }
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:');
    console.error('Error:', error.message);
    console.error('STDERR:', error.stderr);
    console.error('STDOUT:', error.stdout);
    process.exit(1);
  }
}

runBuild();
