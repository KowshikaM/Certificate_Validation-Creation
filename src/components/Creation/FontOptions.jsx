import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { HexColorPicker } from 'react-colorful';

const fontFamilies = [
  'Roboto',
  'serif',
  'sans-serif',
  'cursive',
  'monospace',
  'fantasy',
  'Arial',
  'Georgia',
  'Times New Roman',
  'Comic Sans MS',
  'Trebuchet MS',
  'Verdana',
];

const fontWeights = [
  { label: 'Light', value: 300 },
  { label: 'Regular', value: 400 },
  { label: 'Bold', value: 700 },
];

const FontOptions = ({ onStyleChange }) => {
  const [fontSize, setFontSize] = useState(28);
  const [color, setColor] = useState('#222');
  const [fontFamily, setFontFamily] = useState('Roboto');
  const [fontWeight, setFontWeight] = useState(400);
  const [fontStyle, setFontStyle] = useState('normal');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleFontSize = (e, value) => {
    setFontSize(value);
    onStyleChange({ fontSize: value });
  };
  const handleColor = (newColor) => {
    setColor(newColor);
    onStyleChange({ color: newColor });
  };
  const handleFontFamily = (e) => {
    setFontFamily(e.target.value);
    onStyleChange({ fontFamily: e.target.value });
  };
  const handleFontWeight = (e) => {
    setFontWeight(e.target.value);
    onStyleChange({ fontWeight: e.target.value });
  };
  const handleFontStyle = (e, newStyle) => {
    setFontStyle(newStyle);
    onStyleChange({ fontStyle: newStyle });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Font Options</Typography>
      <FormControl fullWidth>
        <InputLabel>Font Family</InputLabel>
        <Select value={fontFamily} label="Font Family" onChange={handleFontFamily}>
          {fontFamilies.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Font Weight</InputLabel>
        <Select value={fontWeight} label="Font Weight" onChange={handleFontWeight}>
          {fontWeights.map(w => <MenuItem key={w.value} value={w.value}>{w.label}</MenuItem>)}
        </Select>
      </FormControl>
      <ToggleButtonGroup
        value={fontStyle}
        exclusive
        onChange={handleFontStyle}
        aria-label="font style"
        sx={{ mb: 1 }}
      >
        <ToggleButton value="normal" aria-label="normal">Normal</ToggleButton>
        <ToggleButton value="italic" aria-label="italic">Italic</ToggleButton>
        <ToggleButton value="underline" aria-label="underline">Underline</ToggleButton>
      </ToggleButtonGroup>
      <Box>
        <Typography gutterBottom>Font Size</Typography>
        <Slider
          value={fontSize}
          min={12}
          max={60}
          step={1}
          onChange={handleFontSize}
          valueLabelDisplay="auto"
        />
      </Box>
      <Box>
        <Typography gutterBottom>Font Color</Typography>
        <Button variant="outlined" onClick={() => setShowColorPicker(!showColorPicker)}>
          Pick Color
        </Button>
        {showColorPicker && (
          <Box sx={{ mt: 1 }}>
            <HexColorPicker color={color} onChange={handleColor} />
            <Box sx={{ mt: 1, width: 40, height: 40, background: color, border: '1px solid #ccc' }} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FontOptions;
