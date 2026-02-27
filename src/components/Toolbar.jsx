import React from 'react';
import './Toolbar.css';

function Toolbar({
  onAddLabel,
  onAddTextInput,
  onAddNumberInput,
  onAddDropdown,
  onAddColourPicker,
  onAddStatementInput
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>添加积木元素</h3>
        <div className="button-group">
          <button onClick={onAddLabel} className="toolbar-btn label-btn">
            <span>标签</span>
          </button>
          <button onClick={onAddTextInput} className="toolbar-btn text-btn">
            <span>文本</span>
          </button>
          <button onClick={onAddNumberInput} className="toolbar-btn number-btn">
            <span>数字</span>
          </button>
          <button onClick={onAddDropdown} className="toolbar-btn dropdown-btn">
            <span>下拉菜单</span>
          </button>
          <button onClick={onAddColourPicker} className="toolbar-btn colour-btn">
            <span>颜色</span>
          </button>
        </div>
      </div>
      
      <div className="toolbar-section">
        <h3>添加输入</h3>
        <div className="button-group">
          <button onClick={onAddStatementInput} className="toolbar-btn statement-btn">
            <span>语句输入</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;