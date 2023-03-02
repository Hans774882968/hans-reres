import chalk from 'chalk';
import spawn from 'cross-spawn';

function displayTime (time: number) {
  return (time / 1000).toFixed(2);
}

function main () {
  const startTime = new Date().valueOf();
  // npm run lint会返回失败码，这里直接忽略
  const lintCmds = ['npm run lint:s', 'npm run lint'];
  const lintDurations: string[] = [];
  lintCmds.forEach((lintCmd) => {
    const startTime = new Date().valueOf();
    console.log(chalk.greenBright(lintCmd));
    spawn.sync(lintCmd, [], { stdio: 'inherit' });
    lintDurations.push(displayTime(new Date().valueOf() - startTime));
  });
  const cmds = [
    'npx tsc',
    'npx vite build',
    'npx vite build --config vite-bg.config.ts'
  ];
  const buildCmd = cmds.join(' && ');
  console.log(chalk.greenBright('Build command:', buildCmd));
  // 加 shell: true 解决MAC上运行报错 Error: spawnSync <cmd> ENOENT 导致无法构建的问题
  // https://stackoverflow.com/questions/27688804/how-do-i-debug-error-spawn-enoent-on-node-js
  const spawnReturn = spawn.sync(buildCmd, [], { shell: true, stdio: 'inherit' });
  if (spawnReturn.error) {
    console.error(chalk.redBright('Build failed with error'), spawnReturn.error);
    return;
  }
  const duration = displayTime(new Date().valueOf() - startTime);
  lintDurations.forEach((lintDuration, i) => {
    console.log(`✨  ${lintCmds[i]}`, chalk.greenBright(`'s duration: ${lintDuration}s`));
  });
  console.log(chalk.greenBright(`✨  Done in ${duration}s.`));
}

main();
