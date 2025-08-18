# Markdown Toolset
**Live Website:** [https://www.markdownhtmlgen.com/](https://www.markdownhtmlgen.com/)

Welcome to the Markdown Toolset, an online platform offering convenient conversion tools between Markdown and HTML. This project is designed to be visually and structurally consistent across all its pages, providing a seamless user experience.

## Features

*   **Markdown to HTML Converter:** Easily convert your Markdown text into HTML. This is the primary tool accessible from the homepage.
*   **HTML to Markdown Converter:** Convert HTML content back into Markdown format. This tool is located in a dedicated subdirectory.
*   **Privacy Policy Page:** A dedicated page outlining the privacy policy for the website.
*   **Terms and Conditions Page:** A dedicated page detailing the terms and conditions of using the website.

## Technologies Used

*   **HTML:** For structuring the web content.
*   **JavaScript:** For interactive functionalities and conversion logic.
*   **Tailwind CSS v4:** For a modern, consistent, and responsive design across all pages.
*   **PostCSS:** For processing CSS with Tailwind CSS.

## Getting Started

To set up and run this project locally, follow these steps:

### Prerequisites

Ensure you have Node.js and npm (Node Package Manager) installed on your system.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/markdown-toolset.git
    cd markdown-toolset
    ```
    *(Note: Replace `https://github.com/your-username/markdown-toolset.git` with the actual repository URL once it's pushed to GitHub.)*

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Building CSS

This project uses Tailwind CSS. You need to build the CSS file after making any changes to the Tailwind configuration or if you're setting up the project for the first time.

```bash
npm run build:css
```
This command will generate the `style.css` file in the root directory, which is used by all pages.

### Running the Project

This is a static website. You can open the `index.html` file directly in your web browser to access the Markdown to HTML converter.

To access the HTML to Markdown converter, navigate to `html-to-markdown-converter/index.html` in your browser.

For local development with a live server (recommended), you can use a tool like `live-server` or any other local web server.

```bash
# Install live-server globally (if you don't have it)
npm install -g live-server

# Run live-server from the project root
live-server
```

## Project Structure

```
.
├── index.html                  # Main Markdown to HTML converter page
├── script.js                   # JavaScript for Markdown to HTML converter
├── input.css                   # Tailwind CSS source file
├── style.css                   # Generated CSS file (after running build:css)
├── privacy.html                # Privacy Policy page
├── terms.html                  # Terms and Conditions page
├── package.json                # Project dependencies and scripts
├── postcss.config.js           # PostCSS configuration for Tailwind CSS
├── html-to-markdown-converter/
│   ├── index.html              # HTML to Markdown converter page
│   └── script.js               # JavaScript for HTML to Markdown converter
└── ... (other project files like .gitignore, CNAME, etc.)
```

## Contributing

If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## License

This project is open source and available under the [MIT License](LICENSE).
*(Note: You might need to create a LICENSE file if you don't have one.)*

---