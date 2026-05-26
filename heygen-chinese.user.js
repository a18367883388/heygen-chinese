// ==UserScript==
// @name         HeyGen 中文汉化
// @namespace    https://github.com/a18367883388/heygen-chinese
// @version      1.0.0
// @description  将 HeyGen 界面翻译为简体中文
// @author       阿威
// @match        https://app.heygen.com/*
// @match        https://www.heygen.com/*
// @icon         https://www.heygen.com/favicon.ico
// @grant        none
// @run-at       document-end
// @require      https://raw.githubusercontent.com/a18367883388/heygen-chinese/main/locals.js
// @supportURL   https://github.com/a18367883388/heygen-chinese/issues
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  const DEBUG = false;
  const TRANSLATED_ATTR = 'data-heygen-chinese-translated';
  const OBSERVER_DELAY = 80;

  const SKIP_TAGS = new Set([
    'SCRIPT',
    'STYLE',
    'TEXTAREA',
    'INPUT',
    'SELECT',
    'OPTION',
    'CODE',
    'PRE',
    'NOSCRIPT',
    'IFRAME',
    'CANVAS',
    'SVG'
  ]);

  const USER_CONTENT_SELECTORS = [
    '[contenteditable="true"]',
    '[role="textbox"]',
    '[data-slate-editor="true"]',
    '[data-lexical-editor="true"]',
    '[class*="script" i][contenteditable="true"]',
    '[class*="title" i] input',
    '[class*="title" i] textarea'
  ];

  const dictionary = getDictionary();
  const exactMap = new Map();
  const lowerMap = new Map();
  const trimmedMap = new Map();

  buildIndexes(dictionary);

  function log(...args) {
    if (DEBUG) {
      console.info('[HeyGen 中文汉化]', ...args);
    }
  }

  function getDictionary() {
    if (typeof window.HEYGEN_CHINESE_LOCALES === 'object' && window.HEYGEN_CHINESE_LOCALES) {
      return window.HEYGEN_CHINESE_LOCALES;
    }

    if (typeof HEYGEN_CHINESE_LOCALES === 'object' && HEYGEN_CHINESE_LOCALES) {
      return HEYGEN_CHINESE_LOCALES;
    }

    console.warn('[HeyGen 中文汉化] locals.js 未加载，脚本将不会执行翻译。');
    return {};
  }

  function buildIndexes(locales) {
    Object.entries(locales).forEach(([source, target]) => {
      exactMap.set(source, target);
      trimmedMap.set(source.trim(), target);
      lowerMap.set(source.trim().toLowerCase(), target);
    });
  }

  function shouldSkipElement(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }

    if (SKIP_TAGS.has(element.tagName)) {
      return true;
    }

    if (element.isContentEditable) {
      return true;
    }

    return USER_CONTENT_SELECTORS.some((selector) => {
      try {
        return element.matches(selector) || Boolean(element.closest(selector));
      } catch (error) {
        log('忽略无效选择器', selector, error);
        return false;
      }
    });
  }

  function shouldSkipPlaceholderElement(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return true;
    }

    if (!('placeholder' in element)) {
      return true;
    }

    if (element.closest('[data-heygen-chinese-ignore]')) {
      return true;
    }

    return USER_CONTENT_SELECTORS.some((selector) => {
      try {
        return element.matches(selector) || Boolean(element.closest(selector));
      } catch (error) {
        log('忽略无效选择器', selector, error);
        return false;
      }
    });
  }

  function shouldSkipTextNode(node) {
    const parent = node.parentElement;
    if (!parent || shouldSkipElement(parent)) {
      return true;
    }

    if (parent.closest('[data-heygen-chinese-ignore]')) {
      return true;
    }

    const text = node.textContent;
    if (!text || !text.trim()) {
      return true;
    }

    // 避免翻译明显的用户数据或变量内容。
    if (/https?:\/\/|@|^\d+([.,:]\d+)*$/.test(text.trim())) {
      return true;
    }

    return false;
  }

  function translateText(text) {
    if (!text) {
      return text;
    }

    if (exactMap.has(text)) {
      return exactMap.get(text);
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return text;
    }

    if (trimmedMap.has(trimmed)) {
      return preserveWhitespace(text, trimmedMap.get(trimmed));
    }

    const lower = trimmed.toLowerCase();
    if (lowerMap.has(lower)) {
      return preserveWhitespace(text, lowerMap.get(lower));
    }

    return text;
  }

  function preserveWhitespace(original, translated) {
    const leading = original.match(/^\s*/)?.[0] || '';
    const trailing = original.match(/\s*$/)?.[0] || '';
    return `${leading}${translated}${trailing}`;
  }

  function translateTextNode(node) {
    if (shouldSkipTextNode(node)) {
      return;
    }

    const translated = translateText(node.textContent);
    if (translated !== node.textContent) {
      node.textContent = translated;
      node.parentElement?.setAttribute(TRANSLATED_ATTR, 'text');
      log('文本', translated);
    }
  }

  function translatePlaceholder(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    if (shouldSkipPlaceholderElement(element)) {
      return;
    }

    const placeholder = element.getAttribute('placeholder');
    const translated = translateText(placeholder);
    if (placeholder && translated !== placeholder) {
      element.setAttribute('placeholder', translated);
      element.setAttribute(TRANSLATED_ATTR, 'placeholder');
      log('placeholder', translated);
    }
  }

  function translateNode(root) {
    if (!root) {
      return;
    }

    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root);
      return;
    }

    if (root.nodeType !== Node.ELEMENT_NODE || shouldSkipElement(root)) {
      return;
    }

    translatePlaceholder(root);

    root.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(translatePlaceholder);

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return shouldSkipTextNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    nodes.forEach(translateTextNode);
  }

  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn.apply(this, args), delay);
    };
  }

  const scheduleTranslate = debounce(() => translateNode(document.body), OBSERVER_DELAY);

  function setupObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldTranslate = false;

      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldTranslate = true;
          break;
        }

        if (mutation.type === 'characterData') {
          translateTextNode(mutation.target);
        }

        if (mutation.type === 'attributes' && mutation.attributeName === 'placeholder') {
          translatePlaceholder(mutation.target);
        }
      }

      if (shouldTranslate) {
        scheduleTranslate();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder']
    });

    log('MutationObserver 已启动');
  }

  function init() {
    if (!document.body) {
      window.setTimeout(init, 50);
      return;
    }

    translateNode(document.body);
    setupObserver();
    log('已加载词条数', Object.keys(dictionary).length);
  }

  init();
})();
