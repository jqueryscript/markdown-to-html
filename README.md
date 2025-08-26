# Markdown Tools

**Live Website:** [https://www.markdownhtmlgen.com/](https://www.markdownhtmlgen.com/)

A comprehensive suite of privacy-first Markdown utilities with unified branding and seamless navigation. Convert between Markdown and HTML, edit with WYSIWYG features, and process all content client-side for maximum privacy.

## 🚀 Features

### Core Tools
- **[Markdown to HTML Converter](https://www.markdownhtmlgen.com/)** - Convert Markdown to clean, semantic HTML with real-time preview
- **[HTML to Markdown Converter](https://www.markdownhtmlgen.com/html-to-markdown-converter/)** - Reverse conversion from HTML back to Markdown format
- **[WYSIWYG Markdown Editor](https://www.markdownhtmlgen.com/markdown-editor/)** - Real-time WYSIWYG editor using OverType library for perfect character alignment

### Key Features
- ✅ **Privacy-First**: All processing done client-side, no server uploads
- ✅ **Real-time Preview**: Live conversion and preview for all tools
- ✅ **File Upload Support**: Drag & drop .md and .html files
- ✅ **Mobile Responsive**: Complete mobile navigation with sidebar menu
- ✅ **Unified Navigation**: Seamless switching between all tools
- ✅ **AI Content Friendly**: Optimized output for AI content workflows
- ✅ **Theme Support**: Light/dark themes for WYSIWYG editor
- ✅ **Export Functions**: Download results as files

## 🛠️ Technologies Used

- **Frontend**: Vanilla JavaScript with ES6+ features
- **Styling**: Tailwind CSS v4 with PostCSS processing  
- **Markdown Processing**: Marked.js library
- **HTML to Markdown**: Turndown.js library
- **WYSIWYG Editor**: OverType.js library (invisible textarea overlay)
- **Build Tools**: PostCSS, Terser for minification

## 📁 Project Structure

```
├── index.html                     # Main Markdown to HTML converter
├── script.js                      # Main converter logic with mobile menu
├── input.css                      # Tailwind CSS source
├── style.css                      # Generated CSS (built from input.css)
├── package.json                   # Dependencies and build scripts
├── postcss.config.js              # PostCSS configuration
├── html-to-markdown-converter/
│   ├── index.html                 # HTML to Markdown converter
│   └── script.js                  # Conversion logic using Turndown
├── markdown-editor/
│   ├── index.html                 # WYSIWYG Markdown Editor
│   └── overtype-main/             # OverType library files
│       ├── dist/overtype.min.js
│       ├── README.md
│       └── demo.html
└── markdown-to-pdf-converter/     # [DISABLED - has bugs]
    ├── index.html                 
    └── script.js                  
```

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js and npm installed on your system.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jqueryscript/markdown-to-html.git
   cd markdown-to-html
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Development Commands

```bash
# Build CSS from Tailwind source
npm run build:css

# Build JavaScript (minify)
npm run build:js

# Build both CSS and JavaScript
npm run build
```

### Running the Project

This is a static website. You can:

1. **Open directly in browser**: Open `index.html` to access the main converter
2. **Use a local server** (recommended for development):
   ```bash
   # Install live-server globally
   npm install -g live-server
   
   # Run from project root
   live-server
   ```

### Navigation Structure

```
Markdown Tools (Brand)
├── Markdown to HTML (/)
├── HTML to Markdown (/html-to-markdown-converter/)
├── WYSIWYG Editor (/markdown-editor/)
└── Markdown Guide (#markdown anchor)
```

## 🎨 Architecture & Design

### Unified Branding
- **Brand Name**: "Markdown Tools" across all pages
- **Consistent Navigation**: Cross-page links and mobile sidebar
- **Mobile-First**: Responsive design with hamburger menu
- **SEO Optimized**: Structured data and proper internal linking

### WYSIWYG Editor Implementation
```javascript
// OverType library integration pattern
const OT = window.OverType.default || window.OverType;
const [editor] = new OT('#editor-container', {
    value: 'initial content',
    toolbar: true,
    showStats: true,
    theme: 'solar' // or 'cave'
});
```

### Key Features
- **Perfect WYSIWYG Alignment**: Invisible textarea overlay technique
- **Smart Lists**: Automatic list continuation and numbering
- **Keyboard Shortcuts**: Ctrl+B (bold), Ctrl+I (italic), etc.
- **Export Functions**: Download as Markdown or HTML

## 🔧 Development Notes

- **CSS Processing**: Always run `npm run build:css` after modifying `input.css`
- **JavaScript**: Modular structure with respective `script.js` files
- **OverType Library**: Located in `/markdown-editor/overtype-main/dist/`
- **Mobile Menu**: JavaScript functionality for sidebar toggle
- **Cross-Page Links**: Use relative paths for proper navigation
- **Browser Support**: Modern browsers only (ES6+, no IE support)

## 🚀 Deployment

Static site deployment - upload all files to any web server. Ensure:

- ✅ `style.css` is built and up-to-date
- ✅ All converter pages maintain directory structure  
- ✅ OverType library files are included
- ✅ External CDN dependencies are accessible
- ✅ Cross-page navigation links work properly

## 🐛 Known Issues

- **Markdown to PDF**: Tool has bugs and is currently disabled/excluded from navigation
- **OverType Constructor**: Must use `window.OverType.default || window.OverType` pattern  
- **Mobile Menu**: Requires JavaScript for sidebar toggle functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Created by [jQueryScript](https://www.jqueryscript.net)** | **© 2025 markdownhtmlgen.com**