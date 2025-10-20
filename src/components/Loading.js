import React from 'react';
import { CSpinner } from '@coreui/react';

const Loading = ({ text = 'Đang tải...', size = 'md', className = '' }) => {
  return (
    <div className={`d-flex flex-column align-items-center justify-content-center p-4 ${className}`}>
      <CSpinner 
        color="primary" 
        size={size}
        className="mb-3"
      />
      {text && (
        <div className="text-muted small">
          {text}
        </div>
      )}
    </div>
  );
};

export default Loading;
