import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Box, 
  TextField, 
  TextareaAutosize,
  Collapse,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function ElementList({ elements, onUpdate, onMove, onRemove, isElementNameDuplicate, validateElementName }) {
  const { t } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState(null);

  const getTypeLabel = (type) => {
    const labels = {
      'label': t('elementTypes.label'),
      'text': t('elementTypes.text'),
      'number': t('elementTypes.number'),
      'dropdown': t('elementTypes.dropdown'),
      'colour': t('elementTypes.colour'),
      'boolean': t('elementTypes.boolean'),
      'statement': t('elementTypes.statement')
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      'label': '#6366f1',
      'text': '#667eea',
      'number': '#11998e',
      'dropdown': '#00c6ff',
      'colour': '#f093fb',
      'boolean': '#f59f00',
      'statement': '#10b981'
    };
    return colors[type] || '#666';
  };

  const renderElementFields = (element, index) => {
    const fields = [];
    
    // ID字段（标签类型的ID可以为空）
    fields.push(
      <Box key="id" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        <Typography variant="caption" sx={{ minWidth: 40, color: 'text.secondary' }}>{t('elements.id')}:</Typography>
        <TextField
          size="small"
          value={element.name}
          onChange={(e) => {
            // 实时更新显示的值
            onUpdate(index, { name: e.target.value });
          }}
          onBlur={(e) => {
            const newName = e.target.value;
            // 标签类型的ID可以为空，其他类型必须非空
            if (element.type !== 'label' && (!newName || newName.trim() === '')) {
              // 显示错误提示，不更新数据
              return;
            }
            // 如果不为空，验证ID是否包含非法字符
            if (newName && newName.trim() !== '' && validateElementName && !validateElementName(newName)) {
              // 显示错误提示，不更新数据
              return;
            }
            // 如果不为空，验证ID是否重复
            if (newName && newName.trim() !== '' && isElementNameDuplicate && isElementNameDuplicate(newName, element.id)) {
              // 显示错误提示，不更新数据
              return;
            }
            // 验证通过，数据已在 onChange 中更新
          }}
          sx={{ flex: 1 }}
          variant="outlined"
          error={
            element.type !== 'label' && (!element.name || element.name.trim() === '') ||
            (element.name && element.name.trim() !== '' && validateElementName && !validateElementName(element.name)) ||
            (element.name && element.name.trim() !== '' && isElementNameDuplicate && isElementNameDuplicate(element.name, element.id))
          }
          helperText={
            element.type !== 'label' && (!element.name || element.name.trim() === '')
              ? t('validation.idRequired')
              : element.name && element.name.trim() !== '' && validateElementName && !validateElementName(element.name)
              ? t('validation.idInvalid')
              : element.name && element.name.trim() !== '' && isElementNameDuplicate && isElementNameDuplicate(element.name, element.id)
              ? t('validation.idDuplicate')
              : ''
          }
        />
      </Box>
    );

    // 根据类型显示可编辑字段
    if (element.type === 'label') {
      fields.push(
        <Box key="text" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Typography variant="caption" sx={{ minWidth: 40, color: 'text.secondary' }}>{t('elements.text')}:</Typography>
          <TextField
            size="small"
            value={element.text || ''}
            onChange={(e) => {
              // 仅用于UI更新，不触发预览更新
              onUpdate(index, { text: e.target.value });
            }}
            sx={{ flex: 1 }}
            variant="outlined"
          />
        </Box>
      );
    } else if (element.type === 'text') {
      fields.push(
        <Box key="defaultValue" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Typography variant="caption" sx={{ minWidth: 40, color: 'text.secondary' }}>{t('elements.defaultValue')}:</Typography>
          <TextField
            size="small"
            value={element.defaultValue || ''}
            onChange={(e) => onUpdate(index, { defaultValue: e.target.value })}
            sx={{ flex: 1 }}
            variant="outlined"
          />
        </Box>
      );
    } else if (element.type === 'number') {
      fields.push(
        <Box key="defaultValue" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Typography variant="caption" sx={{ minWidth: 40, color: 'text.secondary' }}>{t('elements.defaultValue')}:</Typography>
          <TextField
            size="small"
            type="number"
            value={element.defaultValue}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
              onUpdate(index, { defaultValue: value });
            }}
            sx={{ flex: 1 }}
            variant="outlined"
          />
        </Box>
      );
    } else if (element.type === 'colour') {
      fields.push(
        <Box key="defaultValue" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Typography variant="caption" sx={{ minWidth: 40, color: 'text.secondary' }}>{t('elements.defaultValue')}:</Typography>
          <input
            type="color"
            value={element.defaultValue}
            onChange={(e) => onUpdate(index, { defaultValue: e.target.value })}
            style={{ width: 40, height: 35, border: 'none', cursor: 'pointer' }}
          />
          <TextField
            size="small"
            value={element.defaultValue}
            onChange={(e) => onUpdate(index, { defaultValue: e.target.value })}
            sx={{ flex: 1 }}
            variant="outlined"
          />
        </Box>
      );
    } else if (element.type === 'dropdown') {
      fields.push(
        <Box key="defaultValue" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Typography variant="caption" sx={{ minWidth: 40, color: 'text.secondary' }}>{t('elements.defaultValue')}:</Typography>
          <TextField
            size="small"
            value={element.defaultValue}
            onChange={(e) => onUpdate(index, { defaultValue: e.target.value })}
            sx={{ flex: 1 }}
            variant="outlined"
          />
        </Box>
      );
      // 下拉列表选项编辑器
      const options = element.options || [];
      fields.push(
        <Box key="options" sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t('elements.options')}:</Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const newOptions = [...options, ['新选项', 'new_option']];
                onUpdate(index, { options: newOptions });
              }}
              sx={{ fontSize: '11px', py: 0.5, px: 1 }}
            >
              + 添加选项
            </Button>
          </Box>
          <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
            {options.map((option, optIndex) => (
              <Box
                key={optIndex}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  p: 1,
                  borderBottom: optIndex < options.length - 1 ? '1px solid #e0e0e0' : 'none',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => {
                    if (optIndex > 0) {
                      const newOptions = [...options];
                      [newOptions[optIndex - 1], newOptions[optIndex]] = [newOptions[optIndex], newOptions[optIndex - 1]];
                      onUpdate(index, { options: newOptions });
                    }
                  }}
                  disabled={optIndex === 0}
                  sx={{ p: 0.5, minWidth: 24 }}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (optIndex < options.length - 1) {
                      const newOptions = [...options];
                      [newOptions[optIndex], newOptions[optIndex + 1]] = [newOptions[optIndex + 1], newOptions[optIndex]];
                      onUpdate(index, { options: newOptions });
                    }
                  }}
                  disabled={optIndex === options.length - 1}
                  sx={{ p: 0.5, minWidth: 24 }}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
                <TextField
                  size="small"
                  placeholder="显示文本"
                  value={option[0] || ''}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[optIndex] = [e.target.value, option[1]];
                    onUpdate(index, { options: newOptions });
                  }}
                  sx={{ flex: 1 }}
                  variant="outlined"
                />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>→</Typography>
                <TextField
                  size="small"
                  placeholder="值"
                  value={option[1] || ''}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[optIndex] = [option[0], e.target.value];
                    onUpdate(index, { options: newOptions });
                  }}
                  sx={{ flex: 1 }}
                  variant="outlined"
                />
                <IconButton
                  size="small"
                  onClick={() => {
                    const newOptions = options.filter((_, i) => i !== optIndex);
                    // 如果删除的是默认值，更新默认值
                    let newDefaultValue = element.defaultValue;
                    if (element.defaultValue === option[1] && newOptions.length > 0) {
                      newDefaultValue = newOptions[0][1];
                    }
                    onUpdate(index, { 
                      options: newOptions,
                      defaultValue: newDefaultValue
                    });
                  }}
                  sx={{ p: 0.5, minWidth: 24, color: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            {options.length === 0 && (
              <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="caption">暂无选项，点击上方按钮添加</Typography>
              </Box>
            )}
          </Box>
        </Box>
      );
    }

    return fields;
  };

  // 处理拖拽结束
  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex !== destinationIndex) {
      onMove(sourceIndex, destinationIndex);
      // 如果展开的卡片位置改变了，更新展开索引
      if (expandedIndex === sourceIndex) {
        setExpandedIndex(destinationIndex);
      }
    }
  };

  // 切换卡片展开状态
  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {elements.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            color: 'text.secondary'
          }}>
            <Typography variant="h6" gutterBottom>
              {t('elements.noElements')}
            </Typography>
            <Typography variant="body2">
              {t('elements.addElement')}
            </Typography>
          </Box>
        ) : (
          <Droppable droppableId="element-list">
            {(provided, snapshot) => (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                {elements.map((element, index) => (
                  <Draggable
                    key={element.id}
                    draggableId={`element-${element.id}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        elevation={snapshot.isDragging ? 8 : 1}
                        sx={{
                          transition: 'all 0.2s ease',
                          border: '1px solid #e0e0e0',
                          '&:hover': {
                            elevation: 2,
                            borderColor: '#d0d0d0',
                          },
                          opacity: snapshot.isDragging ? 0.95 : 1,
                          transform: snapshot.isDragging ? 'scale(1.02)' : 'none',
                          boxShadow: snapshot.isDragging ? '0 10px 30px rgba(0,0,0,0.2)' : 'none',
                          borderColor: expandedIndex === index ? getTypeColor(element.type) : '#e0e0e0',
                          borderWidth: expandedIndex === index ? 2 : 1,
                        }}
                      >
                        <CardContent sx={{ p: 2, py: 1.5 }}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              cursor: 'pointer'
                            }}
                            onClick={() => toggleExpand(index)}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                {...provided.dragHandleProps}
                                sx={{ 
                                  cursor: 'grab',
                                  display: 'flex',
                                  alignItems: 'center',
                                  '&:active': { cursor: 'grabbing' }
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DragHandleIcon sx={{ color: 'text.secondary' }} />
                              </Box>
                              <Typography 
                                variant="subtitle2"
                                sx={{ 
                                  fontWeight: 600,
                                  color: getTypeColor(element.type),
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5
                                }}
                              >
                                {getTypeLabel(element.type)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                              <IconButton 
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemove(index);
                                }}
                                sx={{ 
                                  color: '#f56565',
                                  '&:hover': { backgroundColor: 'rgba(245, 101, 101, 0.1)' }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              <ExpandMore
                                sx={{
                                  transition: 'transform 0.3s ease',
                                  transform: expandedIndex === index ? 'rotate(0deg)' : 'rotate(-90deg)',
                                  color: 'text.secondary'
                                }}
                              />
                            </Box>
                          </Box>
                          <Collapse in={expandedIndex === index} timeout={300}>
                            <Box sx={{ mt: 2 }}>
                              {renderElementFields(element, index)}
                            </Box>
                          </Collapse>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        )}
      </Box>
    </DragDropContext>
  );
}

export default ElementList;