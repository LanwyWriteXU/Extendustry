import React, { useEffect, useRef, useState } from 'react';
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
  uploadFromFile
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
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MenuIcon from '@mui/icons-material/Menu';
import Fade from '@mui/material/Fade';
import logoSvg from '../logo.svg';

// 导入 Zelos 渲染器
import 'blockly/blocks';
import 'blockly/javascript';

function AppContent() {
  const previewRef = useRef(null);
  const previewRef2 = useRef(null); // 用于第二个界面的预览
  const workspaceRef = useRef(null);
  const workspaceRef2 = useRef(null); // 用于第二个界面
  const [currentBlock, setCurrentBlock] = useState({
    id: null,
    opcode: 'my_custom_block',
    type: 'COMMAND',
    branchCount: 2,
    elements: [{ id: 1, type: 'label', text: '默认积木文本' }],
    functions: []
  });
  const elementCounter = useRef(1);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [blockLibraryOpen, setBlockLibraryOpen] = useState(false);
  const [blockLibraryList, setBlockLibraryList] = useState([]);
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);

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

  // 使用自定义alert
  const { showSuccess, showError, showConfirm } = useAlert();

  // 未保存状态
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 保存的积木副本，用于检测未保存的更改
  const [savedBlockSnapshot, setSavedBlockSnapshot] = useState(null);

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

  

  // 加载当前积木
  useEffect(() => {
    const currentBlockId = getCurrentBlockId();
    if (currentBlockId) {
      const block = getBlock(currentBlockId);
      if (block) {
        setCurrentBlock(block);
        // 更新元素计数器
        if (block.elements && block.elements.length > 0) {
          const maxId = Math.max(...block.elements.map(e => e.id));
          elementCounter.current = maxId + 1;
        }
        // 设置初始快照
        setSavedBlockSnapshot(JSON.parse(JSON.stringify(block)));
        setHasUnsavedChanges(false);
      }
    }
  }, []);

  // 当积木库对话框打开时加载积木列表
  useEffect(() => {
    if (blockLibraryOpen) {
      setBlockLibraryList(getAllBlocks());
    }
  }, [blockLibraryOpen]);

  // 保存当前积木
  const saveCurrentBlock = () => {
    const blockToSave = {
      ...currentBlock,
      id: currentBlock.id || Date.now().toString(),
      updatedAt: new Date().toISOString(),
      createdAt: currentBlock.createdAt || new Date().toISOString()
    };
    saveBlock(blockToSave);
    saveCurrentBlockId(blockToSave.id);
    // 更新当前积木状态，确保后续修改保存到正确的积木
    if (currentBlock.id !== blockToSave.id) {
      setCurrentBlock(blockToSave);
    }
    // 更新保存快照
    setSavedBlockSnapshot(JSON.parse(JSON.stringify(blockToSave)));
    setHasUnsavedChanges(false);
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
        if (currentBlock.type === 'COMMAND' || currentBlock.type === 'LOOP' || currentBlock.type === 'CONDITIONAL') {
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
        } else if (currentBlock.type === 'REPORTER') {
          this.setOutput(true, 'Any');
        } else if (currentBlock.type === 'BOOLEAN') {
          this.setOutput(true, 'Boolean');
        } else if (currentBlock.type === 'EVENT' || currentBlock.type === 'HAT') {
          this.setNextStatement(true, null);
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
        elements: [{ id: 1, type: 'label', text: '默认积木文本' }]
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
    showSuccess('积木已保存！');
  };

  // 创建新积木
  const handleCreateNewBlock = () => {
    // 检查是否有未保存的更改
    if (hasUnsavedChanges) {
      showConfirm(
        '未保存的更改',
        '当前积木有未保存的更改，确定要创建新积木吗？未保存的更改将丢失。',
        () => {
          // 确认创建
          const newBlock = {
            id: Date.now().toString(),
            opcode: 'my_custom_block_' + Date.now(),
            type: 'COMMAND',
            branchCount: 2,
            elements: [{ id: 1, type: 'label', text: '默认积木文本' }],
            functions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setCurrentBlock(newBlock);
          saveCurrentBlockId(newBlock.id);
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
        elements: [{ id: 1, type: 'label', text: '默认积木文本' }],
        functions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCurrentBlock(newBlock);
      saveCurrentBlockId(newBlock.id);
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
        '未保存的更改',
        '当前积木有未保存的更改，确定要切换吗？未保存的更改将丢失。',
        () => {
          // 确认切换
          setCurrentBlock(block);
          saveCurrentBlockId(block.id);
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
      saveCurrentBlockId(block.id);
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
                mr: 2,
              }}
            />
            <Typography variant="h5" component="div" sx={{ fontWeight: 600, mr: 2 }}>
              Extendustry
            </Typography>
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
              文件
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
              <MenuItem onClick={() => { saveCurrentBlock(); showSuccess('扩展项目已保存'); setFileMenuAnchor(null); }}>
                保存扩展项目
              </MenuItem>
              <MenuItem onClick={() => { setUploadDialogOpen(true); setFileMenuAnchor(null); }}>
                从电脑中打开
              </MenuItem>
              <MenuItem onClick={() => { downloadAsFile(); setFileMenuAnchor(null); }}>
                导出为扩展文件
              </MenuItem>
            </Menu>
            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
              <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
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
            <Tab label="积木设计" />
            <Tab label="函数配置" />
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
                <Tooltip title="积木库" arrow>
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
                  积木预览
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  使用右侧工具栏添加积木元素
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
                  积木配置
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    操作码 (opcode)
                  </Typography>
                  <TextField
                    value={currentBlock.opcode}
                    onChange={(e) => {
                      const newBlock = { ...currentBlock, opcode: e.target.value };
                      setCurrentBlock(newBlock);
                      checkUnsavedChanges(newBlock);
                    }}
                    fullWidth
                    size="small"
                    placeholder="例如: my_custom_block"
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    积木类型
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
                    <MenuItem value="COMMAND">COMMAND</MenuItem>
                    <MenuItem value="REPORTER">REPORTER</MenuItem>
                    <MenuItem value="BOOLEAN">BOOLEAN</MenuItem>
                    <MenuItem value="EVENT">EVENT</MenuItem>
                    <MenuItem value="HAT">HAT</MenuItem>
                    <MenuItem value="LOOP">LOOP</MenuItem>
                    <MenuItem value="CONDITIONAL">CONDITIONAL</MenuItem>
                  </Select>
                </Box>
                {currentBlock.type === 'CONDITIONAL' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      分支数量
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
                              元素列表
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
                              <Tooltip title="保存积木" arrow>
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
                              <Tooltip title="清空全部" arrow>
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
                <Tooltip title="积木库" arrow>
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
                  积木预览
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  当前积木的实时预览
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
                  积木信息
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      积木类型
                    </Typography>
                    <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
                      {currentBlock.type}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      元素数量
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
                onSave={handleFunctionsSave}
              />
            </Paper>
          </Stack>
        )}
      </Container>

      {/* 文件上传对话框 */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>导入配置</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ marginTop: '16px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>取消</Button>
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
          积木库
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
              创建新积木
            </Button>
            <Paper elevation={0} sx={{ bgcolor: 'background.default', maxHeight: 400, overflowY: 'auto' }}>
              {blockLibraryList.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Typography variant="body2">
                    积木库为空，点击上方按钮创建新积木
                  </Typography>
                </Box>
              ) : (
                <List>
                  {blockLibraryList.map((block) => (
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
                        }
                      }}
                    >
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
                              类型: {block.type} | 元素: {block.elements.length} | 函数: {block.functions?.length || 0}
                            </Typography>
                          </Box>
                        }
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          showConfirm('确认删除', `确定要删除积木 "${block.opcode}" 吗？`, () => {
                            deleteBlock(block.id);
                            // 更新列表状态
                            setBlockLibraryList(prev => prev.filter(b => b.id !== block.id));
                          });
                        }}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
      </ThemeProvider>
    );
  }

// 主App组件，包含AlertProvider
function App() {
  return (
    <AlertProvider>
      <AppContent />
    </AlertProvider>
  );
}

export default App;