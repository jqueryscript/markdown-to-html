document.addEventListener('DOMContentLoaded', function () {
    const convertBtn = document.getElementById('convert-button');
    const markdownInput = document.getElementById('markdown-input');

    if (!convertBtn || !markdownInput) {
        console.error('Required elements not found.');
        return;
    }

    // Initialize Showdown converter
    const converter = new showdown.Converter();

    convertBtn.addEventListener('click', () => {
        const markdownText = markdownInput.value.trim();

        if (!markdownText) {
            Toastify({
                text: "Please enter some Markdown text first.",
                duration: 3000,
                gravity: "top",
                position: 'center',
                backgroundColor: "#ef4444",
                stopOnFocus: true,
            }).showToast();
            return;
        }

        try {
            // 1. Convert Markdown to HTML
            const htmlString = converter.makeHtml(markdownText);

            // 2. Create complete DOCX package with proper structure
            const zip = new JSZip();

            // Add required Office Open XML files
            zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
    <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`);

            zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

            zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);

            // Add numbering definitions for lists
            zip.file("word/numbering.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:abstractNum w:abstractNumId="0">
        <w:nsid w:val="FFFFFFFE"/>
        <w:multiLevelType w:val="hybridMultilevel"/>
        <w:lvl w:ilvl="0">
            <w:start w:val="1"/>
            <w:numFmt w:val="bullet"/>
            <w:lvlText w:val="•"/>
            <w:lvlJc w:val="left"/>
            <w:pPr>
                <w:ind w:left="720" w:hanging="360"/>
            </w:pPr>
        </w:lvl>
    </w:abstractNum>
    <w:abstractNum w:abstractNumId="1">
        <w:nsid w:val="FFFFFFFD"/>
        <w:multiLevelType w:val="hybridMultilevel"/>
        <w:lvl w:ilvl="0">
            <w:start w:val="1"/>
            <w:numFmt w:val="decimal"/>
            <w:lvlText w:val="%1."/>
            <w:lvlJc w:val="left"/>
            <w:pPr>
                <w:ind w:left="720" w:hanging="360"/>
            </w:pPr>
        </w:lvl>
    </w:abstractNum>
    <w:num w:numId="1">
        <w:abstractNumId w:val="0"/>
    </w:num>
    <w:num w:numId="2">
        <w:abstractNumId w:val="1"/>
    </w:num>
</w:numbering>`);

            // Add styles definitions
            zip.file("word/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:docDefaults>
        <w:rPrDefault>
            <w:rPr>
                <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
                <w:sz w:val="22"/>
                <w:szCs w:val="22"/>
                <w:lang w:val="en-US" w:eastAsia="zh-CN" w:bidi="ar-SA"/>
            </w:rPr>
        </w:rPrDefault>
        <w:pPrDefault>
            <w:pPr>
                <w:spacing w:after="200" w:line="276" w:lineRule="auto"/>
            </w:pPr>
        </w:pPrDefault>
    </w:docDefaults>

    <w:style w:type="paragraph" w:styleId="Normal">
        <w:name w:val="Normal"/>
        <w:qFormat/>
        <w:rPr>
            <w:sz w:val="22"/>
            <w:szCs w:val="22"/>
        </w:rPr>
    </w:style>

    <w:style w:type="paragraph" w:styleId="Heading1">
        <w:name w:val="heading 1"/>
        <w:basedOn w:val="Normal"/>
        <w:next w:val="Normal"/>
        <w:qFormat/>
        <w:rPr>
            <w:b/>
            <w:bCs/>
            <w:sz w:val="32"/>
            <w:szCs w:val="32"/>
        </w:rPr>
        <w:pPr>
            <w:spacing w:before="480" w:after="120"/>
            <w:outlineLvl w:val="0"/>
        </w:pPr>
    </w:style>

    <w:style w:type="paragraph" w:styleId="Heading2">
        <w:name w:val="heading 2"/>
        <w:basedOn w:val="Normal"/>
        <w:next w:val="Normal"/>
        <w:qFormat/>
        <w:rPr>
            <w:b/>
            <w:bCs/>
            <w:sz w:val="26"/>
            <w:szCs w:val="26"/>
        </w:rPr>
        <w:pPr>
            <w:spacing w:before="360" w:after="120"/>
            <w:outlineLvl w:val="1"/>
        </w:pPr>
    </w:style>

    <w:style w:type="paragraph" w:styleId="Heading3">
        <w:name w:val="heading 3"/>
        <w:basedOn w:val="Normal"/>
        <w:next w:val="Normal"/>
        <w:qFormat/>
        <w:rPr>
            <w:b/>
            <w:bCs/>
            <w:sz w:val="24"/>
            <w:szCs w:val="24"/>
        </w:rPr>
        <w:pPr>
            <w:spacing w:before="240" w:after="120"/>
            <w:outlineLvl w:val="2"/>
        </w:pPr>
    </w:style>

    <w:style w:type="paragraph" w:styleId="Heading4">
        <w:name w:val="heading 4"/>
        <w:basedOn w:val="Normal"/>
        <w:next w:val="Normal"/>
        <w:qFormat/>
        <w:rPr>
            <w:b/>
            <w:bCs/>
            <w:sz w:val="22"/>
            <w:szCs w:val="22"/>
        </w:rPr>
        <w:pPr>
            <w:spacing w:before="120" w:after="120"/>
            <w:outlineLvl w:val="3"/>
        </w:pPr>
    </w:style>

    <w:style w:type="character" w:styleId="Strong">
        <w:name w:val="Strong"/>
        <w:rPr>
            <w:b/>
            <w:bCs/>
        </w:rPr>
    </w:style>

    <w:style w:type="character" w:styleId="Emphasis">
        <w:name w:val="Emphasis"/>
        <w:rPr>
            <w:i/>
            <w:iCs/>
        </w:rPr>
    </w:style>

    <w:style w:type="character" w:styleId="Code">
        <w:name w:val="Code"/>
        <w:rPr>
            <w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/>
            <w:sz w:val="20"/>
            <w:szCs w:val="20"/>
        </w:rPr>
    </w:style>
</w:styles>`);

            // Create main document content with proper styling
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlString;

            // Process HTML elements and convert to proper Word XML with styling
            const wordContent = processHtmlToWordXml(tempDiv);

            zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        ${wordContent}
        <w:sectPr>
            <w:pgSz w:w="12240" w:h="15840"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
            <w:cols w:space="720"/>
            <w:docGrid w:linePitch="360"/>
        </w:sectPr>
    </w:body>
</w:document>`);

            // 3. Generate the DOCX file
            zip.generateAsync({type: "blob"}).then(function(content) {
                // Use FileSaver if available, otherwise fallback to basic download
                if (typeof saveAs === 'function') {
                    saveAs(content, 'document.docx');
                } else {
                    // Fallback download method
                    const url = URL.createObjectURL(content);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'document.docx';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }

                Toastify({
                    text: "Conversion successful! Downloading...",
                    duration: 3000,
                    gravity: "top",
                    position: 'center',
                    backgroundColor: "#22c55e",
                    stopOnFocus: true,
                }).showToast();
            }).catch(function(error) {
                console.error('DOCX generation failed:', error);
                Toastify({
                    text: "Failed to generate DOCX file. Please check the console.",
                    duration: 5000,
                    gravity: "top",
                    position: 'center',
                    backgroundColor: "#ef4444",
                    stopOnFocus: true,
                }).showToast();
            });

        } catch (error) {
            console.error('Conversion failed:', error);
            Toastify({
                text: "An error occurred during conversion. Please check the console.",
                duration: 5000,
                gravity: "top",
                position: 'center',
                backgroundColor: "#ef4444",
                stopOnFocus: true,
            }).showToast();
        }
    });

    function processHtmlToWordXml(element) {
        let result = '';
        const children = Array.from(element.childNodes);

        for (const child of children) {
            if (child.nodeType === Node.TEXT_NODE) {
                const text = child.textContent.trim();
                if (text) {
                    result += `<w:p>
                        <w:pPr>
                            <w:spacing w:after="200"/>
                        </w:pPr>
                        <w:r>
                            <w:t>${escapeXml(text)}</w:t>
                        </w:r>
                    </w:p>`;
                }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                switch (child.tagName.toLowerCase()) {
                    case 'h1':
                        result += `<w:p>
                            <w:pPr>
                                <w:spacing w:before="480" w:after="120"/>
                                <w:outlineLvl w:val="0"/>
                            </w:pPr>
                            <w:r>
                                <w:rPr>
                                    <w:b/>
                                    <w:sz w:val="32"/>
                                </w:rPr>
                                <w:t>${escapeXml(child.textContent)}</w:t>
                            </w:r>
                        </w:p>`;
                        break;

                    case 'h2':
                        result += `<w:p>
                            <w:pPr>
                                <w:spacing w:before="360" w:after="120"/>
                                <w:outlineLvl w:val="1"/>
                            </w:pPr>
                            <w:r>
                                <w:rPr>
                                    <w:b/>
                                    <w:sz w:val="26"/>
                                </w:rPr>
                                <w:t>${escapeXml(child.textContent)}</w:t>
                            </w:r>
                        </w:p>`;
                        break;

                    case 'h3':
                        result += `<w:p>
                            <w:pPr>
                                <w:spacing w:before="240" w:after="120"/>
                                <w:outlineLvl w:val="2"/>
                            </w:pPr>
                            <w:r>
                                <w:rPr>
                                    <w:b/>
                                    <w:sz w:val="24"/>
                                </w:rPr>
                                <w:t>${escapeXml(child.textContent)}</w:t>
                            </w:r>
                        </w:p>`;
                        break;

                    case 'h4':
                    case 'h5':
                    case 'h6':
                        result += `<w:p>
                            <w:pPr>
                                <w:spacing w:before="120" w:after="120"/>
                                <w:outlineLvl w:val="3"/>
                            </w:pPr>
                            <w:r>
                                <w:rPr>
                                    <w:b/>
                                    <w:sz w:val="22"/>
                                </w:rPr>
                                <w:t>${escapeXml(child.textContent)}</w:t>
                            </w:r>
                        </w:p>`;
                        break;

                    case 'p':
                        result += `<w:p>
                            <w:pPr>
                                <w:spacing w:after="200"/>
                            </w:pPr>
                            <w:r>
                                <w:t>${escapeXml(child.textContent)}</w:t>
                            </w:r>
                        </w:p>`;
                        break;

                    case 'strong':
                    case 'b':
                        result += `<w:p>
                            <w:r>
                                <w:rPr>
                                    <w:b/>
                                </w:rPr>
                                <w:t>${escapeXml(child.textContent)}</w:t>
                            </w:r>
                        </w:p>`;
                        break;

                    case 'em':
                    case 'i':
                        result += `<w:p>
                            <w:r>
                                <w:rPr>
                                    <w:i/>
                                </w:rPr>
                                <w:t>${escapeXml(child.textContent)}</w:t>
                            </w:r>
                        </w:p>`;
                        break;

                    case 'code':
                        result += `<w:p>
                            <w:r>
                                <w:rPr>
                                    <w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/>
                                </w:rPr>
                                <w:t>${escapeXml(child.textContent)}</w:t>
                            </w:r>
                        </w:p>`;
                        break;

                    case 'ul':
                        const listItems = Array.from(child.querySelectorAll('li'));
                        listItems.forEach(item => {
                            result += `<w:p>
                                <w:pPr>
                                    <w:numPr>
                                        <w:ilvl w:val="0"/>
                                        <w:numId w:val="1"/>
                                    </w:numPr>
                                </w:pPr>
                                <w:r>
                                    <w:t>${escapeXml(item.textContent)}</w:t>
                                </w:r>
                            </w:p>`;
                        });
                        break;

                    case 'ol':
                        const orderedItems = Array.from(child.querySelectorAll('li'));
                        orderedItems.forEach((item, index) => {
                            result += `<w:p>
                                <w:pPr>
                                    <w:numPr>
                                        <w:ilvl w:val="0"/>
                                        <w:numId w:val="2"/>
                                    </w:numPr>
                                </w:pPr>
                                <w:r>
                                    <w:t>${index + 1}. ${escapeXml(item.textContent)}</w:t>
                                </w:r>
                            </w:p>`;
                        });
                        break;

                    case 'blockquote':
                        result += `<w:p>
                            <w:pPr>
                                <w:ind w:left="720" w:right="0"/>
                                <w:shd w:val="clear" w:color="auto" w:fill="F0F0F0"/>
                            </w:pPr>
                            <w:r>
                                <w:t>${escapeXml(child.textContent)}</w:t>
                            </w:r>
                        </w:p>`;
                        break;

                    default:
                        // Recursively process child elements
                        result += processHtmlToWordXml(child);
                        break;
                }
            }
        }

        return result;
    }

    function escapeXml(unsafe) {
        return unsafe.replace(/[<>&'"\\]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                case '\\': return '\\';
                default: return c;
            }
        });
    }
});