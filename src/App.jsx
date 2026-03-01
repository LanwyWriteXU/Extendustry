import React, { useEffect, useRef, useState } from 'react';
import Blockly from 'blockly';
import BlocklyJS from 'blockly/javascript';
import './App.css';
import AddElementMenu from './components/AddElementMenu';
import ElementList from './components/ElementList';
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
  TextField
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import logoSvg from '../logo.svg';

// 导入 Zelos 渲染器
import 'blockly/blocks';
import 'blockly/javascript';

function App() {
  const previewRef = useRef(null);
  const workspaceRef = useRef(null);
  const [blockElements, setBlockElements] = useState([{ id: 1, type: 'label', text: '默认积木文本' }]);
  const [blockName, setBlockName] = useState('默认积木文本');
  const [blockType, setBlockType] = useState('COMMAND');
  const [branchCount, setBranchCount] = useState(2);
  const elementCounter = useRef(1);
  const [darkMode, setDarkMode] = useState(false);

  // 创建主题
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#667eea',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
  });

  // 初始化 Blockly 工作区
  useEffect(() => {
    if (previewRef.current) {
      // 注册自定义积木类型
      registerCustomBlock();

      // 创建预览工作区
      const workspace = Blockly.inject(previewRef.current, {
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

      workspaceRef.current = workspace;

      // 禁用右键菜单
      disableContextMenu(workspace);

      // 添加默认积木
      updateBlock(workspace);

      return () => {
        workspace.dispose();
      };
    }
  }, []);

  // 当积木元素或名称改变时，重新渲染积木
  useEffect(() => {
    if (workspaceRef.current) {
      updateBlock(workspaceRef.current);
    }
  }, [blockElements, blockName, blockType, branchCount]);

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
      
      blockElements.forEach((element, index) => {
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
    
    blockElements.forEach((element, index) => {
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
        if (blockType === 'COMMAND' || blockType === 'LOOP' || blockType === 'CONDITIONAL') {
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
        } else if (blockType === 'REPORTER') {
          this.setOutput(true, 'Any');
        } else if (blockType === 'BOOLEAN') {
          this.setOutput(true, 'Boolean');
        } else if (blockType === 'EVENT' || blockType === 'HAT') {
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
        if (blockType === 'CONDITIONAL') {
          // 添加N个分支
          for (let i = 0; i < branchCount; i++) {
            this.appendStatementInput(`BRANCH_${i}`)
              .setCheck(null);
          }
        } else if (blockType === 'LOOP') {
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
    setBlockElements([...blockElements, {
      id: elementCounter.current,
      type: 'boolean',
      name: `BOOLEAN_${elementCounter.current}`
    }]);
  };

  // 添加语句输入（分支）
  const addStatementInput = () => {
    elementCounter.current++;
    setBlockElements([...blockElements, {
      id: elementCounter.current,
      type: 'statement',
      name: `STACK_${elementCounter.current}`
    }]);
  };

  // 添加标签
  const addLabel = () => {
    elementCounter.current++;
    setBlockElements([...blockElements, {
      id: elementCounter.current,
      type: 'label',
      text: '标签'
    }]);
  };

  // 添加文本字段
  const addTextInput = () => {
    elementCounter.current++;
    setBlockElements([...blockElements, {
      id: elementCounter.current,
      type: 'text',
      name: `FIELD_TEXT_${elementCounter.current}`,
      defaultValue: '文本'
    }]);
  };

  // 添加数字字段
  const addNumberInput = () => {
    elementCounter.current++;
    setBlockElements([...blockElements, {
      id: elementCounter.current,
      type: 'number',
      name: `FIELD_NUMBER_${elementCounter.current}`,
      defaultValue: 0
    }]);
  };

  // 添加下拉菜单字段
  const addDropdown = () => {
    elementCounter.current++;
    setBlockElements([...blockElements, {
      id: elementCounter.current,
      type: 'dropdown',
      name: `FIELD_DROPDOWN_${elementCounter.current}`,
      defaultValue: 'OPT1',
      options: [['选项1', 'OPT1'], ['选项2', 'OPT2'], ['选项3', 'OPT3']]
    }]);
  };

  // 添加颜色选择器字段
  const addColourPicker = () => {
    elementCounter.current++;
    setBlockElements([...blockElements, {
      id: elementCounter.current,
      type: 'colour',
      name: `FIELD_COLOUR_${elementCounter.current}`,
      defaultValue: '#ff0000'
    }]);
  };

  // 更新元素
  const updateElement = (index, updates) => {
    const newElements = [...blockElements];
    newElements[index] = { ...newElements[index], ...updates };
    setBlockElements(newElements);
  };

  // 移动元素
  const moveElement = (sourceIndex, destinationIndex) => {
    // 支持两种调用方式：
    // 1. 旧方式：moveElement(index, 'up'/'down')
    // 2. 新方式：moveElement(sourceIndex, destinationIndex)
    
    if (typeof destinationIndex === 'string') {
      // 旧方式：direction 参数
      const direction = destinationIndex;
      if (direction === 'up' && sourceIndex > 0) {
        const newElements = [...blockElements];
        [newElements[sourceIndex - 1], newElements[sourceIndex]] = [newElements[sourceIndex], newElements[sourceIndex - 1]];
        setBlockElements(newElements);
      } else if (direction === 'down' && sourceIndex < blockElements.length - 1) {
        const newElements = [...blockElements];
        [newElements[sourceIndex], newElements[sourceIndex + 1]] = [newElements[sourceIndex + 1], newElements[sourceIndex]];
        setBlockElements(newElements);
      }
    } else {
      // 新方式：拖拽排序
      if (sourceIndex === destinationIndex) {
        return;
      }
      
      const newElements = [...blockElements];
      const [movedElement] = newElements.splice(sourceIndex, 1);
      newElements.splice(destinationIndex, 0, movedElement);
      setBlockElements(newElements);
    }
  };

  // 删除元素
  const removeElement = (index) => {
    const newElements = blockElements.filter((_, i) => i !== index);
    setBlockElements(newElements);
  };

  // 清空工作区
  const clearWorkspace = () => {
    setBlockElements([{ id: 1, type: 'label', text: '默认积木文本' }]);
    elementCounter.current = 1;
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
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Extendustry
            </Typography>
            <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack direction="row" spacing={3} sx={{ height: 'calc(100vh - 120px)' }}>
          {/* 左侧面板 */}
          <Stack spacing={2} sx={{ width: 'fit-content' }}>
            <Paper elevation={1} sx={{ 
              p: 3, 
              borderRadius: 2, 
              width: 480,
              height: 360,
              bgcolor: 'background.paper'
            }}>
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
                积木类型
              </Typography>
              <Select
                value={blockType}
                onChange={(e) => setBlockType(e.target.value)}
                fullWidth
                sx={{
                  mt: 2,
                }}
              >
                <MenuItem value="COMMAND">COMMAND</MenuItem>
                <MenuItem value="REPORTER">REPORTER</MenuItem>
                <MenuItem value="BOOLEAN">BOOLEAN</MenuItem>
                <MenuItem value="EVENT">EVENT</MenuItem>
                <MenuItem value="HAT">HAT</MenuItem>
                <MenuItem value="LOOP">LOOP</MenuItem>
                <MenuItem value="CONDITIONAL">CONDITIONAL</MenuItem>
              </Select>
              {blockType === 'CONDITIONAL' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    分支数量
                  </Typography>
                  <TextField
                    type="number"
                    value={branchCount}
                    onChange={(e) => setBranchCount(parseInt(e.target.value) || 2)}
                    fullWidth
                    inputProps={{ min: 1 }}
                    sx={{
                      mt: 1,
                    }}
                  />
                </Box>
              )}
              {blockType === 'LOOP' && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}></Typography>
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
            maxHeight: 'calc(100vh - 120px)',
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
                elements={blockElements}
                onUpdate={updateElement}
                onMove={moveElement}
                onRemove={removeElement}
              />
            </Box>
          </Paper>
        </Stack>
      </Container>
    </Box>
      </ThemeProvider>
    );
  }

export default App;