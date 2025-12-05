// ==UserScript==
// @name         元素属性快速复制
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  鼠标悬浮高亮元素，并一键复制类名、文本、HTML 等属性（按钮栏固定在左上角）
// @author       Young
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_addElement
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @noframes
// ==/UserScript==

(function () {
  'use strict'

  let currentElement = null // 当前悬浮的元素
  let buttonBar = null // 左上角的按钮栏 DOM

  // 注册菜单命令，手动启用复制功能
  GM_registerMenuCommand('属性复制', () => {
    document.addEventListener('mousemove', handleMouseMove, true) // 启动悬浮监听
  })

  // 鼠标移动事件处理函数
  function handleMouseMove(e) {
    const el = e.target

    // 如果是上一个元素，或鼠标在按钮栏内部，则不处理
    if (el === currentElement || el === buttonBar || buttonBar?.contains(el))
      return

    // 移除旧的按钮栏和高亮
    if (buttonBar)
      buttonBar.remove()
    removeHighlight(currentElement)

    currentElement = el
    highlightElement(el) // 给当前元素加高亮
    createCopyButtons(el) // 显示按钮栏
  }

  // 给元素添加高亮边框
  function highlightElement(el) {
    // 只添加一次样式类定义
    GM_addStyle(`
      .tm-hover-highlight {
        box-shadow: 0 0 0 1px rgba(0, 123, 255, 0.7) inset, 0 0 5px rgba(0, 123, 255, 0.5);
        background-color: rgba(0, 123, 255, 0.3) !important;
        border-radius: 4px;
        transition: all 0.2s ease;
        z-index: 9999;
      }
    `)
    el.classList.add('tm-hover-highlight')
  }

  // 移除高亮
  function removeHighlight(el) {
    el?.classList?.remove('tm-hover-highlight')
  }

  // 创建按钮栏并添加复制按钮
  function createCopyButtons(el) {
    // 获取目标元素位置
    const rect = el.getBoundingClientRect()
    const top = rect.top + window.scrollY - 32
    const left = rect.left + window.scrollX

    // 使用 GM_addElement 创建按钮栏 div
    buttonBar = GM_addElement(document.body, 'div', {
      innerHTML: '',
      style: `
        position: absolute;
        top: ${top}px;
        left: ${left}px;
        background: rgba(0,0,0,0);
        padding: 8px 0;
        font-size: 12px;
        z-index: 100000;
        display: flex;
        gap: 3px;
      `,
    })

    // 添加按钮函数，每个按钮复制不同的属性
    function addButton(label, content, type) {
      const btn = GM_addElement(buttonBar, 'button', {
        textContent: label,
        style: `
          background: #409EFF;
          color: white;
          border: none;
          padding: 2px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        `,
      })

      // 设置悬浮变色（必须手动绑定，GM_addElement 不支持伪类）
      btn.onmouseenter = () => btn.style.background = '#66b1ff'
      btn.onmouseleave = () => btn.style.background = '#409EFF'

      // 点击后复制内容到剪贴板
      btn.onclick = () => {
        if (content) {
          // 写入剪贴板
          GM_setClipboard(content, type || 'text', () => {
            showCopySuccess() // 显示成功提示
            cleanup() // 清理监听
          })
        }
      }
    }

    // 按需添加按钮（非空才添加）
    if (el.className) {
      addButton('复制类名', el.className)
    }
    if (el.textContent.trim()) {
      addButton('复制文本', el.textContent.trim())
    }
    if (el.innerHTML.trim()) {
      addButton('复制HTML', el.innerHTML.trim(), 'html')
    }
  }

  // 显示“复制成功”的绿色提示条
  function showCopySuccess() {
    const tip = GM_addElement(document.body, 'div', {
      textContent: '复制成功！',
      style: `
        position: fixed;
        top: 40px;
        left: 50%;
        transform: translateX(-50%);
        background: #28a745;
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 100001;
      `,
    })

    // 2 秒后移除提示
    setTimeout(() => tip.remove(), 2000)
  }

  // 清除按钮栏与监听器，实现一次性复制
  function cleanup() {
    document.removeEventListener('mousemove', handleMouseMove, true) // 停止监听
    if (buttonBar)
      buttonBar.remove() // 删除按钮栏
    removeHighlight(currentElement) // 移除高亮
    currentElement = null
    buttonBar = null
  }
})()
