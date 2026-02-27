import React, { useEffect, useRef } from 'react';
import Blockly from 'blockly';

function BlockPreview({ workspace }) {
  const previewRef = useRef(null);

  return (
    <div ref={previewRef} className="blockly-preview"></div>
  );
}

export default BlockPreview;