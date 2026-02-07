// Enhanced professional PDF generator with parish logo, biblical quote, and auto-print functionality

import type { Event, ParishFunctionAssignment, ParishFunctionLocalityAssignment } from '../backend';

export interface PDFOptions {
  title: string;
  subtitle?: string;
  content: string;
  footer?: string;
}

/**
 * Generates a professional HTML-based PDF document with parish branding
 * Includes logo, biblical quote, and automatically opens print dialog
 */
export function generateParishPDF(options: PDFOptions): void {
  const { title, subtitle, content, footer } = options;
  
  const date = new Date().toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create HTML document with parish branding
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @page {
          size: A4;
          margin: 2cm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 1.6;
          color: #1e293b;
          background: white;
          padding: 20px;
        }
        
        .document-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
        }
        
        /* Header with logo and branding */
        .document-header {
          text-align: center;
          padding: 30px 20px;
          border-bottom: 3px solid #1e3a8a;
          margin-bottom: 30px;
          background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
        }
        
        .parish-logo {
          width: 120px;
          height: 120px;
          margin: 0 auto 20px;
          display: block;
        }
        
        .biblical-quote {
          font-style: italic;
          color: #b8860b;
          font-size: 14px;
          margin: 15px 0;
          padding: 10px 20px;
          border-left: 3px solid #b8860b;
          background: #fffbf0;
          text-align: left;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .parish-name {
          font-size: 16px;
          color: #1e3a8a;
          font-weight: 600;
          margin-top: 15px;
          letter-spacing: 0.5px;
        }
        
        .document-title {
          font-size: 28px;
          font-weight: bold;
          color: #1e3a8a;
          margin: 20px 0 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .document-subtitle {
          font-size: 20px;
          color: #475569;
          margin-bottom: 15px;
          font-weight: 500;
        }
        
        .generation-date {
          font-size: 13px;
          color: #64748b;
          margin-top: 10px;
        }
        
        /* Main content area */
        .document-content {
          padding: 20px;
          min-height: 400px;
        }
        
        .content-text {
          white-space: pre-wrap;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.8;
          color: #334155;
        }
        
        /* Footer */
        .document-footer {
          margin-top: 40px;
          padding: 20px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
          background: #f8fafc;
        }
        
        .footer-text {
          font-size: 12px;
          color: #64748b;
          margin: 5px 0;
        }
        
        .footer-custom {
          font-size: 13px;
          color: #475569;
          font-style: italic;
          margin-bottom: 15px;
        }
        
        .copyright {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 10px;
        }
        
        /* Print-specific styles */
        @media print {
          body {
            padding: 0;
          }
          
          .document-container {
            max-width: 100%;
          }
          
          .document-header {
            page-break-after: avoid;
          }
          
          .document-content {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="document-container">
        <!-- Header with Parish Branding -->
        <div class="document-header">
          <img src="/assets/generated/parish-logo.dim_300x300.png" alt="Logo Parafii" class="parish-logo" />
          
          <div class="biblical-quote">
            "Ja chrzczę wodą, On zaś chrzcić was będzie Duchem Świętym" (Mk 1,8)
          </div>
          
          <div class="parish-name">
            Parafia Świętego Jana Chrzciciela w Zbroszy Dużej
          </div>
          
          <h1 class="document-title">${title}</h1>
          ${subtitle ? `<h2 class="document-subtitle">${subtitle}</h2>` : ''}
          <p class="generation-date">Data wygenerowania: ${date}</p>
        </div>
        
        <!-- Main Content -->
        <div class="document-content">
          <div class="content-text">${escapeHtml(content)}</div>
        </div>
        
        <!-- Footer -->
        <div class="document-footer">
          ${footer ? `<p class="footer-custom">${footer}</p>` : ''}
          <p class="footer-text">© 2025 Parafia Świętego Jana Chrzciciela w Zbroszy Dużej</p>
          <p class="copyright">Wygenerowano z miłością przy użyciu <a href="https://caffeine.ai" style="color: #b8860b; text-decoration: none;">caffeine.ai</a></p>
        </div>
      </div>
      
      <script>
        // Automatically open print dialog when document loads
        window.onload = function() {
          // Small delay to ensure content is fully rendered
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    console.error('Failed to open print window. Please check popup blocker settings.');
  }
}

/**
 * Generates PDF for official correspondence letters with special formatting
 */
export function generateLetterPDF(letter: { number: string; title: string; body: string; timestamp: bigint }): void {
  const date = new Date(Number(letter.timestamp) / 1000000).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create HTML document with special letter formatting
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${letter.number} - ${letter.title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4 portrait;
          margin: 25mm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'EB Garamond', 'Georgia', serif;
          line-height: 1.4;
          color: #1e293b;
          background: white;
          padding: 25mm;
        }
        
        .letter-container {
          max-width: 65%;
          margin: 0 auto;
          background: white;
        }
        
        /* Header with logo */
        .letter-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .parish-logo {
          width: 35mm;
          height: 35mm;
          margin: 0 auto 20px;
          display: block;
        }
        
        .biblical-quote {
          font-style: italic;
          color: #1e293b;
          font-size: 12pt;
          margin: 20px 0;
          text-align: center;
        }
        
        /* Letter title - enlarged and bold */
        .letter-title {
          font-size: 20pt;
          font-weight: 700;
          color: #1e293b;
          margin: 30px 0 20px;
          text-align: center;
        }
        
        /* Letter body - center aligned */
        .letter-body {
          font-size: 12pt;
          line-height: 1.4;
          color: #1e293b;
          text-align: center;
          white-space: pre-wrap;
          margin: 30px 0;
        }
        
        /* Signature block - center aligned */
        .signature-block {
          margin-top: 50px;
          text-align: center;
        }
        
        .signature-line {
          font-size: 12pt;
          margin: 5px 0;
        }
        
        .signature-name {
          font-style: italic;
          margin-top: 10px;
        }
        
        /* Print-specific styles */
        @media print {
          body {
            padding: 0;
          }
          
          .letter-container {
            max-width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="letter-container">
        <!-- Header with Parish Logo -->
        <div class="letter-header">
          <img src="/assets/generated/parish-logo.dim_300x300.png" alt="Logo Parafii" class="parish-logo" />
          
          <div class="biblical-quote">
            "On musi wzrastać, ja zaś się umniejszać." (J 3, 30)
          </div>
        </div>
        
        <!-- Letter Title -->
        <div class="letter-title">
          ${escapeHtml(letter.title)}
        </div>
        
        <!-- Letter Body -->
        <div class="letter-body">
${escapeHtml(letter.body)}
        </div>
        
        <!-- Signature Block -->
        <div class="signature-block">
          <div class="signature-line">Z ufnością w Boże miłosierdzie</div>
          <div class="signature-line signature-name">ks. Marek Michalczyk</div>
        </div>
      </div>
      
      <script>
        // Automatically open print dialog when document loads
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    console.error('Failed to open print window. Please check popup blocker settings.');
  }
}

/**
 * Generates PDF for Events section
 */
export function generateEventsPDF(events: Event[]): void {
  const sortedEvents = [...events].sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
  
  let content = 'LISTA WYDARZEŃ PARAFIALNYCH\n';
  content += '='.repeat(80) + '\n\n';
  
  const upcomingEvents = sortedEvents.filter(e => Number(e.timestamp) > Date.now() * 1000000);
  const pastEvents = sortedEvents.filter(e => Number(e.timestamp) <= Date.now() * 1000000);
  
  if (upcomingEvents.length > 0) {
    content += 'NADCHODZĄCE WYDARZENIA\n';
    content += '-'.repeat(80) + '\n\n';
    
    upcomingEvents.forEach((event, index) => {
      const eventDate = new Date(Number(event.timestamp) / 1000000);
      content += `${index + 1}. ${event.title}\n`;
      content += `   Data: ${eventDate.toLocaleDateString('pl-PL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}\n`;
      content += `   Opis: ${event.description}\n`;
      
      if (event.tasks.length > 0) {
        content += `   Zadania:\n`;
        event.tasks.forEach((task, taskIdx) => {
          content += `     ${taskIdx + 1}. ${task.description}\n`;
          if (task.assignedParishioners.length > 0) {
            content += `        Przypisani parafianie: ${task.assignedParishioners.join(', ')}\n`;
          }
        });
      }
      content += '\n';
    });
  }
  
  if (pastEvents.length > 0) {
    content += '\nPRZESZŁE WYDARZENIA\n';
    content += '-'.repeat(80) + '\n\n';
    
    pastEvents.forEach((event, index) => {
      const eventDate = new Date(Number(event.timestamp) / 1000000);
      content += `${index + 1}. ${event.title}\n`;
      content += `   Data: ${eventDate.toLocaleDateString('pl-PL')}\n`;
      content += `   Opis: ${event.description}\n\n`;
    });
  }
  
  content += '\n' + '='.repeat(80) + '\n';
  content += `Łączna liczba wydarzeń: ${events.length}\n`;
  content += `Nadchodzące: ${upcomingEvents.length} | Przeszłe: ${pastEvents.length}\n`;
  
  generateParishPDF({
    title: 'Wydarzenia Parafialne',
    subtitle: `Raport z dnia ${new Date().toLocaleDateString('pl-PL')}`,
    content,
    footer: 'Dokument wygenerowany automatycznie z systemu zarządzania parafią',
  });
}

/**
 * Generates PDF for Parish Functions section
 */
export function generateParishFunctionsPDF(
  individualAssignments: ParishFunctionAssignment[],
  localityAssignments: ParishFunctionLocalityAssignment[]
): void {
  let content = 'FUNKCJE PARAFIALNE\n';
  content += '='.repeat(80) + '\n\n';
  
  if (individualAssignments.length > 0) {
    content += 'PRZYPISANIA INDYWIDUALNE\n';
    content += '-'.repeat(80) + '\n\n';
    
    individualAssignments.forEach((assignment, index) => {
      content += `${index + 1}. ${assignment.title}\n`;
      content += `   Opis: ${assignment.description}\n`;
      content += `   Adres: ${assignment.address}\n`;
      
      if (assignment.contacts.length > 0) {
        content += `   Kontakty:\n`;
        assignment.contacts.forEach((contact, cIdx) => {
          content += `     ${cIdx + 1}. ${contact}\n`;
        });
      } else {
        content += `   Kontakty: Brak\n`;
      }
      
      content += `   Przypisany parafianin ID: ${assignment.assignedParishioner}\n\n`;
    });
  }
  
  if (localityAssignments.length > 0) {
    content += '\nPRZYPISANIA WEDŁUG MIEJSCOWOŚCI\n';
    content += '-'.repeat(80) + '\n\n';
    
    localityAssignments.forEach((assignment, index) => {
      content += `${index + 1}. ${assignment.localityName}\n`;
      content += `   Opis: ${assignment.description}\n`;
      
      if (assignment.assignedParishioners.length > 0) {
        content += `   Przypisani parafianie: ${assignment.assignedParishioners.join(', ')}\n`;
      }
      
      if (assignment.contacts.length > 0) {
        content += `   Kontakty:\n`;
        assignment.contacts.forEach((contact, cIdx) => {
          content += `     ${cIdx + 1}. ${contact}\n`;
        });
      }
      content += '\n';
    });
  }
  
  content += '\n' + '='.repeat(80) + '\n';
  content += `Łączna liczba przypisań indywidualnych: ${individualAssignments.length}\n`;
  content += `Łączna liczba przypisań według miejscowości: ${localityAssignments.length}\n`;
  
  generateParishPDF({
    title: 'Funkcje Parafialne',
    subtitle: `Raport z dnia ${new Date().toLocaleDateString('pl-PL')}`,
    content,
    footer: 'Dokument wygenerowany automatycznie z systemu zarządzania parafią',
  });
}

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Legacy function for backward compatibility - now triggers the new HTML-based PDF
 */
export function downloadPDF(content: string, filename: string): void {
  // This function is kept for backward compatibility but is no longer used
  // The new generateParishPDF function handles everything including auto-print
  console.warn('downloadPDF is deprecated. Use generateParishPDF directly.');
}
