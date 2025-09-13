# Certificate Generator

A professional React-based certificate generator with advanced text editing and formatting capabilities.

## Features

### 🎨 Professional Certificate Design
- Clean, modern certificate template
- Professional typography with Georgia serif fonts
- Responsive design that works on all screen sizes
- Beautiful gradient background

### ✏️ Advanced Text Editing
- **Inline Editing**: Click on any text element to edit directly
- **Draggable Elements**: Drag text blocks to any position on the certificate
- **Smart Positioning**: Text elements are intelligently positioned for optimal layout

### 🎯 Floating Formatting Toolbar
- **Text Selection**: Select any word or text portion to activate the toolbar
- **Formatting Options**:
  - **Bold, Italic, Underline**: Basic text formatting
  - **Font Size**: Small, Normal, Large, Huge options
  - **Font Family**: Serif, Arial, Times New Roman, Georgia, Verdana, Helvetica, Courier New
  - **Text Color**: Full color picker with hex color support
- **Smart Positioning**: Toolbar appears near selected text, just like Microsoft Word

### 🎛️ Customization Panel
- **Element Selection**: Click on any text element to customize it
- **Individual Styling**: Each text element can have its own font, size, color, and weight
- **Global Settings**: Apply styles to all elements at once
- **Border Adjustments**: Scale and fit border images
- **Real-time Preview**: See changes instantly

### 📱 Responsive Design
- Works beautifully on desktop screens
- Optimized layout for different screen sizes
- Touch-friendly interface

## Usage Instructions

### Basic Editing
1. **Edit Text**: Click on any text element and type to change the content
2. **Move Elements**: Drag text blocks to reposition them on the certificate
3. **Select Elements**: Click on a text element to select it for customization

### Advanced Formatting
1. **Select Text**: Highlight any word or text portion within an element
2. **Use Toolbar**: The floating toolbar will appear with formatting options
3. **Apply Styles**: Click on formatting buttons or use dropdowns to style text
4. **Color Picker**: Click the color icon to open a full color picker

### Customization Panel
1. **Select Element**: Click on any text element to select it
2. **Adjust Settings**: Use the panel on the right to modify:
   - Font size
   - Font family
   - Font weight
   - Text color
3. **Global Settings**: Use the global font settings to apply to all elements
4. **Border Settings**: Adjust border scale and fit options

## Technical Features

- **React 18**: Modern React with hooks
- **Material-UI**: Professional UI components
- **react-draggable**: Smooth drag and drop functionality
- **react-contenteditable**: Inline text editing
- **react-colorful**: Advanced color picker
- **CSS3**: Modern styling with gradients and animations

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Navigate to the certificate creation page:
   ```
   http://localhost:3000/creation/preview
   ```

## File Structure

```
src/components/Creation/
├── CertificatePreview.jsx    # Main certificate component
├── FloatingToolbar.jsx       # Text formatting toolbar
├── CustomizationPanel.jsx    # Element customization panel
├── CertificatePreview.css    # Professional styling
└── ...                       # Other supporting components
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance

- Optimized with React hooks and callbacks
- Efficient re-rendering
- Smooth animations and transitions
- Responsive design for all screen sizes

## License

This project is licensed under the ISC License. 

## Steganographic SHA embedding (PNG certificates)

When generating a PNG certificate via the backend endpoint `/generate_png`, the server computes `sha256(username_string).hexdigest()` (lowercase hex; we use the recipient name as `username_string`). This SHA string is embedded into the resulting PNG using least significant bit (LSB) steganography:

- A 32-bit big-endian length header precedes the payload
- The payload is the ASCII bytes of the SHA hex string
- We use 1 bit from each R, G, B channel in raster order (3 bits per pixel)
- The image is saved losslessly as PNG so the embedded bits are preserved

Utility functions live in `backend/stego_lsb.py`:

- `embed_message(input_png_path, output_png_path, message: str)`
- `extract_message(input_png_path) -> str`

To test extraction locally:

```python
from backend.stego_lsb import extract_message
print(extract_message('path/to/certificate.png'))
```