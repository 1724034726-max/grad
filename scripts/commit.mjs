import { spawnSync } from 'node:child_process'
import readline from 'node:readline'

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: true,
    ...opts,
  })
  return res.status ?? 1
}

function runCapture(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    ...opts,
  })
  return {
    code: res.status ?? 1,
    stdout: (res.stdout || '').toString(),
    stderr: (res.stderr || '').toString(),
  }
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  )
}

function filterTargets(files) {
  const allow = new Set([
    '.js',
    '.cjs',
    '.mjs',
    '.ts',
    '.tsx',
    '.vue',
    '.json',
    '.css',
    '.scss',
    '.md',
    '.yml',
    '.yaml',
  ])
  return files.filter((f) => {
    const lower = f.toLowerCase()
    if (lower.startsWith('dist/') || lower.includes('/dist/')) return false
    if (lower.startsWith('node_modules/') || lower.includes('/node_modules/')) return false
    const dot = lower.lastIndexOf('.')
    if (dot === -1) return false
    return allow.has(lower.slice(dot))
  })
}

async function main() {
  // 1) 确认在 git 仓库内
  const repo = runCapture('git', ['rev-parse', '--is-inside-work-tree'])
  if (repo.code !== 0) {
    console.error('当前目录不是 git 仓库，无法 commit。')
    process.exit(1)
  }

  // 2) 获取提交信息
  const msg = process.argv.slice(2).join(' ').replace(/^['"]|['"]$/g, '')
  const commitMsg = msg || (await prompt('请输入 commit message: '))
  if (!commitMsg) {
    console.error('commit message 不能为空。')
    process.exit(1)
  }

  // 3) 先把改动加入暂存区
  if (run('git', ['add', '-A']) !== 0) process.exit(1)

  // 4) 拿到已暂存文件列表
  const diff = runCapture('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMRT'])
  if (diff.code !== 0) {
    console.error(diff.stderr || '获取暂存文件失败。')
    process.exit(1)
  }

  const staged = diff.stdout
    .split(/\r?\n/g)
    .map((s) => s.trim())
    .filter(Boolean)

  if (staged.length === 0) {
    console.log('没有可提交的改动。')
    process.exit(0)
  }

  const targets = filterTargets(staged)
  if (targets.length > 0) {
    // 5) 对暂存文件跑 eslint/prettier（仅这些文件）
    // eslint 只对代码文件跑，避免对 json/md 报 parser/规则问题
    const eslintTargets = targets.filter((f) =>
      /\.(vue|ts|tsx|js|cjs|mjs)$/i.test(f)
    )
    if (eslintTargets.length > 0) {
      const code = run('npx', ['eslint', '--fix', ...eslintTargets])
      if (code !== 0) {
        console.error('ESLint 未通过，已中止 commit。')
        process.exit(code)
      }
    }

    const prettierTargets = targets.filter((f) =>
      /\.(vue|ts|tsx|js|cjs|mjs|json|css|scss|md|yml|yaml)$/i.test(f)
    )
    if (prettierTargets.length > 0) {
      const code = run('npx', ['prettier', '--write', ...prettierTargets])
      if (code !== 0) {
        console.error('Prettier 未通过，已中止 commit。')
        process.exit(code)
      }
    }

    // 6) 格式化/修复后重新 add
    if (run('git', ['add', ...targets]) !== 0) process.exit(1)
  }

  // 7) commit
  const code = run('git', ['commit', '-m', commitMsg])
  process.exit(code)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

