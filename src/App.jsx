import React, { useEffect, useRef, useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Cookies from 'js-cookie';
import Blockly from 'blockly';
import BlocklyJS from 'blockly/javascript';
import './App.css';
import AddElementMenu from './components/AddElementMenu';
import ElementList from './components/ElementList';
import FunctionConfig from './components/FunctionConfig';
import BlockList from './components/BlockList';
import AlertProvider, { useAlert } from './components/Alert';
import { 
  getAllBlocks,
  saveBlock,
  getBlock,
  deleteBlock,
  saveCurrentBlockId,
  getCurrentBlockId,
  clearAllData,
  downloadAsFile,
  downloadBlockAsFile,
  uploadFromFile,
  downloadExtensionFile
} from './utils/storage';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  AppBar, 
  Toolbar,
  Button,
  Stack,
  IconButton,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Tooltip,
  Select,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  Menu
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LanguageIcon from '@mui/icons-material/Language';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Fade from '@mui/material/Fade';
import logoSvg from '../logo.svg';

// 导入 Zelos 渲染器
import 'blockly/blocks';
import 'blockly/javascript';

function AppContent() {
  const { t, language, setLanguage, supportedLanguages } = useLanguage();
  const previewRef = useRef(null);
  const previewRef2 = useRef(null); // 用于第二个界面的预览
  const workspaceRef = useRef(null);
  const workspaceRef2 = useRef(null); // 用于第二个界面
  const [currentBlock, setCurrentBlock] = useState(() => ({
    id: null,
    opcode: 'my_custom_block',
    type: 'COMMAND',
    branchCount: 2,
    elements: [{ id: 1, type: 'label', text: 'Default Block Text' }],
    functions: []
  }));
  const elementCounter = useRef(1);
  const [darkMode, setDarkMode] = useState(() => {
  try {
    return Cookies.get('dark-mode') === 'true';
  } catch (e) {
    console.error('Failed to read dark mode from Cookie:', e);
    return false;
  }
});
  const [activeTab, setActiveTab] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [blockLibraryOpen, setBlockLibraryOpen] = useState(false);
  const [blockLibraryList, setBlockLibraryList] = useState([]);
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);
  const [extensionName, setExtensionName] = useState('MyExtension');
  const [projectFileHandle, setProjectFileHandle] = useState(null); // 保存当前打开的文件句柄

  // 创建主题
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#66ccff',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
  });

  // 设置 CSS 变量以控制 body 背景色
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--background-color',
      darkMode ? '#121212' : '#ffffff'
    );
  }, [darkMode]);

  // 使用自定义alert
  const { showSuccess, showError, showConfirm } = useAlert();

  // 未保存状态
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 保存的积木副本，用于检测未保存的更改
  const [savedBlockSnapshot, setSavedBlockSnapshot] = useState(null);

  // 防止页面意外刷新
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // 如果有未保存的更改或没有文件句柄，显示提醒
      if (hasUnsavedChanges || !projectFileHandle) {
        e.preventDefault();
        e.returnValue = ''; // Chrome 需要设置 returnValue
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, projectFileHandle]);

  // 防抖定时器
  const updateDebounceRef = useRef(null);

  // 更新未保存状态
  const checkUnsavedChanges = (block) => {
    if (!savedBlockSnapshot) {
      setHasUnsavedChanges(false);
      return;
    }
    
    // 比较当前积木和保存的快照
    const isChanged = JSON.stringify(block) !== JSON.stringify(savedBlockSnapshot);
    setHasUnsavedChanges(isChanged);
  };

  // 初始化 Blockly 工作区的辅助函数
  const initWorkspace = (element, workspaceRefObj) => {
    if (!element) return;

    // 如果已存在工作区，先销毁
    if (workspaceRefObj.current) {
      workspaceRefObj.current.dispose();
      workspaceRefObj.current = null;
    }

    // 注册自定义积木类型
    registerCustomBlock();

    // 创建预览工作区
    const workspace = Blockly.inject(element, {
      renderer: 'zelos',
      theme: Blockly.Themes.Classic,
      media: './media',
      scrollbars: true,
      readOnly: false,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 1.5,
        minScale: 0.5,
        scaleSpeed: 1.2
      },
      grid: {
        spacing: 1,
        length: 1,
        colour: 'transparent',
        snap: false
      },
      move: {
        scrollbars: true,
        drag: true,
        wheel: true
      }
    });

    workspaceRefObj.current = workspace;

    // 禁用右键菜单
    disableContextMenu(workspace);

    // 添加默认积木
    updateBlock(workspace);
  };

  // 初始化第一个 Blockly 工作区
  useEffect(() => {
    if (activeTab === 0 && previewRef.current) {
      initWorkspace(previewRef.current, workspaceRef);
    }
  }, [activeTab]);

  // 初始化第二个 Blockly 工作区（当切换到第二个界面时）
  useEffect(() => {
    if (activeTab === 1 && previewRef2.current) {
      initWorkspace(previewRef2.current, workspaceRef2);
    }
  }, [activeTab]);

  // 当 activeTab 改变时，确保工作区正确渲染
  useEffect(() => {
    // 清除之前的防抖定时器
    if (updateDebounceRef.current) {
      clearTimeout(updateDebounceRef.current);
    }

    // 设置新的防抖定时器，500ms 后更新工作区
    updateDebounceRef.current = setTimeout(() => {
      // 更新当前活跃的工作区
      if (activeTab === 0 && workspaceRef.current) {
        updateBlock(workspaceRef.current);
      } else if (activeTab === 1 && workspaceRef2.current) {
        updateBlock(workspaceRef2.current);
      }
    }, 500);

    // 清理函数
    return () => {
      if (updateDebounceRef.current) {
        clearTimeout(updateDebounceRef.current);
      }
    };
  }, [activeTab, currentBlock]);

  

  // 初始化：创建新扩展
  useEffect(() => {
    // 创建一个新的默认积木
    const newBlock = {
      id: Date.now().toString(),
      opcode: 'my_custom_block_' + Date.now(),
      type: 'COMMAND',
      branchCount: 2,
      elements: [{ id: 1, type: 'label', text: t('blockConfig.defaultBlockText', { defaultValue: 'Default Block Text' }) }],
      functions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 更新状态
    setCurrentBlock(newBlock);
    setBlockLibraryList([newBlock]);
    elementCounter.current = 1;
    setSavedBlockSnapshot(JSON.parse(JSON.stringify(newBlock)));
    setHasUnsavedChanges(false);
  }, []); // 只在组件挂载时执行一次

  // 当积木库对话框打开时，不需要从 localStorage 加载

  // 保存当前积木（保存到内存中的 blockLibraryList）
  const saveCurrentBlock = () => {
    const blockToSave = {
      ...currentBlock,
      id: currentBlock.id || Date.now().toString(),
      updatedAt: new Date().toISOString(),
      createdAt: currentBlock.createdAt || new Date().toISOString()
    };
    
    // 更新或添加到 blockLibraryList
    setBlockLibraryList(prev => {
      const existingIndex = prev.findIndex(b => b.id === blockToSave.id);
      if (existingIndex >= 0) {
        // 更新现有积木
        const newList = [...prev];
        newList[existingIndex] = blockToSave;
        return newList;
      } else {
        // 添加新积木
        return [...prev, blockToSave];
      }
    });
    
    // 更新当前积木状态，确保后续修改保存到正确的积木
    if (currentBlock.id !== blockToSave.id) {
      setCurrentBlock(blockToSave);
    }
    // 更新保存快照
    setSavedBlockSnapshot(JSON.parse(JSON.stringify(blockToSave)));
    setHasUnsavedChanges(false);
  };

  // 保存项目到文件
  const saveProjectToFile = async (forceSaveAs = false) => {
    try {
      // 收集当前所有积木（从内存中的 blockLibraryList）
      const allBlocks = blockLibraryList.length > 0 ? blockLibraryList : [currentBlock].filter(b => b);
      
      const projectData = {
        version: '1.0',
        extensionName: extensionName,
        blocks: allBlocks,
        savedAt: new Date().toISOString()
      };

      let fileHandle = projectFileHandle;

      // 如果强制另存为或没有打开的文件，显示另存为对话框
      if (forceSaveAs || !fileHandle) {
        fileHandle = await window.showSaveFilePicker({
          suggestedName: `${extensionName || 'MyExtension'}.ext`,
          types: [{
            description: 'Extension Project File',
            accept: { 'application/vnd.extendustry': ['.ext'] }
          }]
        });
        setProjectFileHandle(fileHandle);
      }

      // 写入文件
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(projectData, null, 2));
      await writable.close();

      showSuccess(t('messages.projectSaved'));
      setFileMenuAnchor(null);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to save project:', error);
        showError('保存项目失败: ' + error.message);
      }
    }
  };

  // 另存为
  const saveProjectAs = () => {
    saveProjectToFile(true);
  };

  // 从文件读取项目
  const openProjectFromFile = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{
          description: 'Extension Project File',
          accept: { 'application/vnd.extendustry': ['.ext'] }
        }],
        multiple: false
      });

      const file = await fileHandle.getFile();
      const text = await file.text();
      const projectData = JSON.parse(text);

      // 验证项目数据
      if (!projectData.blocks || !Array.isArray(projectData.blocks)) {
        throw new Error('无效的项目文件格式');
      }

      // 设置扩展名称
      if (projectData.extensionName) {
        setExtensionName(projectData.extensionName);
      }

      // 保存文件句柄
      setProjectFileHandle(fileHandle);

      // 设置积木库列表
      setBlockLibraryList(projectData.blocks);

      // 加载第一个积木
      if (projectData.blocks.length > 0) {
        const firstBlock = projectData.blocks[0];
        setCurrentBlock(firstBlock);
        if (firstBlock.elements && firstBlock.elements.length > 0) {
          const maxId = Math.max(...firstBlock.elements.map(e => e.id));
          elementCounter.current = maxId + 1;
        }
        setSavedBlockSnapshot(JSON.parse(JSON.stringify(firstBlock)));
        setHasUnsavedChanges(false);
      }

      showSuccess('项目加载成功！');
      setUploadDialogOpen(false);
      setFileMenuAnchor(null);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to open project:', error);
        showError('打开项目失败: ' + error.message);
      }
    }
  };

  // 禁用右键菜单
  const disableContextMenu = (workspace) => {
    workspace.getCanvas().addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
  };

  // 注册自定义积木类型
  const registerCustomBlock = () => {
    Blockly.Blocks['dynamic_custom_block'] = {
      init: function() {
        this.setColour(230);
        this.setTooltip('动态自定义积木');
        this.setHelpUrl('');
      }
    };

    BlocklyJS['dynamic_custom_block'] = function(block) {
      let code = '';
      
      currentBlock.elements.forEach((element, index) => {
        if (element.type === 'statement') {
          const statement = BlocklyJS.statementToCode(block, `STACK_${element.id}`);
          code += `function() {\n${statement}}`;
        } else if (element.type === 'boolean') {
          const booleanValue = BlocklyJS.valueToCode(block, `BOOLEAN_${element.id}`);
          code += booleanValue || 'false';
        } else if (element.type === 'text') {
          code += `'${block.getFieldValue(`FIELD_TEXT_${element.id}`)}'`;
        } else if (element.type === 'number') {
          code += block.getFieldValue(`FIELD_NUMBER_${element.id}`);
        } else if (element.type === 'dropdown') {
          code += `'${block.getFieldValue(`FIELD_DROPDOWN_${element.id}`)}'`;
        } else if (element.type === 'colour') {
          code += `'${block.getFieldValue(`FIELD_COLOUR_${element.id}`)}'`;
        } else if (element.type === 'label') {
          code += element.text;
        }
      });
      
      code += ';\n';
      return code;
    };
  };

  // 更新积木显示
  const updateBlock = (workspace) => {
    workspace.clear();

    const blockTypeName = 'dynamic_custom_block';
    
    // 预扫描：将元素分组到不同的 Input 中
    // 每组要么是 DummyInput，要么是 ValueInput（如果包含布尔值）
    const inputGroups = [];
    let currentGroup = [];
    
    currentBlock.elements.forEach((element, index) => {
      if (element.type === 'boolean') {
        // 布尔值开始一个新的 ValueInput 组
        // 如果当前组已有元素，将它们合并到这个 ValueInput 组中
        currentGroup.push(element);
        inputGroups.push(currentGroup);
        currentGroup = [];
      } else {
        // 其他元素添加到当前组
        currentGroup.push(element);
      }
    });
    
    // 添加最后一组
    if (currentGroup.length > 0) {
      inputGroups.push(currentGroup);
    }
    
    // 重新注册积木类型
    Blockly.Blocks[blockTypeName] = {
      init: function() {
        // 设置积木为 inline 模式，所有输入在同一行显示
        this.setInputsInline(true);
        
        // 根据积木类型设置属性
        if (currentBlock.type === 'COMMAND' || currentBlock.type === 'CONDITIONAL') {
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
        } else if (currentBlock.type === 'REPORTER') {
          this.setOutput(true, 'Any');
        } else if (currentBlock.type === 'BOOLEAN') {
          this.setOutput(true, 'Boolean');
        } else if (currentBlock.type === 'EVENT' || currentBlock.type === 'HAT') {
          this.setNextStatement(true, null);
        } else if (currentBlock.type === 'LOOP') {
          this.setPreviousStatement(true, null);
        }
        
        // 遍历每个组，创建对应的 Input
        inputGroups.forEach((group, groupIndex) => {
          // 检查这个组是否包含布尔值
          const hasBoolean = group.some(e => e.type === 'boolean');
          
          if (hasBoolean) {
            // 布尔值 - 创建 ValueInput
            const booleanElement = group.find(e => e.type === 'boolean');
            const valueInput = this.appendValueInput(`BOOLEAN_${booleanElement.id}`)
              .setCheck("Boolean");
            
            // 将组中的其他元素作为字段添加到这个 ValueInput
            group.forEach(element => {
              if (element.type !== 'boolean') {
                switch (element.type) {
                  case 'label':
                    valueInput.appendField(element.text);
                    break;
                  case 'text':
                    valueInput.appendField(new Blockly.FieldTextInput(element.defaultValue || '文本'), `FIELD_TEXT_${element.id}`);
                    break;
                  case 'number':
                    valueInput.appendField(new Blockly.FieldNumber(element.defaultValue || 0), `FIELD_NUMBER_${element.id}`);
                    break;
                  case 'dropdown':
                    valueInput.appendField(new Blockly.FieldDropdown(element.options || [['选项1', 'OPT1'], ['选项2', 'OPT2']]), `FIELD_DROPDOWN_${element.id}`);
                    break;
                  case 'colour':
                    valueInput.appendField(new Blockly.FieldColour(element.defaultValue || '#ff0000'), `FIELD_COLOUR_${element.id}`);
                    break;
                }
              }
            });
          } else {
            // 普通 Input - 创建 DummyInput
            const dummyInput = this.appendDummyInput();
            
            // 将组中的所有元素添加到这个 DummyInput
            group.forEach(element => {
              switch (element.type) {
                case 'label':
                  dummyInput.appendField(element.text);
                  break;
                case 'text':
                  dummyInput.appendField(new Blockly.FieldTextInput(element.defaultValue || '文本'), `FIELD_TEXT_${element.id}`);
                  break;
                case 'number':
                  dummyInput.appendField(new Blockly.FieldNumber(element.defaultValue || 0), `FIELD_NUMBER_${element.id}`);
                  break;
                case 'dropdown':
                  dummyInput.appendField(new Blockly.FieldDropdown(element.options || [['选项1', 'OPT1'], ['选项2', 'OPT2']]), `FIELD_DROPDOWN_${element.id}`);
                  break;
                case 'colour':
                  dummyInput.appendField(new Blockly.FieldColour(element.defaultValue || '#ff0000'), `FIELD_COLOUR_${element.id}`);
                  break;
              }
            });
          }
        });
        
        // 根据块类型添加固定分支
        if (currentBlock.type === 'CONDITIONAL') {
          // 添加N个分支
          for (let i = 0; i < currentBlock.branchCount; i++) {
            this.appendStatementInput(`BRANCH_${i}`)
              .setCheck(null);
          }
        } else if (currentBlock.type === 'LOOP') {
          // 固定一个分支
          this.appendStatementInput('BRANCH_0')
            .setCheck(null);
          // 添加图标
          this.appendEndRowInput()
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField(new Blockly.FieldImage("./repeat.svg", 20, 20, { alt: "*", flipRtl: "FALSE" }));
        }
        
        this.setColour(230);
        this.setTooltip('动态自定义积木');
        this.setHelpUrl('');
      }
    };

    // 创建积木实例
    const block = workspace.newBlock(blockTypeName);
    block.initSvg();
    block.render();
    block.moveBy(20, 20);
    
    // 禁用积木的删除和复制功能
    block.setDeletable(false);
    block.setMovable(false);
    
    workspace.clearUndo();

  };

  // 添加布尔值输入
  const addBooleanInput = () => {
    elementCounter.current++;
    const newBlock = {
      ...currentBlock,
      elements: [...currentBlock.elements, {
        id: elementCounter.current,
        type: 'boolean',
        name: `BOOLEAN_${elementCounter.current}`
      }]
    };
    setCurrentBlock(newBlock);
    checkUnsavedChanges(newBlock);
  };

  // 添加语句输入（分支）
  const addStatementInput = () => {
    elementCounter.current++;
    const newBlock = {
      ...currentBlock,
      elements: [...currentBlock.elements, {
        id: elementCounter.current,
        type: 'statement',
        name: `STACK_${elementCounter.current}`
      }]
    };
    setCurrentBlock(newBlock);
    checkUnsavedChanges(newBlock);
  };

  // 添加标签
  const addLabel = () => {
    elementCounter.current++;
    const newBlock = {
      ...currentBlock,
      elements: [...currentBlock.elements, {
        id: elementCounter.current,
        type: 'label',
        text: '标签'
      }]
    };
    setCurrentBlock(newBlock);
    checkUnsavedChanges(newBlock);
  };

  // 验证操作码：检查是否包含特殊符号
  const validateOpcode = (opcode) => {
    // 只允许字母、数字、下划线，不允许其他特殊符号
    const regex = /^[a-zA-Z0-9_]+$/;
    return regex.test(opcode);
  };

  // 检查操作码是否与其他积木重复
  const isOpcodeDuplicate = (opcode) => {
    if (!opcode || opcode.trim() === '') return false;
    const allBlocks = getAllBlocks();
    // 排除当前正在编辑的积木
    return allBlocks.some(block => block.id !== currentBlock.id && block.opcode === opcode);
  };

  // 验证元素ID：检查是否包含非法字符
  const validateElementName = (elementName) => {
    // 必须以字母或下划线开头，后续可以包含字母、数字或下划线
    // 这是 Blockly 积木元素 ID 的要求
    const regex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return regex.test(elementName);
  };

  // 验证元素ID是否重复
  const isElementNameDuplicate = (elementName, currentElementId) => {
    if (!elementName || elementName.trim() === '') return false;
    // 检查当前积木中的其他元素是否有相同的name
    return currentBlock.elements.some(
      element => element.id !== currentElementId && element.name === elementName
    );
  };

  // 添加文本字段
  const addTextInput = () => {
    elementCounter.current++;
    const newBlock = {
      ...currentBlock,
      elements: [...currentBlock.elements, {
        id: elementCounter.current,
        type: 'text',
        name: `FIELD_TEXT_${elementCounter.current}`,
        defaultValue: '文本'
      }]
    };
    setCurrentBlock(newBlock);
    checkUnsavedChanges(newBlock);
  };

  // 添加数字字段
  const addNumberInput = () => {
    elementCounter.current++;
    const newBlock = {
      ...currentBlock,
      elements: [...currentBlock.elements, {
        id: elementCounter.current,
        type: 'number',
        name: `FIELD_NUMBER_${elementCounter.current}`,
        defaultValue: 0
      }]
    };
    setCurrentBlock(newBlock);
    checkUnsavedChanges(newBlock);
  };

  // 添加下拉菜单字段
  const addDropdown = () => {
    elementCounter.current++;
    const newBlock = {
      ...currentBlock,
      elements: [...currentBlock.elements, {
        id: elementCounter.current,
        type: 'dropdown',
        name: `FIELD_DROPDOWN_${elementCounter.current}`,
        defaultValue: 'OPT1',
        options: [['选项1', 'OPT1'], ['选项2', 'OPT2'], ['选项3', 'OPT3']]
      }]
    };
    setCurrentBlock(newBlock);
    checkUnsavedChanges(newBlock);
  };

  // 添加颜色选择器字段
  const addColourPicker = () => {
    elementCounter.current++;
    const newBlock = {
      ...currentBlock,
      elements: [...currentBlock.elements, {
        id: elementCounter.current,
        type: 'colour',
        name: `FIELD_COLOUR_${elementCounter.current}`,
        defaultValue: '#ff0000'
      }]
    };
    setCurrentBlock(newBlock);
    checkUnsavedChanges(newBlock);
  };

  // 更新元素
  const updateElement = (index, updates) => {
    const newElements = [...currentBlock.elements];
    newElements[index] = { ...newElements[index], ...updates };
    const newBlock = {
      ...currentBlock,
      elements: newElements
    };
    setCurrentBlock(newBlock);
    checkUnsavedChanges(newBlock);
  };

  // 移动元素
  const moveElement = (sourceIndex, destinationIndex) => {
    // 支持两种调用方式：
    // 1. 旧方式：moveElement(index, 'up'/'down')
    // 2. 新方式：moveElement(sourceIndex, destinationIndex)
    
    let newBlock;
    
    if (typeof destinationIndex === 'string') {
      // 旧方式：direction 参数
      const direction = destinationIndex;
      if (direction === 'up' && sourceIndex > 0) {
        const newElements = [...currentBlock.elements];
        [newElements[sourceIndex - 1], newElements[sourceIndex]] = [newElements[sourceIndex], newElements[sourceIndex - 1]];
        newBlock = {
          ...currentBlock,
          elements: newElements
        };
      } else if (direction === 'down' && sourceIndex < currentBlock.elements.length - 1) {
        const newElements = [...currentBlock.elements];
        [newElements[sourceIndex], newElements[sourceIndex + 1]] = [newElements[sourceIndex + 1], newElements[sourceIndex]];
        newBlock = {
          ...currentBlock,
          elements: newElements
        };
      }
    } else {
      // 新方式：拖拽排序
      if (sourceIndex === destinationIndex) {
        return;
      }
      
      const newElements = [...currentBlock.elements];
      const [movedElement] = newElements.splice(sourceIndex, 1);
      newElements.splice(destinationIndex, 0, movedElement);
      newBlock = {
        ...currentBlock,
        elements: newElements
      };
    }
    
    if (newBlock) {
      setCurrentBlock(newBlock);
      checkUnsavedChanges(newBlock);
    }
  };

  // 删除元素
  const removeElement = (index) => {
    const newElements = currentBlock.elements.filter((_, i) => i !== index);
    const newBlock = {
      ...currentBlock,
      elements: newElements
    };
    setCurrentBlock(newBlock);
    checkUnsavedChanges(newBlock);
  };

  // 清空工作区
  const clearWorkspace = () => {
    showConfirm('确认清空', '确定要清空当前积木的所有元素吗？', () => {
      const newBlock = {
        ...currentBlock,
        elements: [{ id: 1, type: 'label', text: t('blockConfig.defaultBlockText', { defaultValue: 'Default Block Text' }) }]
      };
      setCurrentBlock(newBlock);
      checkUnsavedChanges(newBlock);
      elementCounter.current = 1;
    });
  };

  // 处理文件上传
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadFromFile(file)
        .then(() => {
          // 重新加载所有积木
          const allBlocks = getAllBlocks();
          if (allBlocks.length > 0) {
            const firstBlock = allBlocks[0];
            setCurrentBlock(firstBlock);
            saveCurrentBlockId(firstBlock.id);
            if (firstBlock.elements && firstBlock.elements.length > 0) {
              const maxId = Math.max(...firstBlock.elements.map(e => e.id));
              elementCounter.current = maxId + 1;
            }
          }
          setUploadDialogOpen(false);
          showSuccess('导入成功！');
        })
        .catch((error) => {
          showError('导入失败：' + error.message);
        });
    }
  };

  // 新建扩展 - 清空积木库
  const handleNewExtension = () => {
    showConfirm(
      t('messages.newExtensionConfirm'),
      t('messages.newExtensionConfirm'),
      () => {
        // 清除文件句柄
        setProjectFileHandle(null);
        
        // 清空积木库列表
        setBlockLibraryList([]);
        
        // 创建一个新的默认积木
        const newBlock = {
          id: Date.now().toString(),
          opcode: 'my_custom_block_' + Date.now(),
          type: 'COMMAND',
          branchCount: 2,
          elements: [{ id: 1, type: 'label', text: t('blockConfig.defaultBlockText', { defaultValue: 'Default Block Text' }) }],
          functions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // 更新状态
        setCurrentBlock(newBlock);
        setBlockLibraryList([newBlock]);
        elementCounter.current = 1;
        setSavedBlockSnapshot(JSON.parse(JSON.stringify(newBlock)));
        setHasUnsavedChanges(false);
        
        // 清理预览引用
        blockPreviewRefs.current = {};
        
        // 关闭菜单
        setFileMenuAnchor(null);
        
        showSuccess(t('messages.newExtensionSuccess'));
      },
      () => {
        // 取消操作
        setFileMenuAnchor(null);
      }
    );
  };

  // 导出扩展
  const handleExportExtension = () => {
    // 从内存中的 blockLibraryList 获取积木
    const allBlocks = blockLibraryList.length > 0 ? blockLibraryList : [currentBlock].filter(b => b);
    
    if (allBlocks.length === 0) {
      showError(t('messages.noBlocksToExport'));
      setFileMenuAnchor(null);
      return;
    }
    
    // 生成扩展ID（从扩展名称转换）
    const extensionId = extensionName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/^_+|_+$/g, '') || 'my_extension';
    
    // 使用当前项目配置导出扩展
    const success = downloadExtensionFile(
      allBlocks,
      extensionName || 'MyExtension',
      extensionId,
      'Unknown',
      'Custom Extension'
    );
    
    if (success) {
      showSuccess(t('messages.extensionExported'));
    } else {
      showError('导出失败');
    }
    
    setFileMenuAnchor(null);
  };

  // 处理函数保存
  const handleFunctionsSave = (functions) => {
    setCurrentBlock({
      ...currentBlock,
      functions: functions
    });
  };

  // 保存当前积木样式
  const saveBlockStyle = () => {
    saveCurrentBlock();
    showSuccess(t('messages.blockSaved'));
  };

  // 创建新积木
  const handleCreateNewBlock = () => {
    // 检查是否有未保存的更改
    if (hasUnsavedChanges) {
      showConfirm(
        t('messages.unsavedChanges'),
        t('messages.unsavedChangesConfirm'),
        () => {
          // 确认创建
          const newBlock = {
            id: Date.now().toString(),
            opcode: 'my_custom_block_' + Date.now(),
            type: 'COMMAND',
            branchCount: 2,
            elements: [{ id: 1, type: 'label', text: t('blockConfig.defaultBlockText', { defaultValue: 'Default Block Text' }) }],
            functions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setCurrentBlock(newBlock);
          setBlockLibraryList(prev => [...prev, newBlock]);
          elementCounter.current = 1;
          setSavedBlockSnapshot(JSON.parse(JSON.stringify(newBlock)));
          setHasUnsavedChanges(false);
          handleCloseBlockLibrary();
        },
        () => {
          // 取消创建
        }
      );
    } else {
      // 没有未保存的更改，直接创建
      const newBlock = {
        id: Date.now().toString(),
        opcode: 'my_custom_block_' + Date.now(),
        type: 'COMMAND',
        branchCount: 2,
        elements: [{ id: 1, type: 'label', text: t('blockConfig.defaultBlockText', { defaultValue: 'Default Block Text' }) }],
        functions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCurrentBlock(newBlock);
      setBlockLibraryList(prev => [...prev, newBlock]);
      elementCounter.current = 1;
      setSavedBlockSnapshot(JSON.parse(JSON.stringify(newBlock)));
      setHasUnsavedChanges(false);
      handleCloseBlockLibrary();
    }
  };

  // 选择积木
  const handleSelectBlock = (block) => {
    // 检查是否有未保存的更改
    if (hasUnsavedChanges) {
      showConfirm(
        t('messages.unsavedChanges'),
        t('messages.unsavedChangesConfirm'),
        () => {
          // 确认切换
          setCurrentBlock(block);
          if (block.elements && block.elements.length > 0) {
            const maxId = Math.max(...block.elements.map(e => e.id));
            elementCounter.current = maxId + 1;
          }
          setSavedBlockSnapshot(JSON.parse(JSON.stringify(block)));
          setHasUnsavedChanges(false);
          handleCloseBlockLibrary();
        },
        () => {
          // 取消切换
        }
      );
    } else {
      // 没有未保存的更改，直接切换
      setCurrentBlock(block);
      if (block.elements && block.elements.length > 0) {
        const maxId = Math.max(...block.elements.map(e => e.id));
        elementCounter.current = maxId + 1;
      }
      setSavedBlockSnapshot(JSON.parse(JSON.stringify(block)));
      setHasUnsavedChanges(false);
      handleCloseBlockLibrary();
    }
  };

  // 关闭积木库对话框
  const handleCloseBlockLibrary = () => {
    setBlockLibraryOpen(false);
    // 在下一个事件循环中将焦点移到 body，避免 aria-hidden 警告
    setTimeout(() => {
      document.body.focus();
    }, 0);
  };

  // 向上移动积木
  const handleMoveBlockUp = (e, index) => {
    e.stopPropagation();
    if (index > 0) {
      const newList = [...blockLibraryList];
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
      setBlockLibraryList(newList);
    }
  };

  // 向下移动积木
  const handleMoveBlockDown = (e, index) => {
    e.stopPropagation();
    if (index < blockLibraryList.length - 1) {
      const newList = [...blockLibraryList];
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      setBlockLibraryList(newList);
    }
  };

  // 为积木库列表项创建预览工作区的引用映射
  const blockPreviewRefs = useRef({});

  // 渲染单个积木的预览
  const renderBlockPreview = (block, containerElement) => {
    if (!containerElement || !block) return;

    // 清空容器
    containerElement.innerHTML = '';

    // 创建临时工作区用于渲染预览
    const tempWorkspace = Blockly.inject(containerElement, {
      renderer: 'zelos',
      theme: Blockly.Themes.Classic,
      media: './media',
      scrollbars: false,
      readOnly: true,
      zoom: {
        controls: false,
        wheel: false,
        startScale: 0.85,
        maxScale: 0.85,
        minScale: 0.85,
        scaleSpeed: 1.0
      },
      grid: {
        spacing: 1,
        length: 1,
        colour: 'transparent',
        snap: false
      },
      move: {
        scrollbars: false,
        drag: false,
        wheel: false
      }
    });

    // 注册临时积木类型
    const tempBlockTypeName = `preview_block_${block.id}`;
    Blockly.Blocks[tempBlockTypeName] = {
      init: function() {
        this.setInputsInline(true);
        
        // 根据积木类型设置属性
        if (block.type === 'COMMAND' || block.type === 'LOOP' || block.type === 'CONDITIONAL') {
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
        } else if (block.type === 'REPORTER') {
          this.setOutput(true, 'Any');
        } else if (block.type === 'BOOLEAN') {
          this.setOutput(true, 'Boolean');
        } else if (block.type === 'EVENT' || block.type === 'HAT') {
          this.setNextStatement(true, null);
        }
        
        // 预扫描：将元素分组到不同的 Input 中
        const inputGroups = [];
        let currentGroup = [];
        
        block.elements.forEach((element, index) => {
          if (element.type === 'boolean') {
            // 布尔值开始一个新的 ValueInput 组
            currentGroup.push(element);
            inputGroups.push(currentGroup);
            currentGroup = [];
          } else {
            // 其他元素添加到当前组
            currentGroup.push(element);
          }
        });
        
        // 添加最后一组
        if (currentGroup.length > 0) {
          inputGroups.push(currentGroup);
        }
        
        // 遍历每个组，创建对应的 Input
        inputGroups.forEach((group, groupIndex) => {
          // 检查这个组是否包含布尔值
          const hasBoolean = group.some(e => e.type === 'boolean');
          
          if (hasBoolean) {
            // 布尔值 - 创建 ValueInput
            const booleanElement = group.find(e => e.type === 'boolean');
            const valueInput = this.appendValueInput(`BOOLEAN_${booleanElement.id}`)
              .setCheck("Boolean");
            
            // 将组中的其他元素作为字段添加到这个 ValueInput
            group.forEach(element => {
              if (element.type !== 'boolean') {
                switch (element.type) {
                  case 'label':
                    valueInput.appendField(element.text);
                    break;
                  case 'text':
                    valueInput.appendField(new Blockly.FieldTextInput(element.defaultValue || '文本'), `FIELD_TEXT_${element.id}`);
                    break;
                  case 'number':
                    valueInput.appendField(new Blockly.FieldNumber(element.defaultValue || 0), `FIELD_NUMBER_${element.id}`);
                    break;
                  case 'dropdown':
                    valueInput.appendField(new Blockly.FieldDropdown(element.options || [['选项1', 'OPT1'], ['选项2', 'OPT2']]), `FIELD_DROPDOWN_${element.id}`);
                    break;
                  case 'colour':
                    valueInput.appendField(new Blockly.FieldColour(element.defaultValue || '#ff0000'), `FIELD_COLOUR_${element.id}`);
                    break;
                }
              }
            });
          } else {
            // 普通 Input - 创建 DummyInput
            const dummyInput = this.appendDummyInput();
            
            // 将组中的所有元素添加到这个 DummyInput
            group.forEach(element => {
              switch (element.type) {
                case 'label':
                  dummyInput.appendField(element.text);
                  break;
                case 'text':
                  dummyInput.appendField(new Blockly.FieldTextInput(element.defaultValue || '文本'), `FIELD_TEXT_${element.id}`);
                  break;
                case 'number':
                  dummyInput.appendField(new Blockly.FieldNumber(element.defaultValue || 0), `FIELD_NUMBER_${element.id}`);
                  break;
                case 'dropdown':
                  dummyInput.appendField(new Blockly.FieldDropdown(element.options || [['选项1', 'OPT1'], ['选项2', 'OPT2']]), `FIELD_DROPDOWN_${element.id}`);
                  break;
                case 'colour':
                  dummyInput.appendField(new Blockly.FieldColour(element.defaultValue || '#ff0000'), `FIELD_COLOUR_${element.id}`);
                  break;
              }
            });
          }
        });
        
        // 根据块类型添加固定分支
        if (block.type === 'CONDITIONAL') {
          // 添加N个分支
          for (let i = 0; i < block.branchCount; i++) {
            this.appendStatementInput(`BRANCH_${i}`)
              .setCheck(null);
          }
        } else if (block.type === 'LOOP') {
          // 固定一个分支
          this.appendStatementInput('BRANCH_0')
            .setCheck(null);
        }
        
        this.setColour(230);
        this.setTooltip(block.opcode);
        this.setHelpUrl('');
      }
    };

    // 创建积木实例
    const previewBlock = tempWorkspace.newBlock(tempBlockTypeName);
    previewBlock.initSvg();
    previewBlock.render();
    
    // 积木居中显示
    const metrics = tempWorkspace.getMetrics();
    if (metrics && previewBlock.width) {
      const containerWidth = containerElement.clientWidth || 220;
      const containerHeight = containerElement.clientHeight || 90;
      const blockX = (containerWidth - previewBlock.width) / 2;
      const blockY = Math.max(5, (containerHeight - previewBlock.height) / 2);
      previewBlock.moveBy(blockX, blockY);
    }
    
    // 清理：在组件卸载时需要销毁工作区
    return () => {
      tempWorkspace.dispose();
    };
  };

  // 当积木库对话框打开时，渲染所有积木的预览
  useEffect(() => {
    if (blockLibraryOpen && blockLibraryList.length > 0) {
      // 延迟执行，确保 DOM 已经渲染
      setTimeout(() => {
        Object.entries(blockPreviewRefs.current).forEach(([blockId, container]) => {
          if (container) {
            const block = blockLibraryList.find(b => b.id === blockId);
            if (block) {
              renderBlockPreview(block, container);
            }
          }
        });
      }, 100);
    }
  }, [blockLibraryOpen, blockLibraryList]);

  // 清理预览工作区
  useEffect(() => {
    return () => {
      // 组件卸载时清理所有预览容器
      Object.values(blockPreviewRefs.current).forEach(container => {
        if (container && container.innerHTML) {
          container.innerHTML = '';
        }
      });
      blockPreviewRefs.current = {};
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
          <Toolbar>
            <Box
              component="img"
              src={logoSvg}
              alt="Logo"
              sx={{
                height: 32,
                width: 32,
                mr: 1,
              }}
            />
            <Box
              component="img"
              src={language === 'en-US' ? './title-en.svg' : './title.svg'}
              alt="Extendustry"
              sx={{
                height: 40,
                mr: 2,
              }}
            />
            <Button
              onClick={(e) => setFileMenuAnchor(e.currentTarget)}
              sx={{
                height: '100%',
                borderRadius: 0,
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                mr: 'auto',
              }}
              color="inherit"
            >
              {t('menu.file')}
            </Button>
            <Menu
              anchorEl={fileMenuAnchor}
              open={Boolean(fileMenuAnchor)}
              onClose={() => setFileMenuAnchor(null)}
              TransitionComponent={Fade}
              TransitionProps={{
                timeout: {
                  enter: 300,
                  exit: 200,
                },
              }}
              disableScrollLock
              disableAutoFocusItem
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 1,
                  overflow: 'visible',
                },
              }}
              MenuListProps={{
                disablePadding: true,
                sx: {
                  '& .MuiMenuItem-root': {
                    borderRadius: 0,
                    py: 1.5,
                    px: 2,
                  },
                },
              }}
            >
              <MenuItem onClick={() => { saveProjectToFile(); }}>
                {t('menu.saveProject')}
              </MenuItem>
              <MenuItem onClick={() => { saveProjectAs(); }}>
                {t('menu.saveAs')}
              </MenuItem>
              <MenuItem onClick={() => { handleNewExtension(); }}>
                {t('menu.newExtension')}
              </MenuItem>
              <MenuItem onClick={() => { openProjectFromFile(); }}>
                {t('menu.openFromComputer')}
              </MenuItem>
              <MenuItem onClick={() => { handleExportExtension(); }}>
                {t('menu.exportExtension')}
              </MenuItem>
            </Menu>
            <Button
              onClick={() => setProjectSettingsOpen(true)}
              sx={{
                height: '100%',
                borderRadius: 0,
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
              }}
              color="inherit"
            >
              {t('menu.projectSettings')}
            </Button>
            <TextField
              value={extensionName}
              onChange={(e) => setExtensionName(e.target.value)}
              size="small"
              variant="outlined"
              placeholder="NAME"
              sx={{
                width: 200,
                '& .MuiOutlinedInput-root': {
                  height: 40,
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: 'text.primary',
                },
              }}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" spacing={1}>
              <Tooltip title={t('buttons.language')} arrow>
                <IconButton 
                  onClick={(e) => setLanguageMenuAnchor(e.currentTarget)}
                  color="inherit"
                  sx={{ position: 'relative' }}
                >
                  <LanguageIcon />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      fontSize: '10px',
                      fontWeight: 'bold',
                    }}
                  >
                    {supportedLanguages[language]?.flag}
                  </Typography>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={languageMenuAnchor}
                open={Boolean(languageMenuAnchor)}
                onClose={() => setLanguageMenuAnchor(null)}
                TransitionComponent={Fade}
                TransitionProps={{
                  timeout: {
                    enter: 300,
                    exit: 200,
                  },
                }}
                disableScrollLock
                disableAutoFocusItem
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: 1,
                    overflow: 'visible',
                  },
                }}
                MenuListProps={{
                  disablePadding: true,
                  sx: {
                    '& .MuiMenuItem-root': {
                      borderRadius: 0,
                      py: 1.5,
                      px: 2,
                    },
                  },
                }}
              >
                {Object.entries(supportedLanguages).map(([langCode, langInfo]) => (
                  <MenuItem 
                    key={langCode}
                    onClick={() => {
                      setLanguage(langCode);
                      setLanguageMenuAnchor(null);
                    }}
                    selected={language === langCode}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '1.2em' }}>
                        {langInfo.flag}
                      </Typography>
                      <Typography variant="body2">
                        {langInfo.name}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Menu>
              <IconButton onClick={() => {
  const newMode = !darkMode;
  setDarkMode(newMode);
  try {
    Cookies.set('dark-mode', newMode.toString(), { expires: 365 });
  } catch (e) {
    console.error('Failed to save dark mode to Cookie:', e);
  }
}} color="inherit">
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* 界面切换 Tabs */}
        <Paper elevation={1} sx={{ mb: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ px: 2 }}
          >
            <Tab label={t('toolbar.blockConfig')} />
            <Tab label={t('toolbar.functionConfig')} />
          </Tabs>
        </Paper>

        {/* 积木设计界面 */}
        {activeTab === 0 && (
          <Stack direction="row" spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
            {/* 左侧面板 */}
            <Stack spacing={2} sx={{ width: 'fit-content' }}>
              <Paper elevation={1} sx={{ 
                p: 3, 
                borderRadius: 2, 
                width: 480,
                height: 360,
                bgcolor: 'background.paper',
                position: 'relative'
              }}>
                <Tooltip title={t('toolbar.blockLibrary')} arrow>
                  <IconButton
                    onClick={() => setBlockLibraryOpen(true)}
                    sx={{
                      position: 'absolute',
                      right: 12,
                      top: 12,
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        color: 'text.primary',
                      },
                    }}
                  >
                    <LibraryBooksIcon />
                  </IconButton>
                </Tooltip>
                <Typography variant="h6" gutterBottom color="text.primary">
                  {t('toolbar.blockPreview')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('messages.addElementTip')}
                </Typography>
                <div ref={previewRef} className="blockly-preview"></div>
              </Paper>
              
              <Paper elevation={1} sx={{ 
                p: 3, 
                borderRadius: 2, 
                width: 480,
                bgcolor: 'background.paper'
              }}>
                <Typography variant="h6" gutterBottom color="text.primary">
                  {t('toolbar.blockConfig')}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('blockConfig.opcode')}
                  </Typography>
                  <TextField
                    value={currentBlock.opcode}
                    onChange={(e) => {
                      const newOpcode = e.target.value;
                      const newBlock = { ...currentBlock, opcode: newOpcode };
                      setCurrentBlock(newBlock);
                      checkUnsavedChanges(newBlock);
                    }}
                    onBlur={(e) => {
                      const opcode = e.target.value;
                      // 验证操作码是否为空
                      if (!opcode || opcode.trim() === '') {
                        showError(t('validation.idRequired'));
                        return;
                      }
                      // 验证操作码格式
                      if (!validateOpcode(opcode)) {
                        showError(t('validation.idInvalid'));
                        return;
                      }
                      // 验证操作码是否重复
                      if (isOpcodeDuplicate(opcode)) {
                        showError(t('validation.idDuplicate'));
                        return;
                      }
                    }}
                    fullWidth
                    size="small"
                    placeholder={t('blockConfig.opcodePlaceholder')}
                    error={
                      !currentBlock.opcode || currentBlock.opcode.trim() === '' ||
                      (currentBlock.opcode && !validateOpcode(currentBlock.opcode)) ||
                      (currentBlock.opcode && isOpcodeDuplicate(currentBlock.opcode))
                    }
                    helperText={
                      !currentBlock.opcode || currentBlock.opcode.trim() === ''
                        ? '操作码不能为空'
                        : currentBlock.opcode && !validateOpcode(currentBlock.opcode)
                        ? '操作码只能包含字母、数字和下划线'
                        : currentBlock.opcode && isOpcodeDuplicate(currentBlock.opcode)
                        ? '操作码已存在'
                        : ''
                    }
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('blockConfig.blockType')}
                  </Typography>
                  <Select
                    value={currentBlock.type}
                    onChange={(e) => {
                      const newBlock = { ...currentBlock, type: e.target.value };
                      setCurrentBlock(newBlock);
                      checkUnsavedChanges(newBlock);
                    }}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="COMMAND">{t('blockConfig.types.COMMAND')}</MenuItem>
                    <MenuItem value="REPORTER">{t('blockConfig.types.REPORTER')}</MenuItem>
                    <MenuItem value="BOOLEAN">{t('blockConfig.types.BOOLEAN')}</MenuItem>
                    <MenuItem value="EVENT">{t('blockConfig.types.EVENT')}</MenuItem>
                    <MenuItem value="HAT">{t('blockConfig.types.HAT')}</MenuItem>
                    <MenuItem value="LOOP">{t('blockConfig.types.LOOP')}</MenuItem>
                    <MenuItem value="CONDITIONAL">{t('blockConfig.types.CONDITIONAL')}</MenuItem>
                  </Select>
                </Box>
                {currentBlock.type === 'CONDITIONAL' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('blockConfig.branchCount')}
                    </Typography>
                    <TextField
                      type="number"
                      value={currentBlock.branchCount}
                      onChange={(e) => {
                        const newBlock = { ...currentBlock, branchCount: parseInt(e.target.value) || 1 };
                        setCurrentBlock(newBlock);
                        checkUnsavedChanges(newBlock);
                      }}
                      fullWidth
                      size="small"
                      inputProps={{ min: 1 }}
                    />
                  </Box>
                )}
              </Paper>
            </Stack>

            {/* 右侧面板 */}
            <Paper elevation={1} sx={{ 
              flex: 1, 
              borderRadius: 2, 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 200px)',
              bgcolor: 'background.paper'
            }}>
              <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 3,
                            pb: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                          }}>
                            <Typography variant="h6" color="text.primary">
                              {t('elements.elementList')}
                            </Typography>
                            <Stack direction="row" spacing={2}>
                              <AddElementMenu
                                onAddLabel={addLabel}
                                onAddTextInput={addTextInput}
                                onAddNumberInput={addNumberInput}
                                onAddDropdown={addDropdown}
                                onAddColourPicker={addColourPicker}
                                onAddBooleanInput={addBooleanInput}
                              />
                              <Tooltip title={t('buttons.save')} arrow>
                                <Button
                                  variant="contained"
                                  onClick={() => { saveCurrentBlock(); saveBlockStyle(); }}
                                  sx={{
                                    borderRadius: '50%',
                                    width: 48,
                                    height: 48,
                                    minWidth: 48,
                                    minHeight: 48,
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <SaveIcon />
                                </Button>
                              </Tooltip>
                              <Tooltip title={t('buttons.clearAll')} arrow>
                                <Button
                                  variant="outlined"
                                  onClick={clearWorkspace}
                                  sx={{
                                    borderRadius: '50%',
                                    width: 48,
                                    height: 48,
                                    minWidth: 48,
                                    minHeight: 48,
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderColor: '#e53e3e',
                                    color: '#e53e3e',
                                    '&:hover': {
                                      backgroundColor: '#e53e3e',
                                      color: '#ffffff',
                                    },
                                  }}
                                >
                                  <DeleteSweepIcon />
                                </Button>
                              </Tooltip>
                            </Stack>
                          </Box>              
                          <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                <ElementList
                  elements={currentBlock.elements}
                  onUpdate={updateElement}
                  onMove={moveElement}
                  onRemove={removeElement}
                  isElementNameDuplicate={isElementNameDuplicate}
                  validateElementName={validateElementName}
                />
              </Box>
            </Paper>
          </Stack>
        )}

        {/* 函数配置界面 */}
        {activeTab === 1 && (
          <Stack direction="row" spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
            {/* 左侧预览面板 */}
            <Stack spacing={2} sx={{ width: 'fit-content' }}>
              <Paper elevation={1} sx={{ 
                p: 3, 
                borderRadius: 2, 
                width: 480,
                height: 360,
                bgcolor: 'background.paper',
                position: 'relative'
              }}>
                <Tooltip title={t('toolbar.blockLibrary')} arrow>
                  <IconButton
                    onClick={() => setBlockLibraryOpen(true)}
                    sx={{
                      position: 'absolute',
                      right: 12,
                      top: 12,
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        color: 'text.primary',
                      },
                    }}
                  >
                    <LibraryBooksIcon />
                  </IconButton>
                </Tooltip>
                <Typography variant="h6" gutterBottom color="text.primary">
                  {t('toolbar.blockPreview')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('toolbar.blockPreview')} - {t('messages.realtimePreview')}
                </Typography>
                <div ref={previewRef2} className="blockly-preview"></div>
              </Paper>
              
              <Paper elevation={1} sx={{ 
                p: 3, 
                borderRadius: 2, 
                width: 480,
                bgcolor: 'background.paper'
              }}>
                <Typography variant="h6" gutterBottom color="text.primary">
                  {t('blockConfig.blockInfo')}
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('blockConfig.blockType')}
                    </Typography>
                    <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
                      {currentBlock.type}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('blockConfig.elementCount')}
                    </Typography>
                    <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
                      {currentBlock.elements.length}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>

            {/* 右侧函数配置面板 */}
            <Paper elevation={1} sx={{ 
              flex: 1, 
              borderRadius: 2, 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 200px)',
              bgcolor: 'background.paper'
            }}>
              <FunctionConfig
                blockElements={currentBlock.elements}
                blockType={currentBlock.type}
                blockOpcode={currentBlock.opcode}
                functions={currentBlock.functions}
                onSave={handleFunctionsSave}
                darkMode={darkMode}
              />
            </Paper>
          </Stack>
        )}
      </Container>

      {/* 文件上传对话框 */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>{t('dialogs.importConfig')}</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ marginTop: '16px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>{t('buttons.cancel')}</Button>
        </DialogActions>
      </Dialog>

      {/* 积木库对话框 */}
      <Dialog 
        open={blockLibraryOpen} 
        onClose={handleCloseBlockLibrary} 
        maxWidth="md" 
        fullWidth
        disableAutoFocus={false}
        disableEnforceFocus={false}
        disablePortal={false}
      >
        <DialogTitle sx={{ position: 'relative' }}>
          {t('blockLibrary.title')}
          <IconButton
            onClick={handleCloseBlockLibrary}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                handleCreateNewBlock();
                handleCloseBlockLibrary();
              }}
              sx={{ alignSelf: 'flex-start' }}
            >
              {t('blockLibrary.createNew')}
            </Button>
            <Paper elevation={0} sx={{ bgcolor: 'background.default', maxHeight: 400, overflowY: 'auto' }}>
              {blockLibraryList.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Typography variant="body2">
                    {t('blockLibrary.noBlocks')}
                  </Typography>
                </Box>
              ) : (
                <List>
                  {blockLibraryList.map((block, index) => (
                    <ListItem
                      key={block.id}
                      onClick={() => {
                        handleSelectBlock(block);
                      }}
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        },
                        alignItems: 'flex-start',
                        py: 2
                      }}
                    >
                      {/* 左侧积木预览容器 */}
                      <Box
                        ref={(el) => {
                          if (el) {
                            blockPreviewRefs.current[block.id] = el;
                          }
                        }}
                        sx={{
                          width: 220,
                          height: 90,
                          minWidth: 220,
                          minHeight: 90,
                          bgcolor: 'background.default',
                          borderRadius: 2,
                          border: '2px solid',
                          borderColor: 'divider',
                          overflow: 'hidden',
                          flexShrink: 0,
                          mr: 2,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                          }
                        }}
                      />
                      
                      {/* 右侧文本信息 */}
                      <ListItemText
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {block.opcode}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {t('blockLibrary.type')}: {block.type} | {t('blockLibrary.elements')}: {block.elements.length} | {t('blockLibrary.functions')}: {block.functions?.length || 0}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {/* 向上移动按钮 */}
                        <Tooltip title={t('blockLibrary.moveUp')} arrow>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMoveBlockUp(e, index)}
                            disabled={index === 0}
                            sx={{
                              color: 'text.secondary',
                              '&:hover': {
                                bgcolor: 'action.hover',
                                color: 'primary.main',
                              },
                              '&:disabled': {
                                opacity: 0.3,
                              }
                            }}
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {/* 向下移动按钮 */}
                        <Tooltip title={t('blockLibrary.moveDown')} arrow>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMoveBlockDown(e, index)}
                            disabled={index === blockLibraryList.length - 1}
                            sx={{
                              color: 'text.secondary',
                              '&:hover': {
                                bgcolor: 'action.hover',
                                color: 'primary.main',
                              },
                              '&:disabled': {
                                opacity: 0.3,
                              }
                            }}
                          >
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {/* 删除按钮 */}
                        <Tooltip title={t('buttons.delete')} arrow>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              showConfirm(t('dialogs.deleteConfirm'), t('blockLibrary.deleteConfirm', { name: block.opcode }), () => {
                                deleteBlock(block.id);
                                // 更新列表状态
                                setBlockLibraryList(prev => prev.filter(b => b.id !== block.id));
                                // 清理预览引用
                                delete blockPreviewRefs.current[block.id];
                              });
                            }}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* 项目设定模态框 */}
      <Dialog 
        open={projectSettingsOpen} 
        onClose={() => setProjectSettingsOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {t('projectSettings.title')}
          <IconButton
            onClick={() => setProjectSettingsOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* 项目设定的内容将在这里添加 */}
          <Typography variant="body2" color="text.secondary">
            项目设定功能开发中...
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
      </ThemeProvider>
    );
  }

// 主App组件，包含AlertProvider
function App() {
  return (
    <LanguageProvider>
      <AlertProvider>
        <AppContent />
      </AlertProvider>
    </LanguageProvider>
  );
}

export default App;