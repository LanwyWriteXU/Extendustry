import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Box, 
  TextField, 
  TextareaAutosize,
  Collapse
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function ElementList({ elements, onUpdate, onMove, onRemove }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const getTypeLabel = (type) => {
    const labels = {
      'label': '标签',
      'text': '文本',
      'number': '数字',
      'dropdown': '下拉菜单',
      'colour': '颜色',
      'boolean': '布尔值',
      'statement': '分支'
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
    
    // ID字段
    fields.push(
      <Box key="id" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        <Typography variant="caption" sx={{ minWidth: 40, color: 'text.secondary' }}>ID:</Typography>
        <TextField
          size="small"
          value={element.name}
          onChange={(e) => onUpdate(index, { name: e.target.value })}
          sx={{ flex: 1 }}
          variant="outlined"
        />
      </Box>
    );

    // 根据类型显示可编辑字段
    if (element.type === 'label') {
      fields.push(
        <Box key="text" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Typography variant="caption" sx={{ minWidth: 40, color: 'text.secondary' }}>文本:</Typography>
          <TextField
            size="small"
            value={element.text}
            onChange={(e) => onUpdate(index, { text: e.target.value })}
            sx={{ flex: 1 }}
            variant="outlined"
          />
        </Box>
      );
    } else if (element.type === 'text') {
      fields.push(
        <Box key="defaultValue" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Typography variant="caption" sx={{ minWidth: 40, color: 'text.secondary' }}>默认值:</Typography>
          <TextField
            size="small"
            value={element.defaultValue}
            onChange={(e) => onUpdate(index, { defaultValue: e.target.value })}
            sx={{ flex: 1 }}
            variant="outlined"
          />
        </Box>
      );
    } else if (element.type === 'number') {
      fields.push(
        <Box key="defaultValue" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Typography variant="caption" sx={{ minWidth: 40, color: 'text.secondary' }}>默认值:</Typography>
          <TextField
            size="small"
            type="number"
            value={element.defaultValue}
            onChange={(e) => onUpdate(index, { defaultValue: parseFloat(e.target.value) })}
            sx={{ flex: 1 }}
            variant="outlined"
          />
        </Box>
      );
    } else if (element.type === 'colour') {
      fields.push(
        <Box key="defaultValue" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Typography variant="caption" sx={{ minWidth: 40, color: 'text.secondary' }}>默认值:</Typography>
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
          <Typography variant="caption" sx={{ minWidth: 40, color: 'text.secondary' }}>默认值:</Typography>
          <TextField
            size="small"
            value={element.defaultValue}
            onChange={(e) => onUpdate(index, { defaultValue: e.target.value })}
            sx={{ flex: 1 }}
            variant="outlined"
          />
        </Box>
      );
      fields.push(
        <Box key="options" sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>选项:</Typography>
          <TextareaAutosize
            minRows={3}
            value={element.options ? element.options.map(o => o.join(',')).join('\n') : ''}
            onChange={(e) => {
              const lines = e.target.value.split('\n').filter(l => l.trim());
              const newOptions = lines.map(line => {
                const parts = line.split(',');
                return parts.length >= 2 ? [parts[0].trim(), parts[1].trim()] : [line.trim(), line.trim()];
              });
              onUpdate(index, { options: newOptions });
            }}
            placeholder="每行一个选项，格式：显示值,值"
            style={{
              width: '100%',
              fontFamily: 'monospace',
              fontSize: '13px',
              padding: '8px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              resize: 'vertical',
            }}
          />
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
              暂无元素
            </Typography>
            <Typography variant="body2">
              点击右上角按钮添加元素
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