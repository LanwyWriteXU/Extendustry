import React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';

function AddElementMenu({ onAddLabel, onAddTextInput, onAddNumberInput, onAddDropdown, onAddColourPicker, onAddBooleanInput, onAddStatementInput }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAdd = (type) => {
    handleClose();
    switch (type) {
      case 'label':
        onAddLabel();
        break;
      case 'text':
        onAddTextInput();
        break;
      case 'number':
        onAddNumberInput();
        break;
      case 'dropdown':
        onAddDropdown();
        break;
      case 'colour':
        onAddColourPicker();
        break;
      case 'boolean':
        onAddBooleanInput();
        break;
      case 'statement':
        onAddStatementInput();
        break;
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleClick}
        sx={{
          borderRadius: '20px',
          textTransform: 'none',
          px: 3,
          py: 1,
          fontSize: '14px',
          fontWeight: 600,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5568d3 0%, #653a90 100%)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          },
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
        }}
      >
        添加元素
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            minWidth: '200px',
            mt: 1,
          },
        }}
      >
        <MenuItem onClick={() => handleAdd('label')} sx={{ py: 2 }}>
          <span>标签</span>
        </MenuItem>
        <MenuItem onClick={() => handleAdd('text')} sx={{ py: 2 }}>
          <span>文本</span>
        </MenuItem>
        <MenuItem onClick={() => handleAdd('number')} sx={{ py: 2 }}>
          <span>数字</span>
        </MenuItem>
        <MenuItem onClick={() => handleAdd('dropdown')} sx={{ py: 2 }}>
          <span>下拉菜单</span>
        </MenuItem>
        <MenuItem onClick={() => handleAdd('colour')} sx={{ py: 2 }}>
          <span>颜色</span>
        </MenuItem>
        <MenuItem onClick={() => handleAdd('boolean')} sx={{ py: 2 }}>
          <span>布尔值</span>
        </MenuItem>
        <MenuItem onClick={() => handleAdd('statement')} sx={{ py: 2 }}>
          <span>分支</span>
        </MenuItem>
      </Menu>
    </div>
  );
}

export default AddElementMenu;