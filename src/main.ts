import './KgPrimaryDots-Pl0E-normal.js';
import { jsPDF } from 'jspdf';


// Self-invoking function to encapsulate the application logic
document.addEventListener('DOMContentLoaded', () => {
    (function () {
        // Get references to all the UI elements
        const fontSizeSlider = document.getElementById('font-size-slider') as HTMLInputElement;
        const fontSizeValue = document.getElementById('font-size-value') as HTMLSpanElement;
        const generatePdfBtn = document.getElementById('generate-pdf-btn') as HTMLButtonElement;
        const previewContent = document.getElementById('preview-content') as HTMLDivElement;

        // Application state
        const state = {
            text: previewContent?.textContent || '',
            fontSize: parseInt(fontSizeSlider?.value, 10),
            fontColor: '#374151',
        };

        // --- EVENT LISTENERS ---

        previewContent.addEventListener('input', (e: Event) => {
            state.text = (e.target as HTMLDivElement).textContent || '';
        });

        fontSizeSlider.addEventListener('input', (e: Event) => {
            state.fontSize = parseInt((e.target as HTMLInputElement).value, 10);
            fontSizeValue.textContent = state.fontSize.toString();
            updatePreview();
        });

        generatePdfBtn.addEventListener('click', generatePDF);

        // --- CORE FUNCTIONS ---

        /**
         * Updates the live preview area based on the current state.
         */
        function updatePreview(): void {
            const lineHeight = state.fontSize * 1.5;
            previewContent.style.fontSize = `${state.fontSize}pt`;
            previewContent.style.color = state.fontColor;
            previewContent.style.lineHeight = `${lineHeight}px`;
            previewContent.style.backgroundSize = `100% ${lineHeight}px`;
        }

        /**
         * Generates a PDF worksheet using jsPDF.
         */
        async function generatePDF(): Promise<void> {
            // Update state with current text content
            state.text = previewContent.textContent || '';
            
            const doc = new jsPDF({
                unit: 'pt',
                format: 'letter'
            });

            // Add the custom font to jsPDF
            doc.setFont('KgPrimaryDots-Pl0E');

            doc.setFontSize(state.fontSize);
            doc.setTextColor(state.fontColor);

            const page_width = doc.internal.pageSize.getWidth();
            const page_height = doc.internal.pageSize.getHeight();
            const margin = 50;
            const max_width = page_width - (margin * 2);
            const line_height = state.fontSize * 1.3;

            // Function to draw the handwriting lines.
            // y_pos represents the baseline of the text.
            const drawLines = (y_pos: number): void => {
                doc.setDrawColor('#d1eaff'); // Top line color
                doc.setLineWidth(1);
                doc.setLineDashPattern([], 0);
                const line1_y_pos = y_pos - state.fontSize * 0.61;
                doc.line(margin, line1_y_pos, page_width - margin, line1_y_pos);

                doc.setDrawColor('#e0e0e0'); // Middle guide line (dashed)
                doc.setLineDashPattern([2, 2], 0);
                const line2_y_pos = y_pos - state.fontSize * 0.355;
                doc.line(margin, line2_y_pos, page_width - margin, line2_y_pos);

                // Darker baseline
                doc.setLineDashPattern([], 0);
                doc.setDrawColor('#d1eaff');
                doc.line(margin, y_pos, page_width - margin, y_pos);

                //Descender guide line (dashed)
                doc.setDrawColor('#e0e0e0');
                doc.setLineDashPattern([2, 2], 0);
                const line4_y_pos = y_pos - (state.fontSize * (-0.18))
                doc.line(margin, line4_y_pos, page_width - margin, line4_y_pos);
            };

            let y = margin + state.fontSize;

            // --- UPDATED LOGIC ---
            // 1. Split user input by newline characters.
            const userInputLines: string[] = state.text.split('\n');

            for (const line of userInputLines) {
                // 2. For each line, let jsPDF handle the word wrapping.
                const wrappedLines: string[] = doc.splitTextToSize(line, max_width, { noWrap: true });

                for (const wrappedLine of wrappedLines) {
                    // 3. Check for page break BEFORE drawing.
                    if (y > page_height - margin) {
                        doc.addPage();
                        y = margin + state.fontSize;
                    }

                    drawLines(y);
                    doc.text(wrappedLine, margin, y);
                    y += line_height;
                }
            }

            // Open PDF in a new window instead of saving to file system
            const pdfData = doc.output('bloburl');
            window.open(pdfData, '_blank');
        }

        // Initialize the font size display
        fontSizeValue.textContent = state.fontSize.toString();
        updatePreview();
    })();
});
