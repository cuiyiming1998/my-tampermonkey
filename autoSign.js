// ==UserScript==
// @name         掘金自动签到助手
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  掘金自动签到
// @author       Young
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @run-at       document-idle
// @noframes
// ==/UserScript==

(function () {
  'use strict'

  // 如果签到年月日和今天一样,不需要在签到,直接返回
  const signTime = GM_getValue('signTime', '')
  if (signTime === new Date().toLocaleDateString()) {
    return
  }

  const targetPage = 'https://juejin.cn/user/center/signin'

  // --- 1. 签到页面逻辑 ---
  // 所有资源加载完成 (load事件)
  unsafeWindow.addEventListener('load', () => {
    // 签到逻辑只在https://juejin.cn/user/center/signin页面执行
    if (!location.href.startsWith(targetPage)) {
      return
    }

    // 获取签到按钮DOM对象
    const signBtn = document.querySelector('.code-calender button.btn')
    if (!signBtn)
      return

    if (signBtn.tectContent.includes('立即签到')) {
      console.log('未签到')
      // 点击签到按钮
      signBtn.click()
      // 签到成功后,将签到时间存储到本地
      GM_setValue('signTime', new Date().toLocaleDateString())
      // 签到成功后,关闭当前页面
      window.close()
    }
  })

  // --- 2. 首页逻辑 ---
  //   未签到的情况下,只有非签到页才进行后台打开签到页
  if (!location.href.startsWith(targetPage)) {
    // 打开签到页
    const tab = GM_openInTab(targetPage)
    tab.onclose = () => {
      alert('签到成功')
    }
  }
})()
