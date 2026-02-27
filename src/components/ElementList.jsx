import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Box, 
  TextField, 
  TextareaAutosize,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragHandleIcon from '@mui/icons-material/DragHandle';

function ElementList({ elements, onUpdate, onMove, onRemove }) {
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
    } else if (element.type === 'boolean') {
      fields.push(
        // <Box key="defaultValue" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        //   <Typography variant="caption" sx={{ minWidth: 40, color: 'text.secondary' }}>默认值:</Typography>
        //   <TextField
        //     select
        //     size="small"
        //     value={element.defaultValue || 'FALSE'}
        //     onChange={(e) => onUpdate(index, { defaultValue: e.target.value })}
        //     sx={{ flex: 1 }}
        //     variant="outlined"
        //   >
        //     <MenuItem value="TRUE">TRUE</MenuItem>
        //     <MenuItem value="FALSE">FALSE</MenuItem>
        //   </TextField>
        // </Box>
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

  return (
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
        elements.map((element, index) => (
          <Card 
            key={element.id} 
            elevation={2}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                elevation: 4,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2,
                pb: 2,
                borderBottom: '1px solid #f0f0f0'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DragHandleIcon sx={{ color: 'text.secondary', cursor: 'grab' }} />
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
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton 
                    size="small"
                    onClick={() => onMove(index, 'up')}
                    disabled={index === 0}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    ↑
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => onMove(index, 'down')}
                    disabled={index === elements.length - 1}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    ↓
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => onRemove(index)}
                    sx={{ 
                      color: '#f56565',
                      '&:hover': { backgroundColor: 'rgba(245, 101, 101, 0.1)' }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <Box>
                {renderElementFields(element, index)}
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}

export default ElementList;