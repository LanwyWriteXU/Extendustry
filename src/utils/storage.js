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

// 导出单个积木为 JSON
export const exportBlockAsJson = (block) => {
  try {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      block: {
        id: block.id,
        opcode: block.opcode,
        type: block.type,
        branchCount: block.branchCount,
        elements: block.elements,
        functions: block.functions || [],
        createdAt: block.createdAt,
        updatedAt: block.updatedAt
      }
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Failed to export block:', error);
    return null;
  }
};

// 下载单个积木为文件
export const downloadBlockAsFile = (block, filename) => {
  try {
    const data = exportBlockAsJson(block);
    if (!data) return false;
    
    const defaultFilename = `${block.opcode || 'block'}-${block.id}.json`;
    const finalFilename = filename || defaultFilename;
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Failed to download block file:', error);
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

// 生成 Scratch 扩展代码
export const generateExtensionCode = (blocks, extensionName = 'MyExtension', extensionId = 'my_extension', author = 'Unknown', description = 'Custom Extension') => {
  if (!blocks || blocks.length === 0) {
    return null;
  }

// 辅助函数：转义字符串中的特殊字符
  const escapeString = (str) => {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')  // 转义反斜杠
      .replace(/"/g, '\\"')     // 转义双引号
      .replace(/\n/g, '\\n')    // 转义换行符
      .replace(/\r/g, '\\r')    // 转义回车符
      .replace(/\t/g, '\\t')    // 转义制表符
      .replace(/\f/g, '\\f');   // 转义换页符
  };

  // 生成积木代码
  const blockImplementations = blocks.map(block => {
    const functionName = block.opcode;
    
    // 生成参数提取代码 - 使用 Scratch 扩展样式
    const paramExtraction = [];
    if (block.elements) {
      block.elements.forEach(element => {
        if (element.type === 'text') {
          paramExtraction.push(`  const ${element.name} = args.${element.name};`);
        } else if (element.type === 'number') {
          paramExtraction.push(`  const ${element.name} = args.${element.name};`);
        } else if (element.type === 'dropdown') {
          paramExtraction.push(`  const ${element.name} = args.${element.name};`);
        } else if (element.type === 'colour') {
          paramExtraction.push(`  const ${element.name} = args.${element.name};`);
        } else if (element.type === 'boolean') {
          paramExtraction.push(`  const ${element.name} = args.${element.name};`);
        }
      });
    }

    // 生成函数体
    let functionBody = paramExtraction.join('\n');
    
    // 如果有自定义函数，直接使用（已经是方法定义格式）
    if (block.functions && block.functions.length > 0) {
      // 直接返回用户编写的代码，不再包装
      return `    ${block.functions[0].code}`;
    } else {
      // 默认返回空字符串或根据积木类型返回默认值
      if (block.type === 'REPORTER') {
        functionBody += '\n  return "";';
      } else if (block.type === 'BOOLEAN') {
        functionBody += '\n  return false;';
      } else {
        // COMMAND 类型，添加 console.log
        if (paramExtraction.length > 0) {
          const paramNames = block.elements
            .filter(e => ['text', 'number', 'dropdown', 'colour', 'boolean'].includes(e.type))
            .map(e => e.name);
          functionBody += '\n  console.log(' + paramNames.join(', ') + ');';
        }
      }

      // 返回方法定义格式
      return `    ${functionName}(args) {
${functionBody}
    }`;
    }
  }).join('\n\n');

  // 收集所有菜单定义
  const allMenus = {};

  // 生成积木定义
  const blockDefinitions = blocks.map(block => {
    // 生成积木文本，将元素替换为参数占位符
    let blockText = '';
    let isConditional = block.type === 'CONDITIONAL';
    
    if (isConditional) {
      // CONDITIONAL 类型的文本是数组格式
      const branchLabels = [];
      let currentBranch = '';
      
      if (block.elements) {
        block.elements.forEach(element => {
          if (element.type === 'label') {
            currentBranch += element.text + ' ';
          } else if (element.type === 'statement') {
            // 分支分隔符，将当前分支文本加入数组
            if (currentBranch.trim()) {
              branchLabels.push(currentBranch.trim());
            }
            currentBranch = '';
          } else {
            // 其他参数类型
            currentBranch += `[${element.name}] `;
          }
        });
      }
      
      // 添加最后一个分支
      if (currentBranch.trim()) {
        branchLabels.push(currentBranch.trim());
      }
      
      // 转换为 JSON 数组格式，保留 Scratch.translate 调用，并转义特殊字符
      blockText = '[' + branchLabels.map(t => `Scratch.translate("${escapeString(t)}")`).join(', ') + ']';
    } else {
      // 其他类型使用普通字符串格式
      if (block.elements) {
        block.elements.forEach(element => {
          if (element.type === 'label') {
            blockText += element.text + ' ';
          } else {
            // 所有参数类型（text, number, dropdown, colour, boolean）都使用方括号
            blockText += `[${element.name}] `;
          }
        });
      }
      blockText = `Scratch.translate("${escapeString(blockText.trim())}")`;
    }

    // 生成参数定义
    const argumentsDef = {};
    if (block.elements) {
      block.elements.forEach(element => {
        if (element.type === 'text') {
          argumentsDef[element.name] = {
            type: 'Scratch.ArgumentType.STRING',
            defaultValue: element.defaultValue || ''
          };
        } else if (element.type === 'number') {
          argumentsDef[element.name] = {
            type: 'Scratch.ArgumentType.NUMBER',
            defaultValue: element.defaultValue || 0
          };
        } else if (element.type === 'dropdown') {
          argumentsDef[element.name] = {
            type: 'Scratch.ArgumentType.STRING',
            defaultValue: element.defaultValue || element.options?.[0]?.[1] || '',
            menu: `${element.name}_menu`
          };
          // 收集菜单定义
          allMenus[`${element.name}_menu`] = {
            items: element.options || []
          };
        } else if (element.type === 'colour') {
          argumentsDef[element.name] = {
            type: 'Scratch.ArgumentType.COLOR',
            defaultValue: element.defaultValue || '#ff0000'
          };
        } else if (element.type === 'boolean') {
          argumentsDef[element.name] = {
            type: 'Scratch.ArgumentType.BOOLEAN'
          };
        }
      });
    }

    // 确定积木类型
    let blockType;
    switch (block.type) {
      case 'COMMAND':
        blockType = 'Scratch.BlockType.COMMAND';
        break;
      case 'REPORTER':
        blockType = 'Scratch.BlockType.REPORTER';
        break;
      case 'BOOLEAN':
        blockType = 'Scratch.BlockType.BOOLEAN';
        break;
      case 'EVENT':
      case 'HAT':
        blockType = 'Scratch.BlockType.HAT';
        break;
      case 'LOOP':
        blockType = 'Scratch.BlockType.LOOP';
        break;
      case 'CONDITIONAL':
        blockType = 'Scratch.BlockType.CONDITIONAL';
        break;
      default:
        blockType = 'Scratch.BlockType.COMMAND';
    }

    // 构建积木定义对象
    const blockDef = {
      opcode: block.opcode,
      blockType: blockType,
      text: blockText,
      arguments: argumentsDef
    };

    // CONDITIONAL 类型需要 branchCount 属性
    if (block.type === 'CONDITIONAL' && block.branchCount) {
      blockDef.branchCount = block.branchCount;
    }

    // 手动构建积木定义，避免 JSON.stringify 对 text 字段的二次转义
    let defString = '{\n';
    defString += `            "opcode": "${escapeString(block.opcode)}",\n`;
    defString += `            "blockType": ${blockType},\n`;
    defString += `            "text": ${blockText},\n`;
    defString += `            "arguments": ${JSON.stringify(argumentsDef, null, 12).replace(/"Scratch\.ArgumentType\.(\w+)"/g, 'Scratch.ArgumentType.$1')}`;
    
    if (block.type === 'CONDITIONAL' && block.branchCount) {
      defString += `,\n            "branchCount": ${block.branchCount}`;
    }
    
    defString += '\n          }';
    
    return defString;
  }).join(',\n');

  // 生成菜单定义
  const menuDefinitions = Object.keys(allMenus).length > 0 
    ? `        menus: {
${Object.entries(allMenus).map(([menuName, menuDef]) => `          ${menuName}: {
            items: ${JSON.stringify(menuDef.items.map(item => ({ text: escapeString(item[0]), value: escapeString(item[1]) })), null, 14)}
          }`).join(',\n')}
        }` 
    : '';

  // 生成完整的扩展代码
  const extensionCode = `// Name: ${escapeString(extensionName)}
// ID: ${escapeString(extensionId)}
// Author: ${escapeString(author)}
// Description: ${escapeString(description)}
// License: MIT

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("${escapeString(extensionName)} extension must be run unsandboxed");
  }

  class ${extensionName.replace(/\s+/g, '')} {
    getInfo() {
      return {
        id: "${escapeString(extensionId)}",
        name: Scratch.translate("${escapeString(extensionName)}"),
        color1: "#4CAF50",
        color2: "#388E3C",
        blocks: [
${blockDefinitions}
        ]${menuDefinitions ? ',\n' + menuDefinitions : ''}
      };
    }

${blockImplementations}
  }

  Scratch.extensions.register(new ${extensionName.replace(/\s+/g, '')}());
})(Scratch);`;

  return extensionCode;
};

// 下载扩展文件
export const downloadExtensionFile = (blocks, extensionName = 'MyExtension', extensionId = 'my_extension', author = 'Unknown', description = 'Custom Extension') => {
  try {
    const code = generateExtensionCode(blocks, extensionName, extensionId, author, description);
    if (!code) return false;
    
    const filename = `${extensionName.replace(/\s+/g, '_')}.js`;
    const blob = new Blob([code], { type: 'application/javascript' });
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
    console.error('Failed to download extension file:', error);
    return false;
  }
};