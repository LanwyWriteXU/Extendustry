// 本地存储工具类

const STORAGE_KEYS = {
  BLOCKS: 'blocks', // 存储所有积木的数组
  CURRENT_BLOCK_ID: 'current_block_id', // 当前编辑的积木ID
  ELEMENT_COUNTER: 'element_counter'
};

// 获取所有积木
export const getAllBlocks = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BLOCKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load blocks:', error);
    return [];
  }
};

// 保存所有积木
export const saveAllBlocks = (blocks) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));
  } catch (error) {
    console.error('Failed to save blocks:', error);
  }
};

// 添加或更新积木
export const saveBlock = (block) => {
  try {
    const blocks = getAllBlocks();
    const existingIndex = blocks.findIndex(b => b.id === block.id);
    
    if (existingIndex >= 0) {
      // 更新现有积木
      blocks[existingIndex] = block;
      console.log('更新积木:', block.name, block.id);
    } else {
      // 添加新积木
      blocks.push(block);
      console.log('添加新积木:', block.name, block.id);
    }
    
    saveAllBlocks(blocks);
    console.log('积木保存成功，总数:', blocks.length);
    return block;
  } catch (error) {
    console.error('Failed to save block:', error);
    return null;
  }
};

// 获取单个积木
export const getBlock = (id) => {
  try {
    const blocks = getAllBlocks();
    return blocks.find(b => b.id === id) || null;
  } catch (error) {
    console.error('Failed to get block:', error);
    return null;
  }
};

// 删除积木
export const deleteBlock = (id) => {
  try {
    const blocks = getAllBlocks();
    const filtered = blocks.filter(b => b.id !== id);
    saveAllBlocks(filtered);
    return true;
  } catch (error) {
    console.error('Failed to delete block:', error);
    return false;
  }
};

// 保存当前编辑的积木ID
export const saveCurrentBlockId = (id) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_BLOCK_ID, id.toString());
  } catch (error) {
    console.error('Failed to save current block id:', error);
  }
};

// 获取当前编辑的积木ID
export const getCurrentBlockId = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_BLOCK_ID);
    return data ? data : null;
  } catch (error) {
    console.error('Failed to get current block id:', error);
    return null;
  }
};

// 清空所有数据
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear all data:', error);
  }
};

// 导出所有积木为 JSON 字符串
export const exportAllData = () => {
  try {
    const blocks = getAllBlocks();
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      blocks: blocks
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Failed to export data:', error);
    return null;
  }
};

// 从 JSON 字符串导入数据
export const importAllData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    
    if (data.blocks && Array.isArray(data.blocks)) {
      saveAllBlocks(data.blocks);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};

// 下载为文件
export const downloadAsFile = (filename = 'blocks-config.json') => {
  try {
    const data = exportAllData();
    if (!data) return false;
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Failed to download file:', error);
    return false;
  }
};

// 从文件上传
export const uploadFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const success = importAllData(e.target.result);
        if (success) {
          resolve(true);
        } else {
          reject(new Error('Failed to import data'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};