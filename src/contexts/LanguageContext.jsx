import React, { createContext, useContext, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import zhCN from '../locales/zh-CN';
import enUS from '../locales/en-US';

// 支持的语言
export const SUPPORTED_LANGUAGES = {
  'zh-CN': { name: '中文', flag: '🇨🇳' },
  'en-US': { name: 'English', flag: '🇺🇸' },
};

// 翻译字典
const translations = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

// 创建语言上下文
const LanguageContext = createContext();

// 语言提供者组件
export const LanguageProvider = ({ children }) => {
  // 从 Cookie 读取保存的语言设置，默认使用浏览器语言或中文
  const getInitialLanguage = () => {
    try {
      const saved = Cookies.get('app-language');
      if (saved && translations[saved]) {
        return saved;
      }
    } catch (e) {
      console.error('Failed to read language from Cookie:', e);
    }
    
    // 检测浏览器语言
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('zh')) {
      return 'zh-CN';
    }
    return 'en-US';
  };

  const [language, setLanguageState] = useState(getInitialLanguage);

  // 切换语言
  const setLanguage = useCallback((newLanguage) => {
    if (translations[newLanguage]) {
      setLanguageState(newLanguage);
      try {
        Cookies.set('app-language', newLanguage, { expires: 365 });
      } catch (e) {
        console.error('Failed to save language to Cookie:', e);
      }
    }
  }, []);

  // 获取翻译文本
  const t = useCallback((key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // 找不到翻译时返回 key
      }
    }
    
    // 如果值是字符串，支持参数替换
    if (typeof value === 'string') {
      return Object.keys(params).reduce((str, param) => {
        return str.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
      }, value);
    }
    
    return key;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// 自定义 Hook 用于使用语言上下文
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};