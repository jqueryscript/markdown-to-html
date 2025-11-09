// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References (moved to top!)
    const menuButton = document.getElementById('menu-button');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const toolsDropdown = document.getElementById('tools-dropdown');
    const toolsDropdownMenu = document.getElementById('tools-dropdown-menu');
    const mobileToolsButton = document.getElementById('mobile-tools-button');
    const mobileToolsMenu = document.getElementById('mobile-tools-menu');
    const mobileToolsArrow = document.getElementById('mobile-tools-arrow');

  
    // --- Mobile Menu Functions ---
    const toggleSidebar = () => {
        if (sidebar) sidebar.classList.toggle('active');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
        if (menuButton) menuButton.classList.toggle('active');
        document.body.style.overflow = (sidebar && sidebar.classList.contains('active')) ? 'hidden' : '';
    };

    const closeSidebar = () => {
        if (sidebar) sidebar.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        if (menuButton) menuButton.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Mobile menu event listeners - only if elements exist
    if (menuButton) menuButton.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    // Close sidebar when clicking on links
    const sidebarLinks = sidebar ? sidebar.querySelectorAll('a') : [];
    sidebarLinks.forEach(link => {
        link.addEventListener('click', closeSidebar);
    });

    // Tools dropdown functionality
    const toggleToolsDropdown = (isMobile = false) => {
        const dropdown = isMobile ? mobileToolsMenu : toolsDropdownMenu;
        const arrow = isMobile ? mobileToolsArrow : null;
        const button = isMobile ? mobileToolsButton : toolsDropdown;

        if (!dropdown || !button) return;

        const isOpen = dropdown.style.display === 'block';

        // Close all dropdowns first
        if (toolsDropdownMenu) toolsDropdownMenu.style.display = 'none';
        if (mobileToolsMenu) mobileToolsMenu.style.display = 'none';
        if (mobileToolsArrow) mobileToolsArrow.style.transform = 'rotate(0deg)';

        if (!isOpen) {
            dropdown.style.display = 'block';
            if (arrow) arrow.style.transform = 'rotate(180deg)';
        }
    };

    // Tools dropdown event listeners
    if (toolsDropdown) {
        toolsDropdown.addEventListener('click', (e) => {
            e.preventDefault();
            toggleToolsDropdown(false);
        });
    }

    if (mobileToolsButton) {
        mobileToolsButton.addEventListener('click', (e) => {
            e.preventDefault();
            toggleToolsDropdown(true);
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#tools-dropdown') && !e.target.closest('#mobile-tools-button')) {
            if (toolsDropdownMenu) toolsDropdownMenu.style.display = 'none';
            if (mobileToolsMenu) mobileToolsMenu.style.display = 'none';
            if (mobileToolsArrow) mobileToolsArrow.style.transform = 'rotate(0deg)';
        }
    });

    // --- Utility Functions ---
    // Debounce function for performance optimization
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // HTML escaping function
    const escapeHTML = (str) => {
        return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    // --- Main Converter Functions ---
    const codeEditor = document.getElementById('code-editor');
    const bgTemplateSelect = document.getElementById('bg-template-select');
    const templateSelect = document.getElementById('template-select');
    const exportFormat = document.getElementById('export-format');
    const exportScale = document.getElementById('export-scale');
    const fontSize = document.getElementById('font-size');
    const lineHeight = document.getElementById('line-height');
    const downloadBtn = document.getElementById('download-btn');
    const resizeHandle = document.getElementById('resize-handle');
    const screenshotWorkspace = document.getElementById('screenshot-workspace');
    const screenshotContainer = document.getElementById('screenshot-container');

    // Function to auto-resize editor height
    const autoResizeEditor = () => {
        if (!codeEditor) return;
        codeEditor.style.height = 'auto';
        codeEditor.style.height = (codeEditor.scrollHeight) + 'px';
    };

    // Update preview in real-time (with performance optimization)
    const updatePreview = debounce(() => {
        if (!codeEditor) return;

        const text = codeEditor.innerText || codeEditor.textContent || '';

        // Prevent performance issues with very large content
        if (text.length > 50000) {
            Toastify({
                text: "Content too large for real-time preview. Consider shorter content.",
                duration: 3000,
                gravity: "bottom",
                position: "center",
                style: { background: "#f59e0b" }
            }).showToast();
            return;
        }

        try {
            // Clear and update with syntax highlighting
            const selection = window.getSelection();
            const cursorPos = saveCursorPosition(codeEditor);

            codeEditor.innerHTML = highlightMarkdown(text);

            // Restore cursor position
            restoreCursorPosition(codeEditor, cursorPos);

            // Adjust height after content update
            autoResizeEditor();

        } catch (error) {
            // Fallback to plain text if highlighting fails
            console.error('Preview update failed:', error);
            codeEditor.innerText = text;
        }
    }, 150); // Debounce for 150ms

    // Save cursor position by symmetrically counting characters, mirroring restoreCursorPosition
    const saveCursorPosition = (element) => {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return 0;

        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);

        // Clone the content before the cursor and walk it to count characters
        const fragment = preCaretRange.cloneContents();
        let charCount = 0;
        const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ALL, null, false);

        let node;
        while (node = walker.nextNode()) {
            if (node.nodeType === Node.TEXT_NODE) {
                charCount += node.textContent.length;
            } else if (node.nodeName === 'BR') {
                charCount++;
            }
        }
        return charCount;
    };

    // Restore cursor position
    const restoreCursorPosition = (element, position) => {
        const selection = window.getSelection();
        const range = document.createRange();
        let charCount = 0;
        let found = false;

        // Use SHOW_ALL to see BR tags, which correspond to \n in innerText
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_ALL,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            if (node.nodeType === Node.TEXT_NODE) {
                const nodeLength = node.textContent.length;
                if (charCount + nodeLength >= position) {
                    range.setStart(node, position - charCount);
                    range.collapse(true);
                    found = true;
                    break;
                }
                charCount += nodeLength;
            } else if (node.nodeName === 'BR') {
                charCount++; // Count <br> as one character, just like \n
                if (charCount >= position) {
                    // Place cursor *after* the <br> to be on the new line
                    range.setStartAfter(node);
                    range.collapse(true);
                    found = true;
                    break;
                }
            }
        }

        if (found) {
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            // Fallback for when the position is at the very end
            range.selectNodeContents(element);
            range.collapse(false); // 'false' collapses the range to its end point
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    // Syntax highlighting function (preserves Markdown markers)
    const highlightMarkdown = (text) => {
        // First, escape user's HTML to prevent it from rendering.
        let html = escapeHTML(text);

        // The order of replacement is important.
        // 1. HTML Tags (since they are escaped, they are safe to wrap)
        html = html.replace(/(&lt;\/?[\w\s="'./?]+&gt;)/g, '<span class="token html-tag">$1</span>');

        // 2. Headings
        html = html.replace(/^(#+) (.*$)/gm, (match, hashes, content) => {
            const level = Math.min(hashes.length, 6);
            return `<span class="token heading heading-${level}">${hashes} ${content}</span>`;
        });

        // 3. List Markers (must be at the start of a line)
        html = html.replace(/^(\s*[-*+])(\s+)/gm, '<span class="token list-marker">$1</span>$2');
        html = html.replace(/^(\s*\d+\.)(\s+)/gm, '<span class="token list-marker">$1</span>$2');

        // 4. Bold and Italic (process bold first)
        html = html.replace(/\*\*([^\s*](?:[^*]*[^\s*])?)\*\*/g, '<span class="token bold">**$1**</span>');
        html = html.replace(/__([^\s_](?:[^_]*[^\s_])?)__/g, '<span class="token bold">__$1__</span>');
        html = html.replace(/(?<![*\w])\*([^\s*](?:[^*]*[^\s*])?)\*(?![*\w])/g, '<span class="token italic">*![]($1)*</span>');
        html = html.replace(/(?<![\w_])_([^\s_](?:[^_]*[^\s_])?)_(?![\w_])/g, '<span class="token italic">_$1_</span>');

        // 5. Blockquotes
        html = html.replace(/^(&gt;+)(\s?)/gm, '<span class="token blockquote">$1</span>$2');

        // 6. Inline Code (has a special background, so keep its unique class)
        html = html.replace(/`([^`]+)`/g, '<span class="inline-code">`$1`</span>');

        // Finally, convert newlines to <br> tags for rendering.
        return html.replace(/\n/g, '<br>');
    };

    // Event listeners for real-time updates - only if elements exist
    if (codeEditor) {
        codeEditor.addEventListener('input', updatePreview);
        codeEditor.addEventListener('paste', () => setTimeout(updatePreview, 10));

        // Keyboard shortcuts
        codeEditor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const selection = window.getSelection();
                if (!selection.rangeCount) return;
                const range = selection.getRangeAt(0);
                const newlineNode = document.createTextNode('\n');
                range.deleteContents();
                range.insertNode(newlineNode);
                range.setStartAfter(newlineNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                updatePreview();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                const selection = window.getSelection();
                if (!selection.rangeCount) return;
                const range = selection.getRangeAt(0);
                const tabNode = document.createTextNode('    '); // 4 spaces
                range.deleteContents();
                range.insertNode(tabNode);
                range.setStartAfter(tabNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                updatePreview();
            }
        });
    }

    // Handle template changes - only if elements exist
    if (bgTemplateSelect) {
        bgTemplateSelect.addEventListener('change', () => {
            const screenshotContainer = document.getElementById('screenshot-container');
            if (screenshotContainer) {
                // 如果选择了说明选项，不应用任何背景
                if (bgTemplateSelect.value === '') {
                    // 保持当前背景，只移除bg-*类，保留基础类
                    screenshotContainer.className = screenshotContainer.className.replace(/bg-\w+/g, '');
                } else {
                    // 添加正确的背景CSS类
                    screenshotContainer.className = `screenshot-container bg-${bgTemplateSelect.value}`;
                }
            }
        });
    }

    if (templateSelect) {
        templateSelect.addEventListener('change', () => {
            const screenshotWorkspace = document.getElementById('screenshot-workspace');
            if (screenshotWorkspace) {
                // 如果选择了说明选项，不应用任何卡片样式
                if (templateSelect.value === '') {
                    // 保持当前卡片样式，只移除template-*类，保留基础类
                    screenshotWorkspace.className = screenshotWorkspace.className.replace(/template-\w+/g, '');
                } else {
                    // 添加正确的卡片CSS类
                    screenshotWorkspace.className = `screenshot-workspace template-${templateSelect.value}`;
                }
            }
        });
    }

    // Handle font size change
    if (fontSize) {
        fontSize.addEventListener('change', () => {
            if (codeEditor) {
                const selectedFontSize = fontSize.value;
                if (selectedFontSize !== '') {
                    codeEditor.style.fontSize = selectedFontSize + 'px';
                }
            }
        });
    }

    // Handle line height change
    if (lineHeight) {
        lineHeight.addEventListener('change', () => {
            if (codeEditor) {
                const selectedLineHeight = lineHeight.value;
                if (selectedLineHeight !== '') {
                    codeEditor.style.lineHeight = selectedLineHeight;
                }
            }
        });
    }

    // Handle social media preset change
    const socialPreset = document.getElementById('social-preset');
    if (socialPreset) {
        socialPreset.addEventListener('change', () => {
            const screenshotContainer = document.getElementById('screenshot-container');
            if (screenshotContainer) {
                const preset = socialPreset.value;

                if (preset === '') {
                    // If the description option is selected, do not change the size
                    return;
                }

                // Define standard dimensions for social media platforms (width only) - 2024-2025 official recommendations
                const presetDimensions = {
                    'twitter-x': { width: 1280 },
                    'facebook': { width: 1200 },
                    'instagram': { width: 1080 },
                    'instagram-story': { width: 1080 },
                    'linkedin': { width: 1200 },
                    'reddit': { width: 1200 },
                    'pinterest': { width: 1000 },
                    'tiktok': { width: 1080 },
                    'youtube': { width: 1280 }
                };

                const dimensions = presetDimensions[preset];
                if (dimensions) {
                    // Set container width and remove fixed height to allow auto-sizing
                    screenshotContainer.style.width = dimensions.width + 'px';
                    screenshotContainer.style.height = 'auto'; // Allow height to adjust to content
                    screenshotContainer.style.minHeight = 'auto'; // Remove min-height restriction

                    // Display notification
                    const platformNames = {
                        'twitter-x': 'Twitter/X',
                        'facebook': 'Facebook',
                        'instagram': 'Instagram Post',
                        'instagram-story': 'Instagram Story',
                        'linkedin': 'LinkedIn',
                        'reddit': 'Reddit',
                        'pinterest': 'Pinterest',
                        'tiktok': 'TikTok',
                        'youtube': 'YouTube'
                    };

                    Toastify({
                        text: `Width set for ${platformNames[preset]} (${dimensions.width}px). Height is now auto-adaptive.`,
                        duration: 2500,
                        gravity: "top",
                        position: "center",
                        style: {
                            background: "linear-gradient(to right, #00b09b, #96c93d)",
                            borderRadius: "8px",
                            fontSize: "14px"
                        }
                    }).showToast();
                }
            }
        });
    }

    // Enhanced error handling function
    const showExportError = (error) => {
        const errorMessage = error.message || 'An unexpected error occurred';

        Toastify({
            text: `Export failed: ${errorMessage}`,
            duration: 5000,
            gravity: "bottom",
            position: "center",
            style: {
                background: "#ef4444",
                borderRadius: "8px",
                fontSize: "14px"
            },
            onClick: () => {
                // Offer help on click
                Toastify({
                    text: "Try refreshing the page or using a different browser",
                    duration: 3000,
                    gravity: "bottom",
                    position: "center",
                    style: { background: "#6b7280" }
                }).showToast();
            }
        }).showToast();
    };

    // Export function - only if button exists
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            const content = codeEditor.innerText || codeEditor.textContent || '';

            if (!content.trim()) {
                Toastify({
                    text: "Please enter some Markdown content first",
                    duration: 3000,
                    gravity: "bottom",
                    position: "center",
                    style: {
                        background: "#ef4444",
                        borderRadius: "8px",
                        fontSize: "14px"
                    }
                }).showToast();
                return;
            }

            // Store original styles to restore them later
            const originalOverflow = codeEditor.style.overflow;
            const originalColor = codeEditor.style.color;
            const resizeHandle = document.getElementById('resize-handle'); // Get reference to resize handle
            const originalResizeHandleDisplay = resizeHandle ? resizeHandle.style.display : ''; // Store its original display

            try {
                const format = exportFormat.value;
                const scale = parseFloat(exportScale.value);

                // Disable button during export
                downloadBtn.disabled = true;
                downloadBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" x2="12" y1="15" y2="3"/>
                    </svg>
                    Generating...
                `;

                // --- PRE-CAPTURE FIXES ---
                // 1. Ensure editor is fully expanded and hide scrollbar for capture
                autoResizeEditor();
                codeEditor.style.overflow = 'hidden';

                // 2. Force the computed text color as an inline style to ensure it's captured
                const computedColor = window.getComputedStyle(codeEditor).color;
                codeEditor.style.color = computedColor;

                // 3. Hide the resize handle
                if (resizeHandle) {
                    resizeHandle.style.display = 'none';
                }
                // --- END PRE-CAPTURE FIXES ---


                // Use Snapdom to capture the screenshot container
                await exportWithSnapdom(format, scale);

                Toastify({
                    text: "Image exported successfully!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "center",
                    style: { background: "#10b981" }
                }).showToast();

            } catch (error) {
                console.error('Export error:', error);
                Toastify({
                    text: "Export failed. Please try again.",
                    duration: 3000,
                    gravity: "bottom",
                    position: "center",
                    style: { background: "#ef4444" }
                }).showToast();
            } finally {
                // --- POST-CAPTURE RESTORE ---
                // Restore original styles to not affect the live editor
                codeEditor.style.overflow = originalOverflow;
                codeEditor.style.color = originalColor;
                if (resizeHandle) {
                    resizeHandle.style.display = originalResizeHandleDisplay;
                }
                // --- END POST-CAPTURE RESTORE ---

                // Re-enable button
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" x2="12" y1="15" y2="3"/>
                    </svg>
                    Download Screenshot
                `;
            }
        });
    }

    // --- Template and Style Functions ---
    const getBackgroundColors = (template) => {
        const templates = {
            // 匹配HTML选项值
            'modern-light': ['#667eea', '#764ba2'],        // 紫色渐变
            'dark-code': ['#1a1a1a', '#2d2d2d'],          // 暗色渐变
            'github-style': ['#ffd89b', '#19547b'],        // 温暖日落渐变
            'gradient': ['#ffecd2', '#fcb69f'],            // 桃色渐变
            'minimal': ['#e0e0e0', '#f5f5f5'],            // 浅灰渐变

            // 保留现代渐变选项以备将来使用
            'gradient-sunset': ['#ff6b6b', '#feca57'],
            'gradient-ocean': ['#48dbfb', '#0abde3'],
            'gradient-forest': ['#00d2d3', '#55a3ff'],
            'gradient-lavender': ['#f093fb', '#f5576c'],
            'gradient-midnight': ['#2c3e50', '#3498db'],
            'gradient-aurora': ['#667eea', '#764ba2'],
            'gradient-cherry': ['#eb3349', '#f45c43'],
            'gradient-mint': ['#00b09b', '#96c93d'],
            'gradient-warm': ['#ff9a9e', '#fecfef'],
            'gradient-cool': ['#a8edea', '#fed6e3']
        };
        return templates[template] || templates['modern-light'];
    };

    const getCardStyles = (template) => {
        const styles = {
            // 匹配HTML选项值 - 重新设计为真正有区别的样式
            'modern-light': {
                bg: '#ffffff',
                color: '#1a1a1a',
                border: '1px solid #e1e4e8',
                shadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
            },     // 真正的浅色现代风格
            'dark-code': {
                bg: '#0d1117',
                color: '#e6edf3',
                border: '1px solid #30363d',
                shadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            },        // 经典暗色代码风格
            'github-style': {
                bg: '#ffffff',
                color: '#24292f',
                border: '1px solid #d0d7de',
                shadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
            },     // GitHub的浅色主题
            'gradient': {
                bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                shadow: '0 8px 32px rgba(240, 147, 251, 0.3)'
            },    // 粉色渐变卡片
            'minimal': {
                bg: '#fafbfc',
                color: '#24292f',
                border: '1px solid #e1e4e8',
                shadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            },          // 极简浅色风格

            // 保留原始卡片样式以备将来使用
            'card-dark': { bg: '#1a1a1a', color: '#ffffff' },
            'card-light': { bg: '#ffffff', color: '#1a1a1a' },
            'card-glass': { bg: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' },
            'card-gradient': { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#ffffff' }
        };
        return styles[template] || styles['modern-light'];
    };

    // --- Snapdom Export Function ---
    const exportWithSnapdom = async (format, scale) => {
        // Check if Snapdom is available
        if (typeof snapdom === 'undefined') {
            console.error('Snapdom library not loaded. Current window.snapdom:', window.snapdom);
            throw new Error('Snapdom library is not loaded. Please check your internet connection and try again.');
        }

        // Capture the screenshot container (which includes background and card)
        const element = screenshotContainer;

        // Configure Snapdom options
        const options = {
            scale: scale,
            width: element.offsetWidth,
            height: element.offsetHeight,
            embedFonts: true,
            useProxy: true,
            // Custom filtering to exclude resize handle
            exclude: (node) => {
                return node.classList && node.classList.contains('resize-handle');
            }
        };

        let filename = `markdown-code-screenshot-${Date.now()}`;

        try {
            // Use Snapdom shortcut methods based on format
            let imageElement;
            switch (format) {
                case 'png':
                    imageElement = await snapdom.toPng(element, options);
                    downloadImageElement(imageElement, filename + '.png');
                    break;
                case 'webp':
                    imageElement = await snapdom.toWebp(element, options);
                    downloadImageElement(imageElement, filename + '.webp');
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            console.error('Snapdom export error:', error);
            // Fallback to traditional method if Snapdom fails
            throw new Error(`Snapdom export failed: ${error.message}`);
        }
    };

    // Helper function to download HTMLImageElement from Snapdom
    const downloadImageElement = (imageElement, filename) => {
        try {
            // Create a canvas to convert the image to blob
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = imageElement.naturalWidth || imageElement.width;
            canvas.height = imageElement.naturalHeight || imageElement.height;

            // Draw the image to canvas
            ctx.drawImage(imageElement, 0, 0);

            // Convert canvas to blob and download
            canvas.toBlob((blob) => {
                if (blob) {
                    downloadBlobDirect(blob, filename);
                } else {
                    throw new Error('Failed to convert image to blob');
                }
            }, getMimeType(filename));
        } catch (error) {
            console.error('Image download error:', error);
            throw new Error(`Failed to download image: ${error.message}`);
        }
    };

    // Helper function to download files
    const downloadBlob = (data, filename) => {
        let blob;

        // Handle different data types from Snapdom
        if (data instanceof Blob) {
            blob = data;
        } else if (typeof data === 'string') {
            // Handle SVG string data
            blob = new Blob([data], { type: 'image/svg+xml' });
        } else if (data && data.arrayBuffer) {
            // Handle other data types that might be returned
            data.arrayBuffer().then(buffer => {
                blob = new Blob([buffer], { type: getMimeType(filename) });
                downloadBlobDirect(blob, filename);
            });
            return;
        } else {
            console.error('Unexpected data type:', data);
            throw new Error('Unable to process export data');
        }

        downloadBlobDirect(blob, filename);
    };

    const downloadBlobDirect = (blob, filename) => {
        try {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error('Download error:', error);
            throw new Error(`Failed to download file: ${error.message}`);
        }
    };

    const getMimeType = (filename) => {
        const extension = filename.split('.').pop().toLowerCase();
        switch (extension) {
            case 'png': return 'image/png';
            case 'svg': return 'image/svg+xml';
            case 'webp': return 'image/webp';
            default: return 'application/octet-stream';
        }
    };

    // Placeholder functionality for contentEditable div - only if codeEditor exists
    if (codeEditor) {
        const updatePlaceholder = () => {
            const placeholder = codeEditor.getAttribute('data-placeholder');
            if (placeholder && (codeEditor.innerText.trim() === '' || codeEditor.textContent.trim() === '')) {
                codeEditor.classList.add('empty');
            } else {
                codeEditor.classList.remove('empty');
            }
        };

        codeEditor.addEventListener('input', updatePlaceholder);
        codeEditor.addEventListener('focus', updatePlaceholder);
        codeEditor.addEventListener('blur', updatePlaceholder);

        // Initialize
        updatePreview();
        updatePlaceholder();

        // 初始化模板样式
        initializeTemplateStyles();

        // 初始化字体大小和行高
        initializeTypographyStyles();

        // 初始化宽度调整手柄
        initializeResizeHandle();
    }

    // 调试函数
    // 移除调试函数，直接修复原始手柄

    // 初始化模板样式函数
    function initializeTemplateStyles() {
        if (bgTemplateSelect) {
            const screenshotContainer = document.getElementById('screenshot-container');
            if (screenshotContainer) {
                screenshotContainer.className = `screenshot-container bg-${bgTemplateSelect.value}`;
            }
        }

        if (templateSelect) {
            const screenshotWorkspace = document.getElementById('screenshot-workspace');
            if (screenshotWorkspace) {
                screenshotWorkspace.className = `screenshot-workspace template-${templateSelect.value}`;
            }
        }
    }

    // 初始化字体大小和行高样式函数
    function initializeTypographyStyles() {
        if (codeEditor) {
            // Set default font size
            if (fontSize) {
                const selectedFontSize = fontSize.value;
                codeEditor.style.fontSize = selectedFontSize + 'px';
            }

            // Set default line height
            if (lineHeight) {
                const selectedLineHeight = lineHeight.value;
                codeEditor.style.lineHeight = selectedLineHeight;
            }
        }
    }

    // --- Width Resize Functionality ---
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    function initializeResizeHandle() {
        if (!resizeHandle || !screenshotContainer) return;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = screenshotContainer.offsetWidth;

            screenshotContainer.classList.add('resizing');
            document.body.style.cursor = 'ew-resize';
            e.preventDefault();
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const deltaX = e.clientX - startX;
        const newWidth = Math.max(600, Math.min(2000, startWidth + deltaX)); // Min 600px, Max 2000px

        screenshotContainer.style.width = `${newWidth}px`;
        // 清除固定高度以允许内容自适应，但保持最小高度
        const currentMinHeight = screenshotContainer.style.minHeight;
        if (!currentMinHeight) {
            screenshotContainer.style.minHeight = '400px';
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            if (screenshotContainer) {
                screenshotContainer.classList.remove('resizing');
            }
            document.body.style.cursor = 'default';
        }
    });

    // Touch support for mobile devices
    if (resizeHandle) {
        resizeHandle.addEventListener('touchstart', (e) => {
            isResizing = true;
            startX = e.touches[0].clientX;
            startWidth = screenshotContainer.offsetWidth;

            screenshotContainer.classList.add('resizing');
            e.preventDefault();
        });
    }

    document.addEventListener('touchmove', (e) => {
        if (!isResizing) return;

        const deltaX = e.touches[0].clientX - startX;
        const newWidth = Math.max(600, Math.min(2000, startWidth + deltaX)); // Min 600px, Max 2000px

        screenshotContainer.style.width = `${newWidth}px`;
        // 清除固定高度以允许内容自适应，但保持最小高度
        const currentMinHeight = screenshotContainer.style.minHeight;
        if (!currentMinHeight) {
            screenshotContainer.style.minHeight = '400px';
        }
    });

    document.addEventListener('touchend', () => {
        if (isResizing) {
            isResizing = false;
            if (screenshotContainer) {
                screenshotContainer.classList.remove('resizing');
            }
        }
    });
});