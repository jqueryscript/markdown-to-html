document.addEventListener('DOMContentLoaded', () => {
  // --- Elements ---
  const htmlInput = document.getElementById('html-input');
  const markdownCode = document.getElementById('markdown-code');
  const copyMarkdownButton = document.getElementById('copy-markdown');
  const downloadMarkdownButton = document.getElementById('download-markdown');
  const dropArea = document.getElementById('drop-area');
  const fileUpload = document.getElementById('file-upload');

  // Settings elements
  const headingStyleSelect = document.getElementById('heading-style');
  const bulletStyleSelect = document.getElementById('bullet-style');
  const linkStyleSelect = document.getElementById('link-style');
  const boldStyleSelect = document.getElementById('bold-style');
  const italicStyleSelect = document.getElementById('italic-style');

  // --- Turndown Service Initialization ---

  // --- Core Functions ---
  const getTurndownOptions = () => {
    return {
      headingStyle: headingStyleSelect.value,
      bulletListMarker: bulletStyleSelect.value,
      linkStyle: linkStyleSelect.value,
      em: italicStyleSelect.value,
      strong: boldStyleSelect.value,
      codeBlockStyle: 'fenced'
    };
  };

  const convertHtmlToMarkdown = () => {
    const options = getTurndownOptions();
    const turndownService = new TurndownService(options);
    turndownService.use(turndownPluginGfm.gfm);

    const html = htmlInput.value || '';

    // --- HTML Cleaning Logic ---
    const cleanHtml = (htmlString) => {
        const allowedAttributes = ['href', 'src', 'alt', 'title', 'colspan', 'rowspan', 'class', 'id', 'target', 'start', 'align'];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;

        const allElements = tempDiv.getElementsByTagName('*');
        for (let i = 0; i < allElements.length; i++) {
            const element = allElements[i];
            const attributes = Array.from(element.attributes);
            for (const attribute of attributes) {
                if (!allowedAttributes.includes(attribute.name.toLowerCase())) {
                    element.removeAttribute(attribute.name);
                }
            }
        }
        return tempDiv.innerHTML;
    };

    const cleanedHtml = cleanHtml(html);
    const markdown = turndownService.turndown(cleanedHtml);
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

  // Settings listeners
  headingStyleSelect.addEventListener('change', convertHtmlToMarkdown);
  bulletStyleSelect.addEventListener('change', convertHtmlToMarkdown);
  linkStyleSelect.addEventListener('change', convertHtmlToMarkdown);
  boldStyleSelect.addEventListener('change', convertHtmlToMarkdown);
  italicStyleSelect.addEventListener('change', convertHtmlToMarkdown);

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
  const placeholderHtml = `<h1>Hello World</h1>\n\n<p>This is an example of <strong>HTML input</strong> that will be converted to <em>Markdown</em>.</p>\n\n<ul>\n  <li>Item 1</li>
  <li>Item 2</li>
</ul>`;
  htmlInput.value = placeholderHtml;
  convertHtmlToMarkdown();
});