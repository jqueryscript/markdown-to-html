document.addEventListener('DOMContentLoaded', () => {
  // --- Elements ---
  const markdownInput = document.getElementById('markdown-input');
  const plainCode = document.getElementById('plain-code');
  const preserveLineBreaksCheckbox = document.getElementById('preserve-line-breaks');
  const removeUrlsCheckbox = document.getElementById('remove-urls');
  const removeEmojisCheckbox = document.getElementById('remove-emojis');
  const normalizeWhitespaceCheckbox = document.getElementById('normalize-whitespace');
  const dropArea = document.getElementById('drop-area');
  const fileUpload = document.getElementById('file-upload');
  const copyPlainButton = document.getElementById('copy-plain');
  const downloadPlainButton = document.getElementById('download-plain');
  const sidebar = document.getElementById('sidebar');
  const menuButton = document.getElementById('menu-button');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
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

  // --- Core Functions ---
  let plainTextContent = ''; // Variable to hold the content for the download

  const markdownToPlainText = (text) => {
    if (!text) return '';

    // Remove headers (# ## ### etc.)
    text = text.replace(/^#{1,6}\s+/gm, '');

    // Remove bold and italics
    text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // **bold**
    text = text.replace(/__(.*?)__/g, '$1');     // __bold__
    text = text.replace(/\*(.*?)\*/g, '$1');      // *italic*
    text = text.replace(/_(.*?)_/g, '$1');        // _italic_

    // Remove inline code
    text = text.replace(/`(.*?)`/g, '$1');

    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, (match) => {
        return match.replace(/```\w*\n?/g, '').replace(/```/g, '');
    });

    // Remove links but keep text (optional URL removal handled separately)
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Remove images
    text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

    // Remove blockquotes
    text = text.replace(/^>\s+/gm, '');

    // Remove horizontal rules
    text = text.replace(/^[-*_]{3,}$/gm, '');

    // Remove list markers
    text = text.replace(/^[-*+]\s+/gm, '');      // Unordered lists
    text = text.replace(/^\d+\.\s+/gm, '');      // Ordered lists

    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, '');

    // Clean up extra spaces within lines (but preserve newlines)
    text = text.replace(/[ \t]+/g, ' '); // Replace tabs and multiple spaces with single space
    text = text.replace(/\[([^\]]+)\]\s*\([^)]*\)/g, '$1'); // Clean any remaining markdown links

    return text.trim();
  };

  const removeUrls = (text) => {
    // Remove URLs from text (both standalone and in markdown links)
    text = text.replace(/https?:\/\/[^\s]+/g, '');
    text = text.replace(/www\.[^\s]+/g, '');
    return text.trim();
  };

  const removeEmojis = (text) => {
    // Remove emoji characters
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    return text.replace(emojiRegex, '');
  };

  const normalizeWhitespace = (text) => {
    // Remove leading/trailing whitespace from lines
    text = text.split('\n').map(line => line.trim()).join('\n');
    // Remove multiple empty lines (more than 2 consecutive newlines)
    text = text.replace(/\n{3,}/g, '\n\n');
    // Remove trailing whitespace
    text = text.trim();
    return text;
  };

  const convertMarkdownToPlainText = () => {
    let markdownText = markdownInput.value || '';
    let plainText = markdownText;

    // Convert markdown to plain text
    plainText = markdownToPlainText(plainText);

    // Apply settings
    if (removeUrlsCheckbox.checked) {
      plainText = removeUrls(plainText);
    }

    if (removeEmojisCheckbox.checked) {
      plainText = removeEmojis(plainText);
    }

    if (normalizeWhitespaceCheckbox.checked) {
      plainText = normalizeWhitespace(plainText);
    }

    if (!preserveLineBreaksCheckbox.checked) {
      plainText = plainText.replace(/\n\n+/g, '\n\n'); // Normalize multiple newlines
    }

    // Update the code view
    plainCode.textContent = plainText;
    plainTextContent = plainText;
  };

  const downloadFile = () => {
    const blob = new Blob([plainTextContent], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'plain-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- Event Listeners ---
  markdownInput.addEventListener('input', convertMarkdownToPlainText);
  preserveLineBreaksCheckbox.addEventListener('change', convertMarkdownToPlainText);
  removeUrlsCheckbox.addEventListener('change', convertMarkdownToPlainText);
  removeEmojisCheckbox.addEventListener('change', convertMarkdownToPlainText);
  normalizeWhitespaceCheckbox.addEventListener('change', convertMarkdownToPlainText);
  downloadPlainButton.addEventListener('click', downloadFile);

  // --- File Upload Logic ---
  const handleFiles = (files) => {
    const file = files[0];
    if (file && file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        markdownInput.value = e.target.result;
        convertMarkdownToPlainText();
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

  copyPlainButton.addEventListener('click', () => {
    navigator.clipboard.writeText(plainCode.textContent).then(() => {
      Toastify({ text: "Text copied!", duration: 3000, gravity: "bottom", position: "center", style: { background: "#4f46e5" } }).showToast();
    }, () => {
      Toastify({ text: "Failed to copy.", duration: 3000, gravity: "bottom", position: "center", style: { background: "#ef4444" } }).showToast();
    });
  });

  // --- UI Logic: Select all on Ctrl+A in plain text block ---
  plainCode.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      const range = document.createRange();
      range.selectNodeContents(plainCode);
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
  convertMarkdownToPlainText();
});