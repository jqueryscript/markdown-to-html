document.addEventListener('DOMContentLoaded', () => {
  const markdownInput = document.getElementById('markdown-input');
  const mediumPreview = document.getElementById('medium-preview');
  const mediumTitle = document.getElementById('medium-title');
  const wordCount = document.getElementById('word-count');
  const readingTime = document.getElementById('reading-time');
  const extractTitleCheckbox = document.getElementById('extract-title');
  const convertTablesCheckbox = document.getElementById('convert-tables');
  const cleanHtmlCheckbox = document.getElementById('clean-html');
  const appendSourceCheckbox = document.getElementById('append-source');
  const sourceUrlInput = document.getElementById('source-url');
  const copyTitleButton = document.getElementById('copy-title');
  const copyRichButton = document.getElementById('copy-rich');
  const copyPlainButton = document.getElementById('copy-plain');
  const downloadHtmlButton = document.getElementById('download-html');
  const dropArea = document.getElementById('drop-area');
  const fileUpload = document.getElementById('file-upload');
  const sidebar = document.getElementById('sidebar');
  const menuButton = document.getElementById('menu-button');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const toolsDropdown = document.getElementById('tools-dropdown');
  const toolsDropdownMenu = document.getElementById('tools-dropdown-menu');
  const mobileToolsButton = document.getElementById('mobile-tools-button');
  const mobileToolsMenu = document.getElementById('mobile-tools-menu');
  const mobileToolsArrow = document.getElementById('mobile-tools-arrow');

  const sampleMarkdown = `# Sample Article Title

This is a short Markdown draft you can use to test the Medium formatter. Replace this text with your own article before copying the rich text into Medium.

## Section Heading

Use headings to organize your article into clear sections. Keep paragraphs focused so they are easy to review before publishing.

| Item | Description | Notes |
| --- | --- | --- |
| First item | Example description | Add useful context |
| Second item | Another description | Keep it concise |

## Publishing Checklist

1. Draft the article in Markdown.
2. Convert it with this tool.
3. Copy the title and rich text into Medium.
4. Check links, images, embeds, and final spacing before publishing.

> Use blockquotes for notes, excerpts, or short highlighted ideas.

\`\`\`text
Markdown in. Rich text out.
\`\`\`

Add a source link if this Medium post is based on a longer article from your own site.`;

  let mediumBodyHtml = '';
  let mediumPlainText = '';

  const showToast = (text, isError = false) => {
    if (window.Toastify) {
      Toastify({
        text,
        duration: 2600,
        gravity: 'bottom',
        position: 'center',
        style: { background: isError ? '#ef4444' : '#4f46e5' }
      }).showToast();
    }
  };

  const toggleSidebar = () => {
    if (!sidebar || !sidebarOverlay) return;
    sidebar.classList.toggle('-translate-x-full');
    sidebarOverlay.classList.toggle('hidden');
  };

  if (menuButton) menuButton.addEventListener('click', toggleSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

  let hideTimeout;
  if (toolsDropdown && toolsDropdownMenu) {
    const showMenu = () => {
      clearTimeout(hideTimeout);
      toolsDropdownMenu.classList.remove('hidden');
    };
    const startHideTimer = () => {
      hideTimeout = setTimeout(() => {
        toolsDropdownMenu.classList.add('hidden');
      }, 200);
    };
    toolsDropdown.addEventListener('mouseenter', showMenu);
    toolsDropdown.addEventListener('mouseleave', startHideTimer);
  }

  if (mobileToolsButton && mobileToolsMenu && mobileToolsArrow) {
    mobileToolsButton.addEventListener('click', () => {
      mobileToolsMenu.classList.toggle('hidden');
      mobileToolsArrow.classList.toggle('rotate-180');
    });
  }

  const setupTabs = (tabContainerId) => {
    const tabContainer = document.getElementById(tabContainerId);
    if (!tabContainer) return;

    const tabButtons = tabContainer.querySelectorAll('.tab-btn');
    const contentContainer = tabContainer.parentElement.nextElementSibling;

    tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const tabId = button.dataset.tab;

        tabButtons.forEach((btn) => {
          btn.classList.remove('tab-active', 'text-indigo-600');
          btn.classList.add('tab-inactive', 'text-gray-500');
        });
        button.classList.add('tab-active', 'text-indigo-600');
        button.classList.remove('tab-inactive', 'text-gray-500');

        Array.from(contentContainer.children).forEach((pane) => {
          pane.classList.toggle('hidden', !pane.id.endsWith(tabId));
        });
      });
    });
  };

  const escapeHtml = (value) => {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const isSafeUrl = (url) => {
    if (!url) return false;
    const trimmedUrl = url.trim();
    return /^(https?:|mailto:|\/|#)/i.test(trimmedUrl);
  };

  const parseMarkdown = (markdown) => {
    if (window.marked && typeof window.marked.Marked === 'function') {
      const markedInstance = new window.marked.Marked({
        gfm: true,
        breaks: false,
        pedantic: false,
        smartypants: false
      });
      return markedInstance.parse(markdown);
    }

    if (window.marked && typeof window.marked.parse === 'function') {
      return window.marked.parse(markdown, { gfm: true, breaks: false });
    }

    return `<p>${escapeHtml(markdown).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
  };

  const convertTableToList = (table) => {
    const rows = Array.from(table.querySelectorAll('tr')).map((row) => {
      return Array.from(row.children).map((cell) => cell.textContent.trim());
    }).filter((row) => row.some(Boolean));

    const list = document.createElement('ul');
    if (!rows.length) return list;

    const headers = rows[0];
    const bodyRows = rows.length > 1 ? rows.slice(1) : rows;

    bodyRows.forEach((row) => {
      const item = document.createElement('li');
      if (headers.length && rows.length > 1) {
        item.innerHTML = row.map((value, index) => {
          const label = headers[index] || `Column ${index + 1}`;
          return `<strong>${escapeHtml(label)}:</strong> ${escapeHtml(value || '-')}`;
        }).join('<br>');
      } else {
        item.textContent = row.join(' - ');
      }
      list.appendChild(item);
    });

    return list;
  };

  const convertTables = (root) => {
    root.querySelectorAll('table').forEach((table) => {
      table.replaceWith(convertTableToList(table));
    });
  };

  const cleanNode = (node, options) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent);
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return document.createDocumentFragment();
    }

    const sourceTag = node.tagName.toLowerCase();
    if (['script', 'style', 'iframe', 'object', 'embed', 'form', 'button', 'textarea', 'select'].includes(sourceTag)) {
      return document.createDocumentFragment();
    }

    if (sourceTag === 'input') {
      const type = (node.getAttribute('type') || '').toLowerCase();
      if (type === 'checkbox') {
        return document.createTextNode(node.checked ? '[x] ' : '[ ] ');
      }
      return document.createDocumentFragment();
    }

    const allowedTags = new Set([
      'p', 'br', 'strong', 'b', 'em', 'i', 'a', 'ul', 'ol', 'li', 'blockquote',
      'pre', 'code', 'h1', 'h2', 'h3', 'h4', 'hr', 'img'
    ]);

    if (!allowedTags.has(sourceTag)) {
      const fragment = document.createDocumentFragment();
      Array.from(node.childNodes).forEach((child) => {
        fragment.appendChild(cleanNode(child, options));
      });
      return fragment;
    }

    let tagName = sourceTag;
    if (tagName === 'b') tagName = 'strong';
    if (tagName === 'i') tagName = 'em';
    if (tagName === 'h1' && options.demoteBodyH1) tagName = 'h2';

    const element = document.createElement(tagName);

    if (sourceTag === 'a') {
      const href = node.getAttribute('href');
      if (isSafeUrl(href)) {
        element.setAttribute('href', href.trim());
      }
      const title = node.getAttribute('title');
      if (title) {
        element.setAttribute('title', title);
      }
    }

    if (sourceTag === 'img') {
      const src = node.getAttribute('src');
      if (!isSafeUrl(src)) {
        return document.createDocumentFragment();
      }
      element.setAttribute('src', src.trim());
      element.setAttribute('alt', node.getAttribute('alt') || '');
      const title = node.getAttribute('title');
      if (title) {
        element.setAttribute('title', title);
      }
    }

    Array.from(node.childNodes).forEach((child) => {
      element.appendChild(cleanNode(child, options));
    });

    return element;
  };

  const cleanArticleHtml = (html, options) => {
    const template = document.createElement('template');
    template.innerHTML = html;

    if (options.convertTables) {
      convertTables(template.content);
    }

    const output = document.createElement('div');
    if (options.cleanHtml) {
      Array.from(template.content.childNodes).forEach((node) => {
        output.appendChild(cleanNode(node, options));
      });
      return output.innerHTML;
    }

    output.appendChild(template.content.cloneNode(true));
    return output.innerHTML;
  };

  const appendSourceLink = (html) => {
    if (!appendSourceCheckbox.checked) return html;
    const sourceUrl = sourceUrlInput.value.trim();
    if (!isSafeUrl(sourceUrl)) return html;
    return `${html}<p><a href="${escapeHtml(sourceUrl)}">Read the full version on the original site.</a></p>`;
  };

  const extractTitle = (root) => {
    if (!extractTitleCheckbox.checked) return '';
    const firstH1 = root.querySelector('h1');
    if (!firstH1) return '';
    const title = firstH1.textContent.trim();
    firstH1.remove();
    return title;
  };

  const updateStats = () => {
    const words = mediumPlainText.trim().match(/\S+/g) || [];
    const count = words.length;
    const minutes = Math.max(1, Math.ceil(count / 220));
    wordCount.textContent = `${count} ${count === 1 ? 'word' : 'words'}`;
    readingTime.textContent = count ? `${minutes} min read` : '0 min read';
  };

  const convertMarkdownToMedium = () => {
    const markdown = markdownInput.value || '';
    const parsedHtml = parseMarkdown(markdown);
    const template = document.createElement('template');
    template.innerHTML = parsedHtml;

    const title = extractTitle(template.content);
    const cleanedHtml = cleanArticleHtml(template.innerHTML, {
      cleanHtml: cleanHtmlCheckbox.checked,
      convertTables: convertTablesCheckbox.checked,
      demoteBodyH1: extractTitleCheckbox.checked
    });

    mediumBodyHtml = appendSourceLink(cleanedHtml).trim();
    mediumPreview.innerHTML = mediumBodyHtml || '<p>Your Medium-ready preview will appear here.</p>';
    mediumTitle.value = title;
    mediumPlainText = mediumPreview.innerText.trim();
    updateStats();
  };

  const copyText = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
    } catch (error) {
      showToast('Copy failed. Select the text and copy it manually.', true);
    }
  };

  const fallbackCopyRichText = () => {
    const range = document.createRange();
    range.selectNodeContents(mediumPreview);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    const copied = document.execCommand('copy');
    selection.removeAllRanges();
    return copied;
  };

  const copyRichText = async () => {
    if (!mediumBodyHtml) {
      showToast('Add Markdown before copying.', true);
      return;
    }

    const html = `<article>${mediumBodyHtml}</article>`;
    const plain = mediumPlainText;

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([plain], { type: 'text/plain' })
          })
        ]);
        showToast('Rich text copied for Medium.');
        return;
      }
      if (fallbackCopyRichText()) {
        showToast('Rich text copied for Medium.');
        return;
      }
      throw new Error('Copy fallback failed');
    } catch (error) {
      if (fallbackCopyRichText()) {
        showToast('Rich text copied for Medium.');
      } else {
        showToast('Copy failed. Select the preview and copy it manually.', true);
      }
    }
  };

  const downloadHtml = () => {
    const title = mediumTitle.value || 'Medium article';
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${mediumBodyHtml}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'medium-ready-article.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleFiles = (files) => {
    const file = files[0];
    if (!file) return;

    const validFile = file.name.endsWith('.md') || file.name.endsWith('.txt');
    if (!validFile) {
      showToast('Please select a .md or .txt file.', true);
      fileUpload.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      markdownInput.value = event.target.result;
      convertMarkdownToMedium();
      const markdownTab = document.querySelector('#input-tabs button[data-tab="markdown"]');
      if (markdownTab) markdownTab.click();
    };
    reader.onerror = () => showToast('Failed to read the file.', true);
    reader.readAsText(file);
    fileUpload.value = null;
  };

  if (dropArea) {
    dropArea.addEventListener('dragenter', (event) => {
      event.preventDefault();
      dropArea.classList.add('bg-gray-200');
    });
    dropArea.addEventListener('dragover', (event) => event.preventDefault());
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('bg-gray-200'));
    dropArea.addEventListener('drop', (event) => {
      event.preventDefault();
      dropArea.classList.remove('bg-gray-200');
      handleFiles(event.dataTransfer.files);
    });
    dropArea.addEventListener('click', () => fileUpload.click());
  }

  markdownInput.addEventListener('input', convertMarkdownToMedium);
  extractTitleCheckbox.addEventListener('change', convertMarkdownToMedium);
  convertTablesCheckbox.addEventListener('change', convertMarkdownToMedium);
  cleanHtmlCheckbox.addEventListener('change', convertMarkdownToMedium);
  appendSourceCheckbox.addEventListener('change', convertMarkdownToMedium);
  sourceUrlInput.addEventListener('input', convertMarkdownToMedium);
  fileUpload.addEventListener('change', (event) => handleFiles(event.target.files));
  copyTitleButton.addEventListener('click', () => copyText(mediumTitle.value, 'Title copied.'));
  copyPlainButton.addEventListener('click', () => copyText(mediumPlainText, 'Plain text copied.'));
  copyRichButton.addEventListener('click', copyRichText);
  downloadHtmlButton.addEventListener('click', downloadHtml);

  document.querySelectorAll('.faq-question').forEach((button) => {
    button.addEventListener('click', () => {
      const answer = button.nextElementSibling;
      const isOpen = button.parentElement.classList.contains('open');
      const allItems = document.querySelectorAll('.faq-item');

      allItems.forEach((item) => {
        if (item !== button.parentElement) {
          item.classList.remove('open');
          item.querySelector('.faq-answer').style.maxHeight = null;
          item.querySelector('.faq-icon-plus').classList.remove('hidden');
          item.querySelector('.faq-icon-minus').classList.add('hidden');
        }
      });

      if (isOpen) {
        button.parentElement.classList.remove('open');
        answer.style.maxHeight = null;
        button.querySelector('.faq-icon-plus').classList.remove('hidden');
        button.querySelector('.faq-icon-minus').classList.add('hidden');
      } else {
        button.parentElement.classList.add('open');
        answer.style.maxHeight = `${answer.scrollHeight}px`;
        button.querySelector('.faq-icon-plus').classList.add('hidden');
        button.querySelector('.faq-icon-minus').classList.remove('hidden');
      }
    });
  });

  setupTabs('input-tabs');
  markdownInput.value = sampleMarkdown;
  convertMarkdownToMedium();
});
