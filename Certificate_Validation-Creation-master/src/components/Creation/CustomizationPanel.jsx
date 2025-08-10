import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FontOptions from './FontOptions';
import Slider from '@mui/material/Slider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { HexColorPicker } from 'react-colorful';
import { IconButton, Tooltip, Popover } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';

const CustomizationPanel = ({ onStyleChange, onBorderAdjust, selectedElement, elements, setElements }) => {
  const [borderScale, setBorderScale] = useState(1);
  const [borderFit, setBorderFit] = useState('cover');
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#000000');

  const selectedElementData = selectedElement ? elements[selectedElement] : null;

  useEffect(() => {
    if (selectedElementData) {
      setSelectedColor(selectedElementData.style.color || '#000000');
    }
  }, [selectedElementData]);

  const handleScaleChange = (e, value) => {
    setBorderScale(value);
    if (onBorderAdjust) onBorderAdjust({ scale: value, fit: borderFit });
  };

  const handleFitChange = (e) => {
    setBorderFit(e.target.value);
    if (onBorderAdjust) onBorderAdjust({ scale: borderScale, fit: e.target.value });
  };

  const handleElementStyleChange = (property, value) => {
    if (selectedElement && setElements) {
      setElements(prev => ({
        ...prev,
        [selectedElement]: {
          ...prev[selectedElement],
          style: {
            ...prev[selectedElement].style,
            [property]: value
          }
        }
      }));
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    handleElementStyleChange('color', color);
    setColorPickerAnchor(null);
  };

  const fontSizes = [
    { label: 'Small', value: 16 },
    { label: 'Normal', value: 20 },
    { label: 'Large', value: 28 },
    { label: 'Huge', value: 36 }
  ];

  const fontFamilies = [
    { label: 'Serif', value: 'Georgia, serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Times New Roman', value: 'Times New Roman, serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, sans-serif' },
    { label: 'Courier New', value: 'Courier New, monospace' }
  ];

  return (
    <Card sx={{ minWidth: 300, boxShadow: 3, maxHeight: '80vh', overflow: 'auto' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold' }}>
          Certificate Designer
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Selected Element Controls */}
          {selectedElement && selectedElementData && (
            <>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ color: '#424242' }}>
                  {selectedElement.charAt(0).toUpperCase() + selectedElement.slice(1)} Settings
                </Typography>
                
                {/* Font Size */}
                <Typography gutterBottom sx={{ fontSize: '0.9rem', color: '#616161' }}>
                  Font Size
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <Select
                    value={selectedElementData.style.fontSize || 20}
                    onChange={(e) => handleElementStyleChange('fontSize', e.target.value)}
                    sx={{ fontSize: '0.9rem' }}
                  >
                    {fontSizes.map((size) => (
                      <MenuItem key={size.value} value={size.value} sx={{ fontSize: '0.9rem' }}>
                        {size.label} ({size.value}px)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Font Family */}
                <Typography gutterBottom sx={{ fontSize: '0.9rem', color: '#616161' }}>
                  Font Family
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <Select
                    value={selectedElementData.style.fontFamily || 'Georgia, serif'}
                    onChange={(e) => handleElementStyleChange('fontFamily', e.target.value)}
                    sx={{ fontSize: '0.9rem' }}
                  >
                    {fontFamilies.map((font) => (
                      <MenuItem key={font.value} value={font.value} sx={{ fontSize: '0.9rem' }}>
                        {font.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Font Weight */}
                <Typography gutterBottom sx={{ fontSize: '0.9rem', color: '#616161' }}>
                  Font Weight
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <Select
                    value={selectedElementData.style.fontWeight || 'normal'}
                    onChange={(e) => handleElementStyleChange('fontWeight', e.target.value)}
                    sx={{ fontSize: '0.9rem' }}
                  >
                    <MenuItem value="normal" sx={{ fontSize: '0.9rem' }}>Normal</MenuItem>
                    <MenuItem value="bold" sx={{ fontSize: '0.9rem' }}>Bold</MenuItem>
                    <MenuItem value="300" sx={{ fontSize: '0.9rem' }}>Light</MenuItem>
                    <MenuItem value="500" sx={{ fontSize: '0.9rem' }}>Medium</MenuItem>
                    <MenuItem value="700" sx={{ fontSize: '0.9rem' }}>Bold</MenuItem>
                  </Select>
                </FormControl>

                {/* Text Color */}
                <Typography gutterBottom sx={{ fontSize: '0.9rem', color: '#616161' }}>
                  Text Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: selectedColor,
                      border: '2px solid #e0e0e0',
                      borderRadius: 1,
                      cursor: 'pointer'
                    }}
                    onClick={(e) => setColorPickerAnchor(e.currentTarget)}
                  />
                  <Tooltip title="Choose Color">
                    <IconButton 
                      onClick={(e) => setColorPickerAnchor(e.currentTarget)}
                      sx={{ color: '#424242' }}
                    >
                      <PaletteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Color Picker Popover */}
                <Popover
                  open={Boolean(colorPickerAnchor)}
                  anchorEl={colorPickerAnchor}
                  onClose={() => setColorPickerAnchor(null)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    <HexColorPicker color={selectedColor} onChange={handleColorChange} />
                  </Box>
                </Popover>
              </Box>
              
              <Divider />
            </>
          )}

          {/* Global Font Options */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#424242' }}>
              Global Font Settings
            </Typography>
            <FontOptions onStyleChange={onStyleChange} />
          </Box>

          <Divider />

          {/* Border Adjustments */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#424242' }}>
              Border Adjustments
            </Typography>
            <Typography gutterBottom sx={{ fontSize: '0.9rem', color: '#616161' }}>
              Scale
            </Typography>
            <Slider 
              min={0.5} 
              max={1.5} 
              step={0.01} 
              value={borderScale} 
              onChange={handleScaleChange} 
              aria-label="Border Scale"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth size="small">
              <InputLabel id="border-fit-label">Fit</InputLabel>
              <Select
                labelId="border-fit-label"
                value={borderFit}
                label="Fit"
                onChange={handleFitChange}
                sx={{ fontSize: '0.9rem' }}
              >
                <MenuItem value="cover" sx={{ fontSize: '0.9rem' }}>Cover</MenuItem>
                <MenuItem value="contain" sx={{ fontSize: '0.9rem' }}>Contain</MenuItem>
                <MenuItem value="fill" sx={{ fontSize: '0.9rem' }}>Fill</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Instructions */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#616161', fontSize: '0.8rem' }}>
              <strong>Tip:</strong> Click on any text element to customize it, or select text within an element to use the floating formatting toolbar.
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CustomizationPanel;
