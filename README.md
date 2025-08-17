# Markdown to HTML Converter

A free, privacy-first, real-time Markdown to HTML converter with advanced customization options. This tool is designed for content creators, developers, and anyone who needs to quickly and easily convert Markdown into clean, semantic HTML.

**Live Demo:** [**markdownhtmlgen.com**](https://www.markdownhtmlgen.com/)

## Features

- **Real-time Conversion:** Instantly see your Markdown rendered as HTML as you type.
- **Privacy First:** All processing happens in your browser. No data is ever sent to our servers.
- **File Upload:** Supports uploading .md files to convert to HTML code.
- **Smart Format Correction:** Automatically fixes non-standard lists from AI tools (e.g., those using `•` or `:`).
- **Advanced Customization:**
    - **Add Heading IDs:** Automatically generate `id` attributes for all headings (`<h1>`, `<h2>`, etc.) for easy deep-linking.
    - **Secure Links:** Automatically add `rel="noopener noreferrer"` to all external links for enhanced security.
    - **Remove Emojis:** Option to automatically strip all emojis for a clean, professional output.
- **Syntax Highlighting:** The generated HTML code is highlighted for readability.
- **Copy & Download:** Easily copy the generated HTML or download it as a complete `.html` file.
- **Responsive Design:** Fully responsive and works on all devices.

## Tech Stack

- **HTML5**
- **Tailwind CSS v4**
- **JavaScript (ES6+)**
- **Marked.js** for Markdown-to-HTML conversion.
- **Terser** for JavaScript minification.
- **PostCSS** with **cssnano** and **autoprefixer** for CSS processing and minification.

## Development

To run this project locally for development:

1.  **Clone the repository:**
    ```bash
    # Replace this with your actual repository URL
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install dependencies:**
    This project uses `npm` for package management.
    ```bash
    npm install
    ```

3.  **Build assets:**
    To compile and minify the CSS and JavaScript files, run the build script. I have also added a convenient `build` script that runs both commands.
    ```bash
    npm run build
    ```
    This will:
    -   Process `input.css` with Tailwind CSS and create the final `style.css`.
    -   Minify `script.js` into `script.min.js`.

4.  **Open in browser:**
    Simply open the `index.html` file in your web browser to use the application.

## Contributing

Contributions are welcome! If you have a feature request, bug report, or want to contribute to the code, please feel free to open an issue or submit a pull request.

## License

This project is open source and licensed under the [ISC License](https://opensource.org/licenses/ISC).
