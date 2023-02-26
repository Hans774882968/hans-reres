import spawn from 'cross-spawn';
import chalk from 'chalk';

function main () {
  const startTime = new Date().valueOf();
  // npm run lint会返回失败码，这里直接忽略
  const lintCmds = ['npm run lint:s', 'npm run lint'];
  lintCmds.forEach((lintCmd) => {
    console.log(chalk.greenBright(lintCmd));
    spawn.sync(lintCmd, [], { stdio: 'inherit' });
  });
  const cmds = [
    'npx tsc',
    'npx vite build',
    'npx vite build --config vite-bg.config.ts'
  ];
  const buildCmd = cmds.join(' && ');
  console.log(chalk.greenBright('Build command:', buildCmd));
  const spawnReturn = spawn.sync(buildCmd, [], { stdio: 'inherit' });
  if (spawnReturn.error) {
    console.error(chalk.redBright('Build failed with error'), spawnReturn.error);
    return;
  }
  const duration = ((new Date().valueOf() - startTime) / 1000).toFixed(2);
  console.log(chalk.greenBright(`✨  Done in ${duration}s.`));
}

main();
