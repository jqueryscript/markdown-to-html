document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const gutenbergInput = document.getElementById('gutenberg-input');
    const markdownCode = document.getElementById('markdown-code');
    const copyMarkdownButton = document.getElementById('copy-markdown');
    const downloadMarkdownButton = document.getElementById('download-markdown');
    const loadSampleBtn = document.getElementById('load-sample-btn');
    const samplePreview = document.getElementById('sample-preview');
    const preserveCommentsCheckbox = document.getElementById('preserve-comments');
    const cleanSpacingCheckbox = document.getElementById('clean-extra-spacing');

    // Sample Gutenberg content
    const sampleGutenbergContent = `<!-- wp:paragraph -->
<p>Welcome to our blog! This is a sample paragraph block from WordPress Gutenberg editor.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Getting Started Guide</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Follow these simple steps to get started with your project:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li>Install the required dependencies</li><li>Configure your environment</li><li>Run your first build</li></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3>Key Features</h3>
<!-- /wp:heading -->

<!-- wp:list {"ordered":true} -->
<ol><li>Fast and efficient processing</li><li>Easy to use interface</li><li>Comprehensive documentation</li></ol>
<!-- /wp:list -->

<!-- wp:quote -->
<blockquote class="wp-block-quote"><p>The best way to predict the future is to create it.</p><cite>— Peter Drucker</cite></blockquote>
<!-- /wp:quote -->

<!-- wp:heading {"level":3} -->
<h3>Code Example</h3>
<!-- /wp:heading -->

<!-- wp:code -->
<pre class="wp-block-code"><code>function helloWorld() {
    console.log("Hello, World!");
    return true;
}</code></pre>
<!-- /wp:code -->

<!-- wp:separator -->
<hr class="wp-block-separator"/>
<!-- /wp:separator -->

<!-- wp:paragraph -->
<p>This converter supports <strong>bold text</strong>, <em>italic text</em>, and even <a href="https://example.com">links</a>!</p>
<!-- /wp:paragraph -->`;

    // --- Core Functions ---

    /**
     * Parse Gutenberg blocks and convert to Markdown
     */
    const convertGutenbergToMarkdown = () => {
        const gutenbergHtml = gutenbergInput.value || '';
        if (!gutenbergHtml.trim()) {
            markdownCode.textContent = '';
            return;
        }

        const preserveComments = preserveCommentsCheckbox.checked;
        const cleanSpacing = cleanSpacingCheckbox.checked;

        let markdown = '';

        // Parse Gutenberg blocks
        const blocks = parseGutenbergBlocks(gutenbergHtml);

        // Convert each block to Markdown
        blocks.forEach((block, index) => {
            const blockMarkdown = convertBlockToMarkdown(block, preserveComments);
            markdown += blockMarkdown;

            // Add blank line between blocks (but not after the last one)
            if (index < blocks.length - 1) {
                markdown += '\n\n';
            }
        });

        // Clean up extra spacing if enabled
        if (cleanSpacing) {
            markdown = cleanExtraSpacing(markdown);
        }

        markdownCode.textContent = markdown;
    };

    /**
     * Parse Gutenberg HTML into blocks
     */
    const parseGutenbergBlocks = (html) => {
        const blocks = [];
        // Match complete Gutenberg blocks with attributes
        const blockRegex = /<!--\s*wp:(\w+)(\s+({.*?}))?\s*-->([\s\S]*?)<!--\s*\/wp:\1\s*-->/g;
        let match;

        while ((match = blockRegex.exec(html)) !== null) {
            const blockType = match[1];
            const blockAttrsFull = match[2] || '';
            const blockAttrsStr = match[3] || '';
            const blockAttrs = match[3] ? tryParseJSON(match[3]) : {};
            const blockContent = match[4];

            // Reconstruct original comments
            const openingComment = `<!-- wp:${blockType}${blockAttrsFull} -->`;
            const closingComment = `<!-- /wp:${blockType} -->`;

            blocks.push({
                type: blockType,
                attrsStr: blockAttrsStr,
                attrs: blockAttrs,
                content: blockContent,
                openingComment: openingComment,
                closingComment: closingComment
            });
        }

        return blocks;
    };

    /**
     * Try to parse JSON safely
     */
    const tryParseJSON = (str) => {
        try {
            return JSON.parse(str);
        } catch (e) {
            return {};
        }
    };

    /**
     * Convert a Gutenberg block to Markdown
     */
    const convertBlockToMarkdown = (block, preserveComments) => {
        const { type, attrs, content, openingComment, closingComment } = block;
        let markdown = '';

        // Add opening comment if preserving
        if (preserveComments) {
            markdown += `${openingComment}\n`;
        }

        switch (type) {
            case 'paragraph':
                markdown += convertParagraph(content);
                break;

            case 'heading':
                markdown += convertHeading(content, attrs);
                break;

            case 'list':
                markdown += convertList(content, attrs);
                break;

            case 'quote':
                markdown += convertQuote(content);
                break;

            case 'code':
                markdown += convertCodeBlock(content);
                break;

            case 'separator':
            case 'spacer':
                markdown += '---';
                break;

            case 'table':
                markdown += convertTable(content);
                break;

            case 'image':
                markdown += convertImage(content, attrs);
                break;

            case 'embed':
            case 'core-embed/youtube':
            case 'core-embed/vimeo':
                markdown += convertEmbed(attrs);
                break;

            case 'html':
                markdown += convertCustomHTML(content);
                break;

            case 'preformatted':
                markdown += convertPreformatted(content);
                break;

            case 'pullquote':
                markdown += convertPullQuote(content);
                break;

            case 'verse':
                markdown += convertVerse(content);
                break;

            default:
                // Default: use Turndown for HTML conversion
                markdown += convertHTMLToMarkdown(content);
        }

        // Add closing comment if preserving (trim trailing whitespace first)
        if (preserveComments) {
            markdown = markdown.trimEnd() + `\n${closingComment}`;
        }

        return markdown;
    };

    /**
     * Convert paragraph block
     */
    const convertParagraph = (content) => {
        const text = extractText(content, 'p');
        return text;
    };

    /**
     * Convert heading block
     */
    const convertHeading = (content, attrs) => {
        const level = attrs.level || 2;
        const text = extractText(content, `h${level}`);
        const hashes = '#'.repeat(level);
        return `${hashes} ${text}`;
    };

    /**
     * Convert list block (ordered or unordered)
     */
    const convertList = (content, attrs) => {
        const ordered = attrs.ordered || false;
        const listTag = ordered ? 'ol' : 'ul';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const listElement = tempDiv.querySelector(listTag);

        if (!listElement) return '';

        const items = listElement.querySelectorAll('li');
        let markdown = '';

        items.forEach((item, index) => {
            const prefix = ordered ? `${index + 1}. ` : '- ';
            const text = convertInlineHTML(item.innerHTML);
            markdown += prefix + text + '\n';
        });

        return markdown.trim();
    };

    /**
     * Convert quote block
     */
    const convertQuote = (content) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        const quoteText = tempDiv.querySelector('p');
        const citation = tempDiv.querySelector('cite');

        let markdown = '';

        if (quoteText) {
            markdown += '> ' + quoteText.textContent;
        }

        if (citation) {
            markdown += '\n> \u2014 ' + citation.textContent.replace(/^[\s\u2014\u2013]+/, '');
        }

        return markdown;
    };

    /**
     * Convert code block
     */
    const convertCodeBlock = (content) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const codeElement = tempDiv.querySelector('code');

        if (codeElement) {
            return '```\n' + codeElement.textContent + '\n```';
        }

        return '```\n' + extractText(content, 'pre') + '\n```';
    };

    /**
     * Convert table block
     */
    const convertTable = (content) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const table = tempDiv.querySelector('table');

        if (!table) return '';

        let markdown = '';
        const rows = table.querySelectorAll('tr');

        rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll('th, td');
            const rowText = Array.from(cells).map(cell => {
                return convertInlineHTML(cell.innerHTML).trim();
            }).join(' | ');

            markdown += '| ' + rowText + ' |\n';

            // Add separator after first row (header row)
            if (rowIndex === 0) {
                const separator = Array.from(cells).map(() => '---').join(' | ');
                markdown += '| ' + separator + ' |\n';
            }
        });

        return markdown;
    };

    /**
     * Convert image block
     */
    const convertImage = (content, attrs) => {
        const url = attrs.url || attrs.src || '';
        const alt = attrs.alt || '';
        const caption = attrs.caption || '';

        let markdown = '';

        if (url) {
            markdown += `![${alt}](${url})`;

            if (caption) {
                markdown += '\n\n' + caption;
            }
        }

        return markdown;
    };

    /**
     * Convert embed block
     */
    const convertEmbed = (attrs) => {
        const url = attrs.url || '';
        if (url) {
            return `[Embed: ${url}]`;
        }
        return '';
    };

    /**
     * Convert custom HTML block
     */
    const convertCustomHTML = (content) => {
        // For custom HTML, we just wrap it as raw HTML
        return `<div class="raw-html">${content.trim()}</div>`;
    };

    /**
     * Convert preformatted text block
     */
    const convertPreformatted = (content) => {
        const text = extractText(content, 'pre');
        return '```\n' + text + '\n```';
    };

    /**
     * Convert pullquote block
     */
    const convertPullQuote = (content) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const quoteText = tempDiv.querySelector('p');
        const citation = tempDiv.querySelector('cite');

        let markdown = '';

        if (quoteText) {
            // Pullquotes often have quotation marks
            markdown += '> ' + quoteText.textContent;
        }

        if (citation) {
            markdown += '\n> \u2014 ' + citation.textContent.replace(/^[\s\u2014\u2013]+/, '');
        }

        return markdown;
    };

    /**
     * Convert verse block (poetry)
     */
    const convertVerse = (content) => {
        // Verse content is often preformatted text with line breaks
        const text = content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
        return text.trim();
    };

    /**
     * Convert inline HTML to Markdown using Turndown
     */
    const convertInlineHTML = (html) => {
        const turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
            emDelimiter: '*',
            strongDelimiter: '**'
        });

        return turndownService.turndown(html).trim();
    };

    /**
     * Convert generic HTML to Markdown
     */
    const convertHTMLToMarkdown = (html) => {
        const turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
            emDelimiter: '*',
            strongDelimiter: '**'
        });

        turndownService.use(turndownPluginGfm.gfm);

        return turndownService.turndown(html).trim();
    };

    /**
     * Extract text content from HTML element
     */
    const extractText = (html, tag) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const element = tempDiv.querySelector(tag);
        return element ? element.textContent : '';
    };

    /**
     * Clean extra spacing from markdown
     */
    const cleanExtraSpacing = (text) => {
        // Remove excessive blank lines (more than 2 consecutive)
        return text.replace(/\n{3,}/g, '\n\n');
    };

    /**
     * Download markdown as file
     */
    const downloadFile = () => {
        const markdownContent = markdownCode.textContent;
        const blob = new Blob([markdownContent], { type: 'text/markdown' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'gutenberg-converted.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // --- Event Listeners ---
    gutenbergInput.addEventListener('input', convertGutenbergToMarkdown);
    preserveCommentsCheckbox.addEventListener('change', convertGutenbergToMarkdown);
    cleanSpacingCheckbox.addEventListener('change', convertGutenbergToMarkdown);

    copyMarkdownButton.addEventListener('click', () => {
        navigator.clipboard.writeText(markdownCode.textContent).then(() => {
            Toastify({
                text: "Markdown code copied!",
                duration: 3000,
                gravity: "bottom",
                position: "center",
                style: { background: "#4f46e5" }
            }).showToast();
        }, () => {
            Toastify({
                text: "Failed to copy.",
                duration: 3000,
                gravity: "bottom",
                position: "center",
                style: { background: "#ef4444" }
            }).showToast();
        });
    });

    downloadMarkdownButton.addEventListener('click', downloadFile);

    // Load sample button
    loadSampleBtn.addEventListener('click', () => {
        gutenbergInput.value = sampleGutenbergContent;
        samplePreview.textContent = sampleGutenbergContent.substring(0, 300) + '...';
        convertGutenbergToMarkdown();

        // Switch back to Gutenberg input tab
        document.querySelector('#input-tabs button[data-tab="gutenberg"]').click();

        Toastify({
            text: "Sample content loaded!",
            duration: 3000,
            gravity: "bottom",
            position: "center",
            style: { background: "#4f46e5" }
        }).showToast();
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
    const placeholderGutenberg = `<!-- wp:paragraph -->
<p>This is a sample paragraph block.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>This is a Heading</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul><li>First item</li><li>Second item</li></ul>
<!-- /wp:list -->`;

    gutenbergInput.value = placeholderGutenberg;
    convertGutenbergToMarkdown();
});
