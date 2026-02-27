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
  Stack
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

// 导入 Zelos 渲染器
import 'blockly/blocks';
import 'blockly/javascript';

function App() {
  const previewRef = useRef(null);
  const workspaceRef = useRef(null);
  const [blockElements, setBlockElements] = useState([]);
  const [blockName, setBlockName] = useState('标签');
  const elementCounter = useRef(0);

  // 初始化 Blockly 工作区
  useEffect(() => {
    if (previewRef.current) {
      // 注册自定义积木类型
      registerCustomBlock();

      // 创建预览工作区（无 Toolbox，使用 Zelos 渲染器）
      const workspace = Blockly.inject(previewRef.current, {
        renderer: 'zelos',
        theme: Blockly.Themes.Classic,
        media: 'src/assets/media',
        scrollbars: true,
        readOnly: false,
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3.0,
          minScale: 1.0,
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
  }, [blockElements, blockName]);

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

    const blockType = 'dynamic_custom_block';
    
    // 重新注册积木类型
    Blockly.Blocks[blockType] = {
      init: function() {
        let currentInput = null;
        
        // 添加所有元素
        blockElements.forEach((element, index) => {
          if (element.type === 'label') {
            // 标签添加到最后一个输入
            if (currentInput) {
              currentInput.appendField(element.text);
            } else {
              // 如果是第一个元素，创建新的 input
              currentInput = this.appendDummyInput()
                .appendField(element.text);
            }
          } else if (element.type === 'statement') {
            // 语句输入（分支）- 创建新 input
            currentInput = this.appendStatementInput(`STACK_${element.id}`)
              .setCheck(null);
          } else if (element.type === 'boolean') {
            // 布尔值 - 创建值输入，设置为 Boolean 类型
            currentInput = this.appendValueInput(`BOOLEAN_${element.id}`)
              .setCheck("Boolean");
          } else if (['text', 'number', 'dropdown', 'colour'].includes(element.type)) {
            // 字段类型 - 如果前一个元素是分支，需要创建新 input
            const prevElement = blockElements[index - 1];
            if (prevElement && (prevElement.type === 'statement' || prevElement.type === 'boolean')) {
              currentInput = this.appendDummyInput();
            }
            
            // 如果没有当前 input，创建一个
            if (!currentInput) {
              currentInput = this.appendDummyInput();
            }
            
            // 添加字段到当前 input
            switch (element.type) {
              case 'text':
                currentInput.appendField(new Blockly.FieldTextInput(element.defaultValue || '文本'), `FIELD_TEXT_${element.id}`);
                break;
              case 'number':
                currentInput.appendField(new Blockly.FieldNumber(element.defaultValue || 0), `FIELD_NUMBER_${element.id}`);
                break;
              case 'dropdown':
                currentInput.appendField(new Blockly.FieldDropdown(element.options || [['选项1', 'OPT1'], ['选项2', 'OPT2']]), `FIELD_DROPDOWN_${element.id}`);
                break;
              case 'colour':
                currentInput.appendField(new Blockly.FieldColour(element.defaultValue || '#ff0000'), `FIELD_COLOUR_${element.id}`);
                break;
            }
          } 
        });
        
        this.setColour(230);
        this.setTooltip('动态自定义积木');
        this.setHelpUrl('');
      }
    };

    // 创建积木实例
    const block = workspace.newBlock(blockType);
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
  const moveElement = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const newElements = [...blockElements];
      [newElements[index - 1], newElements[index]] = [newElements[index], newElements[index - 1]];
      setBlockElements(newElements);
    } else if (direction === 'down' && index < blockElements.length - 1) {
      const newElements = [...blockElements];
      [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
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
    setBlockElements([]);
    elementCounter.current = 0;
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <AppBar position="static" elevation={0} sx={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, color: '#2d3748', fontWeight: 600 }}>
            Extendustry
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack direction="row" spacing={3} sx={{ height: 'calc(100vh - 120px)' }}>
          {/* 左侧面板 */}
          <Stack spacing={2} sx={{ width: 'fit-content' }}>
            <Paper elevation={3} sx={{ 
              p: 3, 
              borderRadius: 3, 
              width: 480,
              height: 360
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#2d3748' }}>
                积木预览
              </Typography>
              <Typography variant="body2" sx={{ color: '#718096', mb: 2 }}>
                使用右侧工具栏添加积木元素
              </Typography>
              <div ref={previewRef} className="blockly-preview"></div>
            </Paper>

            {/* 旧的工具栏 - 可以保留或者删除 */}
          </Stack>

          {/* 右侧面板 */}
          <Paper elevation={3} sx={{ 
            flex: 1, 
            borderRadius: 3, 
            p: 3, 
            display: 'flex', 
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 120px)'
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3,
              pb: 2,
              borderBottom: '2px solid #e0e0e0'
            }}>
              <Typography variant="h6" sx={{ color: '#2d3748' }}>
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
                  onAddStatementInput={addStatementInput}
                />
                <Button
                  variant="outlined"
                  startIcon={<DeleteSweepIcon />}
                  onClick={clearWorkspace}
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    borderColor: '#f56565',
                    color: '#f56565',
                    '&:hover': {
                      borderColor: '#e53e3e',
                      backgroundColor: 'rgba(245, 101, 101, 0.05)',
                    },
                  }}
                >
                  清空全部
                </Button>
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
  );
}

export default App;