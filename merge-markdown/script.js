document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const dropArea = document.getElementById("drop-area");
    const fileUploadInput = document.getElementById("file-upload");
    const downloadMarkdownBtn = document.getElementById("download-markdown");
    const fileListDisplay = document.getElementById("file-list");
    const fileListContainer = document.getElementById("file-list-container");
    const sidebar = document.getElementById("sidebar");
    const menuButton = document.getElementById("menu-button");
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    const toolsDropdown = document.getElementById("tools-dropdown");
    const toolsDropdownMenu = document.getElementById("tools-dropdown-menu");
    const mobileToolsButton = document.getElementById("mobile-tools-button");
    const mobileToolsMenu = document.getElementById("mobile-tools-menu");
    const mobileToolsArrow = document.getElementById("mobile-tools-arrow");

    // State for merged Markdown content
    let mergedMarkdownContent = "";

    // Set initial button state to disabled
    downloadMarkdownBtn.disabled = true;

    // Sidebar Toggle Function
    const toggleSidebar = () => {
        sidebar.classList.toggle("-translate-x-full");
        sidebarOverlay.classList.toggle("hidden");
    };
    if (menuButton && sidebar && sidebarOverlay) {
        menuButton.addEventListener("click", toggleSidebar);
        sidebarOverlay.addEventListener("click", toggleSidebar);
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

    // Handle multiple file uploads and merging
    const handleMultipleFiles = (files) => {
        if (files.length === 0) {
            mergedMarkdownContent = "";
            fileListDisplay.textContent = "";
            fileListContainer.classList.add("hidden");
            downloadMarkdownBtn.disabled = true;
            return;
        }

        const filePromises = [];
        const validFileNames = [];

        for (const file of files) {
            if (file.type === "text/markdown" || file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
                validFileNames.push(file.name);
                filePromises.push(file.text());
            } else {
                Toastify({ text: `Skipped non-Markdown file: ${file.name}`, className: "toast-warning" }).showToast();
            }
        }
        
        if(validFileNames.length === 0) {
            Toastify({ text: "No valid .md files selected.", className: "toast-error" }).showToast();
            mergedMarkdownContent = "";
            fileListDisplay.textContent = "";
            fileListContainer.classList.add("hidden");
            downloadMarkdownBtn.disabled = true;
            return;
        }

        fileListDisplay.textContent = validFileNames.join(', ');
        fileListContainer.classList.remove("hidden");

        Promise.all(filePromises)
            .then(contents => {
                mergedMarkdownContent = contents.join('\n\n---\n\n'); // Correctly join files with a separator
                downloadMarkdownBtn.disabled = false; // Explicitly enable the button
                Toastify({ text: `Successfully merged ${validFileNames.length} files.`, className: "toast-success" }).showToast();
            })
            .catch(error => {
                console.error("Error reading files:", error);
                Toastify({ text: "Error reading one or more files.", className: "toast-error" }).showToast();
                mergedMarkdownContent = "";
                downloadMarkdownBtn.disabled = true;
            });
    };

    // Event Listeners
    fileUploadInput.addEventListener("change", (e) => handleMultipleFiles(e.target.files));
    
    dropArea.addEventListener("dragenter", e => { e.preventDefault(); dropArea.classList.add("bg-indigo-100"); });
    dropArea.addEventListener("dragover", e => { e.preventDefault(); });
    dropArea.addEventListener("dragleave", () => { dropArea.classList.remove("bg-indigo-100"); });
    dropArea.addEventListener("drop", e => { e.preventDefault(); dropArea.classList.remove("bg-indigo-100"); handleMultipleFiles(e.dataTransfer.files); });
    dropArea.addEventListener("click", () => fileUploadInput.click());

    // Button actions
    downloadMarkdownBtn.addEventListener("click", () => {
        if (!mergedMarkdownContent || downloadMarkdownBtn.disabled) return;
        const blob = new Blob([mergedMarkdownContent], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "merged.md";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Toastify({ text: "Merged Markdown downloaded!", className: "toast-success" }).showToast();
    });

    // FAQ Accordion
    document.querySelectorAll(".faq-question").forEach(question => {
        question.addEventListener("click", () => {
            const answer = question.nextElementSibling;
            const parentItem = question.parentElement;
            const isOpen = parentItem.classList.contains("open");

            // Close all other FAQ items
            document.querySelectorAll(".faq-item").forEach(item => {
                if (item !== parentItem) {
                    item.classList.remove("open");
                    item.querySelector(".faq-answer").style.maxHeight = null;
                    item.querySelector(".faq-icon-plus").classList.remove("hidden");
                    item.querySelector(".faq-icon-minus").classList.add("hidden");
                }
            });

            // Toggle the clicked item
            if (isOpen) {
                parentItem.classList.remove("open");
                answer.style.maxHeight = null;
                question.querySelector(".faq-icon-plus").classList.remove("hidden");
                question.querySelector(".faq-icon-minus").classList.add("hidden");
            } else {
                parentItem.classList.add("open");
                answer.style.maxHeight = answer.scrollHeight + "px";
                question.querySelector(".faq-icon-plus").classList.add("hidden");
                question.querySelector(".faq-icon-minus").classList.remove("hidden");
            }
        });
    });

});