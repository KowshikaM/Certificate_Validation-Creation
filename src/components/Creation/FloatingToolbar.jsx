import React, { forwardRef, useState } from 'react';
import { 
  Box, 
  IconButton, 
  Select, 
  MenuItem, 
  FormControl,
  Tooltip,
  Popover
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import PaletteIcon from '@mui/icons-material/Palette';
import { HexColorPicker } from 'react-colorful';

const FloatingToolbar = forwardRef(({ position, onAction, visible }, ref) => {
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#000000');

  const fontSizes = [
    { label: 'Small', value: '2' },
    { label: 'Normal', value: '4' },
    { label: 'Large', value: '6' },
    { label: 'Huge', value: '7' }
  ];

  const fontFamilies = [
    { label: 'Serif', value: 'serif' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Verdana', value: 'Verdana' },
    { label: 'Helvetica', value: 'Helvetica' },
    { label: 'Courier New', value: 'Courier New' }
  ];

  const handleColorChange = (color) => {
    setSelectedColor(color);
    onAction('foreColor', color);
    setColorPickerAnchor(null);
  };

  const handleFormatAction = (action, value = null) => {
    onAction(action, value);
  };

  if (!visible) return null;

  return (
    <Box
      ref={ref}
      className="floating-toolbar"
      sx={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        background: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        borderRadius: 2,
        p: 1,
        zIndex: 9999,
        display: 'flex',
        gap: 0.5,
        alignItems: 'center',
        border: '1px solid #e0e0e0',
        minWidth: 'fit-content',
      }}
    >
      {/* Bold */}
      <Tooltip title="Bold" placement="top">
        <IconButton 
          size="small"
          onClick={() => handleFormatAction('bold')}
          sx={{ 
            '&:hover': { backgroundColor: '#f5f5f5' },
            color: '#424242'
          }}
        >
          <FormatBoldIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Italic */}
      <Tooltip title="Italic" placement="top">
        <IconButton 
          size="small"
          onClick={() => handleFormatAction('italic')}
          sx={{ 
            '&:hover': { backgroundColor: '#f5f5f5' },
            color: '#424242'
          }}
        >
          <FormatItalicIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Underline */}
      <Tooltip title="Underline" placement="top">
        <IconButton 
          size="small"
          onClick={() => handleFormatAction('underline')}
          sx={{ 
            '&:hover': { backgroundColor: '#f5f5f5' },
            color: '#424242'
          }}
        >
          <FormatUnderlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Divider */}
      <Box sx={{ width: 1, height: 24, backgroundColor: '#e0e0e0', mx: 0.5 }} />

      {/* Font Size */}
      <Tooltip title="Font Size" placement="top">
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value=""
            displayEmpty
            onChange={(e) => handleFormatAction('fontSize', e.target.value)}
            sx={{ 
              height: 32,
              '& .MuiSelect-select': { py: 0.5, px: 1 },
              fontSize: '0.75rem'
            }}
            IconComponent={FormatSizeIcon}
          >
            {fontSizes.map((size) => (
              <MenuItem key={size.value} value={size.value} sx={{ fontSize: '0.75rem' }}>
                {size.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Tooltip>

      {/* Font Family */}
      <Tooltip title="Font Family" placement="top">
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value=""
            displayEmpty
            onChange={(e) => handleFormatAction('fontFamily', e.target.value)}
            sx={{ 
              height: 32,
              '& .MuiSelect-select': { py: 0.5, px: 1 },
              fontSize: '0.75rem'
            }}
            IconComponent={FontDownloadIcon}
          >
            {fontFamilies.map((font) => (
              <MenuItem key={font.value} value={font.value} sx={{ fontSize: '0.75rem' }}>
                {font.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Tooltip>

      {/* Divider */}
      <Box sx={{ width: 1, height: 24, backgroundColor: '#e0e0e0', mx: 0.5 }} />

      {/* Color Picker */}
      <Tooltip title="Text Color" placement="top">
        <IconButton 
          size="small"
          onClick={(e) => setColorPickerAnchor(e.currentTarget)}
          sx={{ 
            '&:hover': { backgroundColor: '#f5f5f5' },
            color: '#424242'
          }}
        >
          <PaletteIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Color Picker Popover */}
      <Popover
        open={Boolean(colorPickerAnchor)}
        anchorEl={colorPickerAnchor}
        onClose={() => setColorPickerAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{ zIndex: 10000 }}
      >
        <Box sx={{ p: 2 }}>
          <HexColorPicker color={selectedColor} onChange={handleColorChange} />
        </Box>
      </Popover>
    </Box>
  );
});

FloatingToolbar.displayName = 'FloatingToolbar';

export default FloatingToolbar;
