import React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';

function AddElementMenu({ onAddLabel, onAddTextInput, onAddNumberInput, onAddDropdown, onAddColourPicker, onAddBooleanInput }) {
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
    }
  };

  return (
    <div>
      <Tooltip title="添加元素" arrow>
        <Button
          variant="contained"
          onClick={handleClick}
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
          <AddIcon />
        </Button>
      </Tooltip>
      <style>{`
        @keyframes expandDown {
          from {
            opacity: 0;
            transform: scaleY(0) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scaleY(1) translateY(0);
          }
        }
        .MuiMenu-paper {
          animation: expandDown 0.2s ease-out forwards;
          transform-origin: top center;
        }
      `}</style>
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
      </Menu>
    </div>
  );
}

export default AddElementMenu;