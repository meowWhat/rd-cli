const { version } = require('./constans.js')
const program = require('commander')
const path = require('path')


const mapActions = {
  create: {
    alias: 'c',
    description: 'create a project',
    examples: ['rd-cli create <project-name>'],
  },
  '*': {
    alias: '',
    description: 'command not found',
    examples: [],
  },
}

Object.keys(mapActions).forEach((el) => {
  const obj = mapActions[el]
  program
    .command(el)
    .alias(obj.alias)
    .description(obj.description)
    .action(() => {
      if (el === '*') {
        console.log(obj.description)
      } else {
        //执行模块代码
        require(path.resolve(__dirname, `${el}.js`))(process.argv.slice(3)[0])
      }
    })
})

program.on('--help', () => {
  //监听 选项
  Object.keys(mapActions).forEach((el) => {
    const examples = mapActions[el].examples
    examples.forEach((el) => {
      console.log(`  ${el}`)
    })
  })
})

//解析用户传递过来的参数
program.version(version).parse(process.argv)
