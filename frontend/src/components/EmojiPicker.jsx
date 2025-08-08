import React from 'react';
import EmojiPickerReact from 'emoji-picker-react';

const EmojiPicker = ({ onEmojiClick, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="relative">
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      <div className="absolute bottom-full right-0 mb-2 z-50">
        <EmojiPickerReact
          onEmojiClick={onEmojiClick}
          autoFocusSearch={false}
          searchDisabled={false}
          skinTonesDisabled={false}
          width={320}
          height={400}
          lazyLoadEmojis={true}
          previewConfig={{
            showPreview: false
          }}
        />
      </div>
    </div>
  );
};

export default EmojiPicker; 