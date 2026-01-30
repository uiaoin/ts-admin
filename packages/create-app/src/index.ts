#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

const program = new Command();

interface ProjectOptions {
  name: string;
  template: string;
  packageManager: string;
  gitInit: boolean;
}

async function createProject(projectName: string | undefined) {
  console.log(chalk.cyan('\n🚀 TS Admin - TypeScript 全栈后台管理框架\n'));

  const answers = await inquirer.prompt<ProjectOptions>([
    {
      type: 'input',
      name: 'name',
      message: '项目名称:',
      default: projectName || 'my-ts-admin',
      when: !projectName,
    },
    {
      type: 'list',
      name: 'template',
      message: '选择模板:',
      choices: [
        { name: 'default - 完整模板 (推荐)', value: 'default' },
        { name: 'minimal - 最小化模板', value: 'minimal' },
      ],
      default: 'default',
    },
    {
      type: 'list',
      name: 'packageManager',
      message: '选择包管理器:',
      choices: ['pnpm', 'npm', 'yarn'],
      default: 'pnpm',
    },
    {
      type: 'confirm',
      name: 'gitInit',
      message: '初始化 Git 仓库?',
      default: true,
    },
  ]);

  const name = projectName || answers.name;
  const targetDir = path.resolve(process.cwd(), name);

  // 检查目录是否存在
  if (fs.existsSync(targetDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `目录 ${name} 已存在，是否覆盖?`,
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(chalk.red('✖ 操作已取消'));
      process.exit(1);
    }

    await fs.remove(targetDir);
  }

  const spinner = ora('正在创建项目...').start();

  try {
    // 获取模板目录
    const templateDir = path.resolve(__dirname, '../../templates', answers.template);
    
    // 检查模板是否存在
    if (!fs.existsSync(templateDir)) {
      // 如果本地模板不存在，从 npm 包或 git 下载
      spinner.text = '正在下载模板...';
      
      // 创建目标目录
      await fs.ensureDir(targetDir);
      
      // 使用 degit 或 git clone (简化版本，直接复制)
      // 在实际发布时，这里应该从 npm 或 git 下载模板
      throw new Error(`模板 "${answers.template}" 不存在`);
    }

    // 复制模板
    spinner.text = '正在复制模板...';
    await fs.copy(templateDir, targetDir);

    // 更新 package.json
    spinner.text = '正在配置项目...';
    const pkgPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      pkg.name = name;
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    }

    // 初始化 Git
    if (answers.gitInit) {
      spinner.text = '正在初始化 Git 仓库...';
      execSync('git init', { cwd: targetDir, stdio: 'ignore' });
    }

    spinner.succeed(chalk.green('项目创建成功!'));

    // 输出后续步骤
    console.log('\n下一步:');
    console.log(chalk.cyan(`  cd ${name}`));
    console.log(chalk.cyan(`  ${answers.packageManager} install`));
    console.log(chalk.cyan(`  docker-compose -f docker-compose.dev.yml up -d`));
    console.log(chalk.cyan(`  cp .env.example server/.env`));
    console.log(chalk.cyan(`  ${answers.packageManager} run dev`));
    console.log('\n详细文档: https://github.com/your-username/ts-admin');
    console.log('');

  } catch (error) {
    spinner.fail(chalk.red('项目创建失败'));
    console.error(error);
    process.exit(1);
  }
}

program
  .name('create-ts-admin')
  .description('创建 TS Admin 项目')
  .version('1.0.0')
  .argument('[project-name]', '项目名称')
  .action(createProject);

program.parse();
