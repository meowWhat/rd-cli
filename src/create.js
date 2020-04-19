const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const ora = require('ora')
const { downloadDirectory } = require('./constans')
const inquirer = require('inquirer')

//down 包 copy
let downloadGitRepo = require('download-git-repo')
let ncp = require('ncp')

//模板部分
//遍历文件
const MS = require('metalsmith')
//统一模板引擎
let { render } = require('consolidate').ejs

//promisify
ncp = promisify(ncp)
downloadGitRepo = promisify(downloadGitRepo)
rendedr = promisify(render)

// loading 函数
const waitFnloading = (fn, message) => async (...args) => {
  const spinner = ora(message)
  spinner.start()
  let res = await fn(...args)
  spinner.succeed()
  return res
}

//down包
const download = async (repo, tag) => {
  let api = `meowWhat/${repo}`
  if (tag) {
    api += `#${tag}`
  }
  //user/xxx/.template
  let dist = `${downloadDirectory}/${repo}`
  await downloadGitRepo(api, dist)
  return dist
}

module.exports = async (projectName) => {
  //获取项目的模板
  //拿到仓库列表
  if (projectName === undefined) {
    console.log('   项目名称不允许为空哦,请输入rd-cli create xxx ')
    return
  }
  //down包
  let dist = `${downloadDirectory}/rd-template`
  if (!fs.existsSync(dist)) {
    await waitFnloading(download, 'fetching  template ....')(
      'rd-template',
      null
    )
  }
  //填写用户信息
  if (!fs.existsSync(path.join(dist, 'ask.js'))) {
    //没有ask 文件 直接渲染
    await ncp(dist, path.resolve(projectName))
  } else {
    //复杂的模板
    await new Promise((resolve, reject) => {
      MS(__dirname)
        .source(dist)
        .destination(path.resolve(projectName))
        .use(async (files, metal, done) => {
          const args = require(path.join(dist, 'ask.js'))
          const obj = await inquirer.prompt(args)
          let temp = metal.metadata()
          //将询问者结果  挂到metal 上
          Object.assign(temp, obj)
          //delete ask
          delete files['ask.js']
          done()
        })
        .use((files, metal, done) => {
          let res = metal.metadata()
          res.projectName = projectName
          Object.keys(files).forEach(async (el) => {
            if (
              el.includes('js') ||
              el.includes('json') ||
              el.includes('html')
            ) {
              let content = files[el].contents
              if (content.toString().includes('<%')) {
                //渲染模板 并替换
                let text = await render(content.toString(), res)
                files[el].contents = Buffer.from(text)
              }
            }
          })
          done()
        })
        .build((err) => {
          if (err) {
            reject()
          } else {
            resolve()
          }
        })
    })
    //渲染完成
    console.log(`  模板下载完成,请按照一下提示启动项目
     
       1:   cd  ./${projectName} 
         
       2:   yarn    || npm install

       3:   yarn start  ||  npm run start
     
       
       更多功能请参考redark官网:http://www.jiahao.site/'  
    `)
  }
}
