document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const epubInput = document.getElementById('epub-input');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const clearFileBtn = document.getElementById('clear-file');
    const progressSection = document.getElementById('progress-section');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressStatus = document.getElementById('progress-status');
    const outputSection = document.getElementById('output-content-markdown');
    const markdownOutput = document.getElementById('markdown-output');
    const copyBtn = document.getElementById('copy-markdown');
    const downloadBtn = document.getElementById('download-markdown');
    const filenameInput = document.getElementById('filename');

    // Options
    const preserveImages = document.getElementById('preserve-images');
    const extractMetadata = document.getElementById('extract-metadata');
    const preserveStructure = document.getElementById('preserve-structure');
    const convertTables = document.getElementById('convert-tables');

    // State
    let currentEpubFile = null;
    let epubData = null;

    // Mobile menu functionality
    const menuButton = document.getElementById('menu-button');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const mobileToolsButton = document.getElementById('mobile-tools-button');
    const mobileToolsMenu = document.getElementById('mobile-tools-menu');
    const mobileToolsArrow = document.getElementById('mobile-tools-arrow');
    const toolsDropdown = document.getElementById('tools-dropdown');
    const toolsDropdownButton = document.getElementById('tools-dropdown-button');
    const toolsDropdownMenu = document.getElementById('tools-dropdown-menu');

    // Toggle mobile menu
    if (menuButton && sidebar && sidebarOverlay) {
        menuButton.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
            sidebarOverlay.classList.toggle('hidden');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            if (sidebar) sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
        });
    }

    // Toggle mobile tools menu
    if (mobileToolsButton && mobileToolsMenu && mobileToolsArrow) {
        mobileToolsButton.addEventListener('click', () => {
            mobileToolsMenu.classList.toggle('hidden');
            mobileToolsArrow.classList.toggle('rotate-180');
        });
    }

    // Desktop dropdown hover functionality
    let hideTimer;
    function showMenu() {
        if (toolsDropdownMenu) {
            clearTimeout(hideTimer);
            toolsDropdownMenu.classList.remove('hidden');
        }
    }

    function startHideTimer() {
        hideTimer = setTimeout(() => {
            if (toolsDropdownMenu) {
                toolsDropdownMenu.classList.add('hidden');
            }
        }, 200); // 200ms delay
    }

    if (toolsDropdown) {
        toolsDropdown.addEventListener("mouseenter", showMenu);
        toolsDropdown.addEventListener("mouseleave", startHideTimer);
    }

    // Fix CTRL+A for markdown output
    if (markdownOutput) {
        markdownOutput.addEventListener('keydown', (e) => {
            // Handle CTRL+A (Select All)
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();

                // Create selection for the entire content
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(markdownOutput);
                selection.removeAllRanges();
                selection.addRange(range);
            }

            // Handle CTRL+C (Copy)
            if (e.ctrlKey && e.key === 'c') {
                // Let default copy behavior work with the selection
                return true;
            }
        });
    }

    // File input handler
    if (epubInput) {
        epubInput.addEventListener('change', handleFileSelect);
    }

    // Click to upload functionality
    const dropArea = document.getElementById('drop-area');
    if (dropArea && epubInput) {
        dropArea.addEventListener('click', () => {
            epubInput.click();
        });
    }

    // Drag and drop functionality
    const uploadArea = dropArea;

    if (uploadArea) {
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });
    }

    function highlight(e) {
        if (uploadArea) {
            uploadArea.classList.add('border-indigo-400', 'bg-indigo-50');
        }
    }

    function unhighlight(e) {
        if (uploadArea) {
            uploadArea.classList.remove('border-indigo-400', 'bg-indigo-50');
        }
    }

    if (uploadArea) {
        uploadArea.addEventListener('drop', handleDrop, false);
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0 && files[0].name.toLowerCase().endsWith('.epub')) {
            handleFile(files[0]);
        } else {
            showToast('Please drop a valid EPUB file', 'error');
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    }

    function handleFile(file) {
        if (!file.name.toLowerCase().endsWith('.epub')) {
            showToast('Please select a valid EPUB file', 'error');
            return;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            showToast('File size must be less than 50MB', 'error');
            return;
        }

        currentEpubFile = file;
        if (fileName) fileName.textContent = file.name;
        if (fileInfo) fileInfo.classList.remove('hidden');
        if (outputSection) outputSection.classList.add('hidden');

        showToast('EPUB file loaded successfully', 'success');

        // Start conversion immediately
        convertEpubToMarkdown();
    }

    // Clear file
    if (clearFileBtn) {
        clearFileBtn.addEventListener('click', () => {
            currentEpubFile = null;
            epubData = null;
            if (epubInput) epubInput.value = '';
            if (fileInfo) fileInfo.classList.add('hidden');
            if (outputSection) outputSection.classList.remove('hidden');
            if (markdownOutput) {
                markdownOutput.textContent = 'Upload an EPUB file to see the converted Markdown output here...';
                markdownOutput.className = 'h-full text-sm bg-gray-900 text-gray-300 p-4 block overflow-auto whitespace-pre-wrap break-words';
            }
        });
    }

    
    // Copy button
    if (copyBtn && markdownOutput) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(markdownOutput.textContent).then(() => {
                showToast('Markdown copied to clipboard', 'success');
            }).catch(() => {
                showToast('Failed to copy to clipboard', 'error');
            });
        });
    }

    // Download button
    if (downloadBtn && markdownOutput && filenameInput) {
        downloadBtn.addEventListener('click', () => {
            const filename = (filenameInput.value.trim() || 'converted-book') + '.md';
            const content = markdownOutput.textContent;

            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            showToast('Markdown file downloaded', 'success');
        });
    }

    // Main conversion function
    async function convertEpubToMarkdown() {
        if (!currentEpubFile) return;

        try {
            // Show progress
            if (progressSection) progressSection.classList.remove('hidden');
            if (outputSection) outputSection.classList.add('hidden');

            // Read EPUB file
            updateProgress(10, 'Reading EPUB file...');
            const arrayBuffer = await currentEpubFile.arrayBuffer();

            // Parse EPUB using JSZip
            updateProgress(20, 'Extracting EPUB contents...');
            const zip = await JSZip.loadAsync(arrayBuffer);

            // Find and parse container.xml
            updateProgress(30, 'Parsing EPUB structure...');
            const containerXml = await zip.file('META-INF/container.xml')?.async('text');
            if (!containerXml) {
                throw new Error('Invalid EPUB file: container.xml not found');
            }

            // Parse container.xml to find root file
            const parser = new DOMParser();
            const containerDoc = parser.parseFromString(containerXml, 'text/xml');
            const rootfilePath = containerDoc.querySelector('rootfile')?.getAttribute('full-path');
            if (!rootfilePath) {
                throw new Error('Invalid EPUB file: rootfile not found');
            }

            // Parse OPF file
            updateProgress(40, 'Reading content structure...');
            const opfContent = await zip.file(rootfilePath)?.async('text');
            if (!opfContent) {
                throw new Error('Invalid EPUB file: OPF file not found');
            }

            const opfDoc = parser.parseFromString(opfContent, 'text/xml');

            // Extract metadata
            let metadata = {};
            if (extractMetadata.checked) {
                metadata = extractMetadataFromOpf(opfDoc);
            }

            // Find all content files
            const manifestItems = opfDoc.querySelectorAll('manifest item');
            const spineItems = opfDoc.querySelectorAll('spine itemref');

            updateProgress(50, 'Processing chapters...');

            // Process content files in order
            let markdownContent = '';
            let chapterIndex = 1;

            // Add metadata if requested
            if (extractMetadata.checked && Object.keys(metadata).length > 0) {
                markdownContent += formatMetadata(metadata);
                markdownContent += '\n\n';
            }

            // Process spine items (reading order)
            for (const spineItem of spineItems) {
                const itemId = spineItem.getAttribute('idref');
                const manifestItem = opfDoc.querySelector(`manifest item[id="${itemId}"]`);

                if (manifestItem) {
                    const href = manifestItem.getAttribute('href');
                    const mediaType = manifestItem.getAttribute('media-type');

                    // Handle different content types
                    if (mediaType === 'application/xhtml+xml' || mediaType === 'text/html') {
                        const contentPath = resolvePath(rootfilePath, href);
                        const content = await zip.file(contentPath)?.async('text');

                        if (content) {
                            updateProgress(50 + (chapterIndex * 5), `Processing chapter ${chapterIndex}...`);
                            const chapterMarkdown = convertHtmlToMarkdown(content, chapterIndex);

                            if (preserveStructure.checked) {
                                markdownContent += chapterMarkdown;
                            } else {
                                // Add chapter content without chapter headers
                                markdownContent += chapterMarkdown.replace(/^# .+$/gm, '');
                            }

                            chapterIndex++;
                        }
                    }
                }
            }

            // Handle images if requested
            if (preserveImages.checked) {
                updateProgress(90, 'Processing images...');
                const imageReferences = await processImages(zip, rootfilePath);
                if (imageReferences) {
                    markdownContent = markdownContent.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
                        if (imageReferences[src]) {
                            return `![${alt}](${imageReferences[src]})`;
                        }
                        return match;
                    });
                }
            }

            updateProgress(100, 'Conversion complete!');

            // Display result
            if (markdownOutput) markdownOutput.textContent = markdownContent;
            if (outputSection) outputSection.classList.remove('hidden');

            showToast('EPUB converted successfully', 'success');

        } catch (error) {
            console.error('Conversion error:', error);
            showToast(`Conversion failed: ${error.message}`, 'error');
        } finally {
            setTimeout(() => {
                if (progressSection) progressSection.classList.add('hidden');
            }, 1000);
        }
    }

    // Helper functions
    function updateProgress(percent, status) {
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
        progressStatus.textContent = status;
    }

    function resolvePath(basePath, href) {
        const basePathDir = basePath.substring(0, basePath.lastIndexOf('/'));
        if (href.startsWith('/')) {
            return href.substring(1);
        }
        return basePathDir ? `${basePathDir}/${href}` : href;
    }

    function extractMetadataFromOpf(opfDoc) {
        const metadata = {};
        const metadataElement = opfDoc.querySelector('metadata');

        if (metadataElement) {
            const title = metadataElement.querySelector('title')?.textContent;
            const creator = metadataElement.querySelector('creator')?.textContent;
            const description = metadataElement.querySelector('description')?.textContent;
            const publisher = metadataElement.querySelector('publisher')?.textContent;
            const date = metadataElement.querySelector('date')?.textContent;
            const identifier = metadataElement.querySelector('identifier')?.textContent;
            const language = metadataElement.querySelector('language')?.textContent;

            if (title) metadata.title = title;
            if (creator) metadata.author = creator;
            if (description) metadata.description = description;
            if (publisher) metadata.publisher = publisher;
            if (date) metadata.date = date;
            if (identifier) metadata.identifier = identifier;
            if (language) metadata.language = language;
        }

        return metadata;
    }

    function formatMetadata(metadata) {
        let markdown = '';

        if (metadata.title) {
            markdown += `# ${metadata.title}\n\n`;
        }

        let metadataLines = [];
        if (metadata.author) metadataLines.push(`**Author:** ${metadata.author}`);
        if (metadata.publisher) metadataLines.push(`**Publisher:** ${metadata.publisher}`);
        if (metadata.date) metadataLines.push(`**Date:** ${metadata.date}`);
        if (metadata.language) metadataLines.push(`**Language:** ${metadata.language}`);
        if (metadata.identifier) metadataLines.push(`**Identifier:** ${metadata.identifier}`);

        if (metadataLines.length > 0) {
            markdown += metadataLines.join('\n') + '\n\n';
        }

        if (metadata.description) {
            markdown += `## Description\n\n${metadata.description}\n\n`;
        }

        return markdown;
    }

    function convertHtmlToMarkdown(htmlContent, chapterIndex) {
        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // Remove script and style elements
        doc.querySelectorAll('script, style').forEach(el => el.remove());

        let markdown = '';

        // Extract title if available
        const title = doc.querySelector('title')?.textContent ||
                     doc.querySelector('h1')?.textContent ||
                     `Chapter ${chapterIndex}`;

        if (preserveStructure.checked) {
            markdown += `# ${title}\n\n`;
        }

        // Convert headings
        doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            const text = heading.textContent.trim();
            const prefix = '#'.repeat(level + (preserveStructure.checked ? 0 : 1));
            markdown += `${prefix} ${text}\n\n`;
            heading.remove(); // Remove processed element
        });

        // Convert paragraphs
        doc.querySelectorAll('p').forEach(p => {
            const text = p.textContent.trim();
            if (text) {
                markdown += `${text}\n\n`;
            }
            p.remove();
        });

        // Convert lists
        doc.querySelectorAll('ul, ol').forEach(list => {
            const items = list.querySelectorAll('li');
            items.forEach((item, index) => {
                const prefix = list.tagName === 'ul' ? '- ' : `${index + 1}. `;
                markdown += `${prefix}${item.textContent.trim()}\n`;
            });
            markdown += '\n';
            list.remove();
        });

        // Convert blockquotes
        doc.querySelectorAll('blockquote').forEach(blockquote => {
            const text = blockquote.textContent.trim();
            markdown += `> ${text}\n\n`;
            blockquote.remove();
        });

        // Convert code blocks
        doc.querySelectorAll('pre').forEach(pre => {
            const code = pre.querySelector('code')?.textContent || pre.textContent;
            markdown += `\`\`\`\n${code.trim()}\n\`\`\`\n\n`;
            pre.remove();
        });

        // Convert inline code
        doc.querySelectorAll('code').forEach(code => {
            if (code.parentElement.tagName !== 'PRE') {
                const text = code.textContent.trim();
                markdown += `\`${text}\``;
                code.replaceWith(document.createTextNode(`\`${text}\``));
            }
        });

        // Convert links
        doc.querySelectorAll('a').forEach(a => {
            const text = a.textContent.trim();
            const href = a.getAttribute('href');
            if (href) {
                markdown += `[${text}](${href})`;
                a.replaceWith(document.createTextNode(`[${text}](${href})`));
            }
        });

        // Convert images
        doc.querySelectorAll('img').forEach(img => {
            const alt = img.getAttribute('alt') || '';
            const src = img.getAttribute('src') || '';
            markdown += `![${alt}](${src})`;
            img.replaceWith(document.createTextNode(`![${alt}](${src})`));
        });

        // Convert tables if requested
        if (convertTables.checked) {
            doc.querySelectorAll('table').forEach(table => {
                markdown += convertTableToMarkdown(table);
                table.remove();
            });
        }

        // Process remaining text content
        const remainingText = doc.body.textContent.trim();
        if (remainingText) {
            markdown += remainingText + '\n\n';
        }

        return markdown;
    }

    function convertTableToMarkdown(table) {
        let markdown = '';

        // Header
        const headers = table.querySelectorAll('th');
        if (headers.length > 0) {
            const headerRow = Array.from(headers).map(th => th.textContent.trim()).join(' | ');
            markdown += `${headerRow}\n`;

            // Separator
            const separator = Array.from(headers).map(() => '---').join(' | ');
            markdown += `${separator}\n`;
        }

        // Rows
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td, th');
            if (cells.length > 0) {
                const rowData = Array.from(cells).map(cell => cell.textContent.trim()).join(' | ');
                markdown += `${rowData}\n`;
            }
        });

        return markdown + '\n';
    }

    async function processImages(zip, basePath) {
        const imageReferences = {};
        const imageFiles = [];

        // Find all image files in the ZIP
        zip.forEach((relativePath, file) => {
            if (file.name.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
                imageFiles.push(file.name);
            }
        });

        // In a real implementation, you would convert images to base64
        // For now, we'll just return the references
        return imageReferences;
    }

    function showToast(message, type = 'info') {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: type === 'error' ? '#ef4444' :
                           type === 'success' ? '#10b981' : '#3b82f6',
            stopOnFocus: true
        }).showToast();
    }

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
});