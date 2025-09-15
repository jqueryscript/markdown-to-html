document.addEventListener('DOMContentLoaded', () => {
  // --- Elements ---
  const markdownInput = document.getElementById('markdown-input');
  const htmlPreview = document.getElementById('html-preview');
  const htmlCode = document.getElementById('html-code');
  const removeEmojisCheckbox = document.getElementById('remove-emojis');
  const addHeadingIdsCheckbox = document.getElementById('add-heading-ids');
  const addRelToLinksCheckbox = document.getElementById('add-rel-to-links');
  const sanitizeHtmlCheckbox = document.getElementById('sanitize-html');
  const escapeHtmlCharsCheckbox = document.getElementById('escape-html-chars');
  const dropArea = document.getElementById('drop-area');
  const fileUpload = document.getElementById('file-upload');
  const copyHtmlButton = document.getElementById('copy-html');
  const downloadHtmlButton = document.getElementById('download-html');
  const sidebar = document.getElementById('sidebar');
  const menuButton = document.getElementById('menu-button');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const cssInput = document.getElementById('css-input');
  const toolsDropdown = document.getElementById("tools-dropdown");
  const toolsDropdownMenu = document.getElementById("tools-dropdown-menu");
  const mobileToolsButton = document.getElementById("mobile-tools-button");
  const mobileToolsMenu = document.getElementById("mobile-tools-menu");
  const mobileToolsArrow = document.getElementById("mobile-tools-arrow");

  // --- UI Logic: Mobile Sidebar ---
  const toggleSidebar = () => {
    sidebar.classList.toggle('-translate-x-full');
    sidebarOverlay.classList.toggle('hidden');
  };

  if (menuButton) {
    menuButton.addEventListener('click', toggleSidebar);
  }
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', toggleSidebar);
  }

  // Desktop Dropdown Logic (Hover with timeout)
  let hideTimeout;
  if (toolsDropdown && toolsDropdownMenu) {
      const showMenu = () => {
          clearTimeout(hideTimeout);
          toolsDropdownMenu.classList.remove("hidden");
      };

      const startHideTimer = () => {
          hideTimeout = setTimeout(() => {
              toolsDropdownMenu.classList.add("hidden");
          }, 200);
      };

      toolsDropdown.addEventListener("mouseenter", showMenu);
      toolsDropdown.addEventListener("mouseleave", startHideTimer);
  }

  // Mobile Accordion Logic
  if (mobileToolsButton && mobileToolsMenu && mobileToolsArrow) {
      mobileToolsButton.addEventListener("click", () => {
          mobileToolsMenu.classList.toggle("hidden");
          mobileToolsArrow.classList.toggle("rotate-180");
      });
  }

  // --- Marked.js Configuration ---
  // Custom Renderer to add IDs to headings
  const customRenderer = new marked.Renderer();
  customRenderer.heading = (headingToken, level, raw) => {
    const headingText = headingToken.text;
    const headingLevel = headingToken.depth;

    // Robust slugification
    let id = headingText
      .toLowerCase()
      .trim()
      // Replace spaces and special characters with a hyphen
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      // Replace multiple hyphens with a single one
      .replace(/-+/g, '-')
      // Trim leading/trailing hyphens
      .replace(/^-+|-+$/g, '');

    // Fallback for empty IDs (e.g., if the heading was only symbols)
    if (!id) {
      id = `section-${Math.random().toString(36).substring(2, 9)}`;
    }

    if (addHeadingIdsCheckbox.checked) {
      return `<h${headingLevel} id="${id}">${headingText}</h${headingLevel}>\n`;
    } else {
      return `<h${headingLevel}>${headingText}</h${headingLevel}>\n`;
    }
  };

  customRenderer.link = (linkToken, title, text) => {
    const href = linkToken.href;
    const linkTitle = linkToken.title;
    const linkText = linkToken.text;

    let out = `<a href="${href}"`;
    if (linkTitle) {
      out += ` title="${linkTitle}"`;
    }
    if (addRelToLinksCheckbox.checked) {
      out += ` rel="noopener noreferrer"`;
    }
    out += `>${linkText}</a>`;
    return out;
  };

  const markedInstance = new marked.Marked({
    renderer: customRenderer,
    pedantic: false, gfm: true, breaks: true, sanitize: false,
    smartLists: true, smartypants: false, xhtml: false
  });

  // --- Core Functions ---
  let fullHtmlContent = ''; // Variable to hold the content for the download

  const convertMarkdown = () => {
    let markdownText = markdownInput.value || '';

    // Convert non-standard list markers (e.g., from AI tools) to standard Markdown
    markdownText = markdownText.replace(/^\s*•/gm, '-')
                               .replace(/^\s*:/gm, '-');

    // Remove Emojis logic
    if (removeEmojisCheckbox.checked) {
      markdownText = markdownText.replace(/\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/g, '');
    }

    // Escape HTML special chars if the option is checked
    if (escapeHtmlCharsCheckbox.checked) {
      markdownText = markdownText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    let html = markedInstance.parse(markdownText);

    // Sanitize HTML if the option is checked
    if (sanitizeHtmlCheckbox.checked) {
      html = DOMPurify.sanitize(html);
    }

    // Update the code view
    htmlCode.textContent = html;

    // Prepare the full HTML for the iframe and download
    const customCss = cssInput.value;
    // Use the correct stylesheet version
    const proseCssLink = '<link rel="stylesheet" href="style.css?v5">'; 

    fullHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HTML Preview</title>
  ${proseCssLink}
  <style>
    body { padding: 1.5rem; } /* Add some padding to the iframe body */
    ${customCss}
  </style>
</head>
<body class="prose max-w-none">
  ${html}
</body>
</html>`;

    // Write to the iframe
    const iframeDoc = htmlPreview.contentDocument || htmlPreview.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(fullHtmlContent);
    iframeDoc.close();
  };

  const downloadFile = () => {
    const blob = new Blob([fullHtmlContent], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'markdown-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- Event Listeners ---
  markdownInput.addEventListener('input', convertMarkdown);
  removeEmojisCheckbox.addEventListener('change', convertMarkdown);
  addHeadingIdsCheckbox.addEventListener('change', convertMarkdown);
  addRelToLinksCheckbox.addEventListener('change', convertMarkdown);
  sanitizeHtmlCheckbox.addEventListener('change', convertMarkdown);
  escapeHtmlCharsCheckbox.addEventListener('change', convertMarkdown);
  downloadHtmlButton.addEventListener('click', downloadFile);
  cssInput.addEventListener('input', convertMarkdown);

  // --- File Upload Logic ---
  const handleFiles = (files) => {
    const file = files[0];
    if (file && file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        markdownInput.value = e.target.result;
        convertMarkdown();
        // Activate Markdown tab
        document.querySelector('#input-tabs button[data-tab="markdown"]').click();
      };
      reader.readAsText(file);
    }
  };

  dropArea.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dropArea.classList.add('bg-gray-200');
  });

  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('bg-gray-200');
  });

  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('bg-gray-200');
    handleFiles(e.dataTransfer.files);
  });

  dropArea.addEventListener('click', () => fileUpload.click());

  fileUpload.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });

  copyHtmlButton.addEventListener('click', () => {
    navigator.clipboard.writeText(htmlCode.textContent).then(() => {
      Toastify({ text: "HTML code copied!", duration: 3000, gravity: "bottom", position: "center", style: { background: "#4f46e5" } }).showToast();
    }, () => {
      Toastify({ text: "Failed to copy.", duration: 3000, gravity: "bottom", position: "center", style: { background: "#ef4444" } }).showToast();
    });
  });

  // --- UI Logic: Select all on Ctrl+A in HTML code block ---
  htmlCode.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      const range = document.createRange();
      range.selectNodeContents(htmlCode);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });

  // --- UI Logic: Tabs ---
  const setupTabs = (tabContainerId) => {
    const tabContainer = document.getElementById(tabContainerId);
    const tabButtons = tabContainer.querySelectorAll('.tab-btn');
    const contentContainer = tabContainer.parentElement.nextElementSibling;

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.dataset.tab;

        tabButtons.forEach(btn => {
          btn.classList.remove('tab-active', 'text-indigo-600');
          btn.classList.add('tab-inactive', 'text-gray-500');
        });
        button.classList.add('tab-active', 'text-indigo-600');
        button.classList.remove('tab-inactive', 'text-gray-500');

        Array.from(contentContainer.children).forEach(pane => {
          if (pane.id.endsWith(tabId)) {
            pane.classList.remove('hidden');
          } else {
            pane.classList.add('hidden');
          }
        });
      });
    });
  };

  setupTabs('input-tabs');
  setupTabs('output-tabs');

  // --- UI Logic: FAQ Accordion ---
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const answer = button.nextElementSibling;
      const isOpen = button.parentElement.classList.contains('open');
      const allItems = document.querySelectorAll('.faq-item');

      // Close all other items
      allItems.forEach(item => {
        if (item !== button.parentElement) {
          item.classList.remove('open');
          item.querySelector('.faq-answer').style.maxHeight = null;
          item.querySelector('.faq-icon-plus').classList.remove('hidden');
          item.querySelector('.faq-icon-minus').classList.add('hidden');
        }
      });

      // Toggle current item
      if (isOpen) {
        button.parentElement.classList.remove('open');
        answer.style.maxHeight = null;
        button.querySelector('.faq-icon-plus').classList.remove('hidden');
        button.querySelector('.faq-icon-minus').classList.add('hidden');
      } else {
        button.parentElement.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        button.querySelector('.faq-icon-plus').classList.add('hidden');
        button.querySelector('.faq-icon-minus').classList.remove('hidden');
      }
    });
  });

  // --- Initial State ---
  convertMarkdown();
});
