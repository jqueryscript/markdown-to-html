document.addEventListener('DOMContentLoaded', () => {
    // --- Sidebar & Dropdown JavaScript ---
    const sidebar = document.getElementById('sidebar');
    const menuButton = document.getElementById('menu-button');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const toolsDropdown = document.getElementById("tools-dropdown");
    const toolsDropdownMenu = document.getElementById("tools-dropdown-menu");
    const mobileToolsButton = document.getElementById("mobile-tools-button");
    const mobileToolsMenu = document.getElementById("mobile-tools-menu");
    const mobileToolsArrow = document.getElementById("mobile-tools-arrow");

    const toggleSidebar = () => {
        if (sidebar) sidebar.classList.toggle('-translate-x-full');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('hidden');
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

    // --- Original converter.js content starts here ---
    document.getElementById('convert-btn').addEventListener('click', () => {
        const markdownContent = document.getElementById('markdown-input').value;
        const title = document.getElementById('epub-title').value || 'Untitled';
        const author = document.getElementById('epub-author').value || 'Unknown Author';
        const publisher = document.getElementById('epub-publisher').value || 'Markdown-Gen';
        const description = document.getElementById('epub-description').value || 'Generated via Markdown-Gen';

        if (!markdownContent) {
            Toastify({ text: "Please enter some Markdown content.", duration: 3000, close: true, gravity: "top", position: "right", backgroundColor: "#ef4444" }).showToast();
            return;
        }

        const epub = new jEpub();

        // Initialize without a tocTitle to prevent default TOC generation
        epub.init({
            title: title,
            author: author,
            publisher: publisher,
            description: description,
        });

        const tokens = marked.lexer(markdownContent);
        const tocTree = [];
        const contentSections = [];
        let currentSection = { title: 'Introduction', content: [] };

        // Build a tree of headings and segment content
        tokens.forEach(token => {
            if (token.type === 'heading' && token.depth <= 3) {
                if (currentSection.content.length > 0 && currentSection.title !== 'Introduction') {
                    contentSections.push(currentSection);
                } else if (currentSection.title === 'Introduction' && currentSection.content.length > 0 && currentSection.content.some(t => t.type !== 'space')) {
                    contentSections.push(currentSection);
                }
                currentSection = { title: token.text, content: [token] };
                const newNode = { title: token.text, children: [] };
                
                if (token.depth === 1) {
                    tocTree.push(newNode);
                } else {
                    let parent = tocTree[tocTree.length - 1];
                    if (token.depth === 3 && parent && parent.children.length > 0) {
                        parent = parent.children[parent.children.length - 1];
                    }
                    if (parent) {
                        parent.children.push(newNode);
                    } else { // Orphan heading
                        tocTree.push(newNode);
                    }
                }
            } else {
                currentSection.content.push(token);
            }
        });
        contentSections.push(currentSection);

        // Add content sections to the EPUB. jEpub will assign chapter-X.xhtml filenames.
        contentSections.forEach(section => {
            if (section.title === 'Introduction' && (!section.content.length || section.content.every(t => t.type === 'space'))) return;
            section.content.links = {}; // Required by marked parser
            const html = marked.parser(section.content);
            epub.add(section.title, html);
        });

        // Generate and add the custom, nested TOC if there are headings
        if (tocTree.length > 0) {
            let chapterIndex = 1;
            const generateTocHtml = (nodes) => {
                let html = '<ol>';
                nodes.forEach(node => {
                    // The href should correspond to the order chapters were added.
                    html += `<li><a href="chapter-${chapterIndex++}.xhtml">${node.title}</a>`;
                    if (node.children.length > 0) {
                        html += generateTocHtml(node.children);
                    }
                    html += '</li>';
                });
                html += '</ol>';
                return html;
            };
            const tocContent = `<nav xmlns:epub="http://www.idpf.org/2007/ops" epub:type="toc" id="toc"><h1 class="title">Table of Contents</h1>${generateTocHtml(tocTree)}</nav>`;
            epub.add('Table of Contents', tocContent);
        }

        epub.generate('blob').then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.epub`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            Toastify({ text: "EPUB with nested TOC generated!", duration: 3000, close: true, gravity: "top", position: "right", backgroundColor: "#22c55e" }).showToast();
        }).catch(err => {
            console.error('Failed to generate EPUB:', err);
            Toastify({ text: "Error generating EPUB. See console for details.", duration: 3000, close: true, gravity: "top", position: "right", backgroundColor: "#ef4444" }).showToast();
        });
    });
    // --- Original converter.js content ends here ---
});