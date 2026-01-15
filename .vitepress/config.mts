import { defineConfig } from 'vitepress'

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// 获取给定目录下的所有文件夹作为分类，排除public文件夹
function getCategory(dirPath : string) {
  const dirs = fs.readdirSync(dirPath);
  let categories : any = []
  for (const dir of dirs) {
    const subPath = path.join(dirPath, dir)
    if (fs.statSync(subPath).isDirectory()) {
      if (dir == 'public'){
        continue
      }
      categories.push(dir)
    }
  }
  return categories
}

// 根据src目录下的文件夹，生成导航栏
function getNavigationBar() {
  const dirPath = path.resolve(__dirname, '../src')
  const cats = getCategory(dirPath)
  let nav : any = []
  nav.push({ text: '主页', link: '/' })
  for (const dir of cats) {
    const subPath = path.join(dirPath, dir)
    if (fs.statSync(subPath).isDirectory()) {
      nav.push({ text: dir, link: `/${dir}/` })
    }
  }
  return nav
}

// 根据给定目录下的文件夹，生成一个侧边栏组
function getSidebarList(dirPath: string, category: string) {
  const dirs = fs.readdirSync(dirPath);
  let docsPath : any = []
  for (const dir of dirs) {
    const subPath = path.join(dirPath, dir)
    if (fs.statSync(subPath).isDirectory()) {
      const files = fs.readdirSync(subPath)
      const items = files.map(file => {
        const filePath = path.join(subPath, file)
        const content = fs.readFileSync(filePath, 'utf-8')
        const { data } = matter(content)
        return {
          text: data.title || file.replace(/\.md$/, ''),
          link: data.path || `/${category}/${dir}/${file.replace(/\.md$/, '')}`
        }
      })

      if (items.length > 0) {
        docsPath.push({ text: dir, collapsed: false, items: items })
      }
    }
    else {
      if (dir == 'index.md') {
        continue
      }
      const content = fs.readFileSync(subPath, 'utf-8')
      const { data } = matter(content)
      docsPath.push({
        text: data.title || dir.replace(/\.md$/, ''),
        link: data.path || `/${category}/${dir.replace(/\.md$/, '')}`
      })
    }
  }
  return docsPath
}

// 根据src目录下的文件夹，生成侧边栏
function getSidebar() {
  const dirPath = path.resolve(__dirname, '../src')
  const postCategory = getCategory(dirPath)
  let routes : any = {}
  for (const category of postCategory) {
    const subPath = path.join(dirPath, category)
    if (fs.statSync(subPath).isDirectory()) {
      const docsPath = getSidebarList(subPath, category)
      if (docsPath.length > 0) {
        routes[`/${category}/`] = docsPath
      }
    }
  }
  return routes
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "src",
  srcExclude: ['**/README.md', '**/TODO.md'],

  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  
  title: "苏格拉底儿",
  description: "破茧成蝶，羽化成仙。",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: getNavigationBar(),

    sidebar: getSidebar(),

    socialLinks: [
      { icon: 'github', link: 'https://github.com/MissingMeow' }
    ],
    
    footer: {
      message: "基于 MIT 许可发布, 由 VitePress 驱动",
      copyright: "版权所有 © 1991-2026 苏格拉底儿",
    },

    outline: {
      level: [2, 3],
      label: "页面导航",
    },

    lastUpdated: {
      text: "最后更新",
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除查询条件',
            backButtonTitle: '返回',
            noResultsText: '无法找到相关结果',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            }
          }
        }
      }
    },

    returnToTopLabel: "回到顶部",
    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },
    darkModeSwitchLabel: "主题",
    darkModeSwitchTitle: "切换到深色模式",
    lightModeSwitchTitle: "切换到浅色模式",
    sidebarMenuLabel: "菜单",

    notFound: {
      title: "发现了一条不通罗马的大路",
      quote: "我怎么被弄丢了啊，不是的，不是的，一定是你打开的方式不对。",
      linkLabel: "回到主页",
      linkText: "带我回家",
    },
  }
})
