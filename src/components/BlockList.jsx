import React, { useState } from 'react';
import { useAlert } from './Alert';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  getAllBlocks,
  deleteBlock,
  saveBlock,
  saveCurrentBlockId
} from '../utils/storage';

function BlockList({ onSelectBlock, onCreateNew }) {
  const { showWarning, showConfirm } = useAlert();
  const [blocks, setBlocks] = useState([]);
  const [open, setOpen] = useState(false);
  const [editBlock, setEditBlock] = useState(null);
  const [blockName, setBlockName] = useState('');

  // 加载积木列表
  const loadBlocks = () => {
    const allBlocks = getAllBlocks();
    setBlocks(allBlocks);
  };

  // 组件加载时获取积木列表
  React.useEffect(() => {
    loadBlocks();
  }, []);

  // 创建新积木
  const handleCreateNew = () => {
    onCreateNew();
  };

  // 选择积木
  const handleSelectBlock = (block) => {
    onSelectBlock(block);
  };

  // 删除积木
  const handleDeleteBlock = (e, block) => {
    e.stopPropagation();
    showConfirm('确认删除', `确定要删除积木 "${block.name}" 吗？`, () => {
      deleteBlock(block.id);
      loadBlocks();
    });
  };

  // 复制积木
  const handleDuplicateBlock = (e, block) => {
    e.stopPropagation();
    const newBlock = {
      ...block,
      id: Date.now().toString(),
      name: `${block.name} (副本)`,
      createdAt: new Date().toISOString()
    };
    saveBlock(newBlock);
    loadBlocks();
  };

  // 打开编辑对话框
  const handleEditBlock = (e, block) => {
    e.stopPropagation();
    setEditBlock(block);
    setBlockName(block.name);
    setOpen(true);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!blockName.trim()) {
      showWarning('请输入积木名称');
      return;
    }

    const updatedBlock = {
      ...editBlock,
      name: blockName,
      updatedAt: new Date().toISOString()
    };

    saveBlock(updatedBlock);
    saveCurrentBlockId(updatedBlock.id);
    loadBlocks();
    setOpen(false);
    setEditBlock(null);
    setBlockName('');
  };

  // 关闭对话框
  const handleClose = () => {
    setOpen(false);
    setEditBlock(null);
    setBlockName('');
  };

  const getBlockTypeColor = (type) => {
    const colors = {
      'COMMAND': '#6366f1',
      'REPORTER': '#10b981',
      'BOOLEAN': '#f59f00',
      'EVENT': '#ec4899',
      'HAT': '#8b5cf6',
      'LOOP': '#06b6d4',
      'CONDITIONAL': '#ef4444'
    };
    return colors[type] || '#666';
  };

  return (
    <>
      <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="text.primary">
            积木列表 ({blocks.length})
          </Typography>
          <Tooltip title="创建新积木" arrow>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
              size="small"
            >
              新建积木
            </Button>
          </Tooltip>
        </Box>

        <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {blocks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <Typography variant="body2">
                暂无积木，点击上方按钮创建
              </Typography>
            </Box>
          ) : (
            blocks.map((block) => (
              <ListItem
                key={block.id}
                disablePadding
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="编辑名称" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => handleEditBlock(e, block)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="复制积木" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => handleDuplicateBlock(e, block)}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="删除积木" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteBlock(e, block)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemButton onClick={() => handleSelectBlock(block)}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" color="text.primary">
                          {block.name}
                        </Typography>
                        <Chip
                          label={block.type}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 11,
                            bgcolor: getBlockTypeColor(block.type),
                            color: 'white'
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {block.elements?.length || 0} 个元素
                        </Typography>
                        {block.functions && block.functions.length > 0 && (
                          <Chip
                            label={`${block.functions.length} 个函数`}
                            size="small"
                            sx={{ height: 18, fontSize: 10 }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      {/* 编辑积木名称对话框 */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>编辑积木名称</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="积木名称"
            fullWidth
            variant="outlined"
            value={blockName}
            onChange={(e) => setBlockName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSaveEdit} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BlockList;