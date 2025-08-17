document.addEventListener('DOMContentLoaded', () => {
  // --- Elements ---
  const htmlInput = document.getElementById('html-input');
  const markdownCode = document.getElementById('markdown-code');
  const copyMarkdownButton = document.getElementById('copy-markdown');
  const downloadMarkdownButton = document.getElementById('download-markdown');
  const dropArea = document.getElementById('drop-area');
  const fileUpload = document.getElementById('file-upload');

  // --- Turndown Service Initialization ---
  const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

  // --- Core Functions ---
  const convertHtmlToMarkdown = () => {
    const html = htmlInput.value || '';
    const markdown = turndownService.turndown(html);
    markdownCode.textContent = markdown;
  };

  const downloadFile = () => {
    const markdownContent = markdownCode.textContent;
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'converted.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- File Upload Logic ---
  const handleFiles = (files) => {
    const file = files[0];
    if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        htmlInput.value = e.target.result;
        convertHtmlToMarkdown();
        // Activate HTML tab
        document.querySelector('#input-tabs button[data-tab="html"]').click();
      };
      reader.onerror = () => {
        Toastify({ text: "Failed to read the file.", duration: 3000, gravity: "bottom", position: "center", style: { background: "#ef4444" } }).showToast();
      };
      reader.readAsText(file);
    } else if (file) {
      Toastify({ text: "Please select a valid .html or .htm file.", duration: 3000, gravity: "bottom", position: "center", style: { background: "#ef4444" } }).showToast();
    }
    fileUpload.value = null;
  };

  // --- Event Listeners ---
  htmlInput.addEventListener('input', convertHtmlToMarkdown);
  downloadMarkdownButton.addEventListener('click', downloadFile);

  copyMarkdownButton.addEventListener('click', () => {
    navigator.clipboard.writeText(markdownCode.textContent).then(() => {
      Toastify({ text: "Markdown code copied!", duration: 3000, gravity: "bottom", position: "center", style: { background: "#4f46e5" } }).showToast();
    }, () => {
      Toastify({ text: "Failed to copy.", duration: 3000, gravity: "bottom", position: "center", style: { background: "#ef4444" } }).showToast();
    });
  });

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

  fileUpload.addEventListener('change', (e) => {
    handleFiles(e.target.files);
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
          btn.classList.remove('tab-active');
          btn.classList.add('tab-inactive');
        });
        button.classList.add('tab-active');
        button.classList.remove('tab-inactive');

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

  // --- Initial State ---
  const placeholderHtml = `<h1>Hello World</h1>\n\n<p>This is an example of <strong>HTML input</strong> that will be converted to <em>Markdown</em>.</p>\n\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>`;
  htmlInput.value = placeholderHtml;
  convertHtmlToMarkdown();
});