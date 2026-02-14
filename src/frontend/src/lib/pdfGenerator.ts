// Enhanced professional PDF generator with parish logo, biblical quote, and auto-print functionality

import type { Event, ParishFunctionAssignment, ParishFunctionLocalityAssignment, BaptismRecord, Parishioner, IndividualOffering, LocalityWithParishioners, ParishNote, StatisticEntry, Letter } from '../backend';

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
          <p class="footer-text">© ${new Date().getFullYear()} Parafia Świętego Jana Chrzciciela w Zbroszy Dużej</p>
          <p class="copyright">Wygenerowano z miłością przy użyciu <a href="https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}" style="color: #b8860b; text-decoration: none;">caffeine.ai</a></p>
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
          width: 100%;
          background: white;
        }
        
        /* Header with logo - centered */
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
        
        /* Letter title - centered, enlarged and bold */
        .letter-title {
          font-size: 20pt;
          font-weight: 700;
          color: #1e293b;
          margin: 30px 0 20px;
          text-align: center;
        }
        
        /* Letter body - left aligned, full width */
        .letter-body {
          font-size: 12pt;
          line-height: 1.4;
          color: #1e293b;
          text-align: left;
          white-space: pre-wrap;
          margin: 30px 0;
          width: 100%;
        }
        
        /* Signature block - shifted to the right */
        .signature-block {
          margin-top: 50px;
          margin-left: 50%;
          text-align: left;
          width: 50%;
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
            width: 100%;
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
        <div class="letter-body">${escapeHtml(letter.body)}</div>
        
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
 * Generates PDF certificate for a single baptism record
 */
export function generateBaptismCertificatePDF(record: BaptismRecord): void {
  const baptismDate = new Date(Number(record.baptismDate) / 1000000);
  const today = new Date();
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Create HTML document for baptism certificate
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Świadectwo Chrztu Świętego - ${record.personFullName}</title>
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
          line-height: 1.6;
          color: #1e293b;
          background: white;
          padding: 25mm;
        }
        
        .certificate-container {
          width: 100%;
          background: white;
        }
        
        /* Header with logo - centered */
        .certificate-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .parish-logo {
          width: 35mm;
          height: 35mm;
          margin: 0 auto 15px;
          display: block;
        }
        
        .parish-name {
          font-size: 14pt;
          font-weight: 600;
          color: #1e3a8a;
          margin: 10px 0 5px;
        }
        
        .parish-locality {
          font-size: 12pt;
          color: #475569;
          margin-bottom: 20px;
        }
        
        .certificate-title {
          font-size: 20pt;
          font-weight: 700;
          color: #1e3a8a;
          margin: 20px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        /* Content sections */
        .certificate-content {
          margin: 30px 0;
        }
        
        .section {
          margin: 20px 0;
        }
        
        .section-title {
          font-size: 12pt;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .field {
          margin: 8px 0;
          font-size: 11pt;
          line-height: 1.5;
        }
        
        .field-label {
          font-weight: 600;
          color: #475569;
        }
        
        .field-value {
          color: #1e293b;
        }
        
        /* Footer with signature */
        .certificate-footer {
          margin-top: 50px;
          padding-top: 20px;
        }
        
        .issue-info {
          font-size: 11pt;
          margin-bottom: 30px;
        }
        
        .signature-area {
          margin-top: 40px;
          text-align: right;
        }
        
        .signature-line {
          border-top: 1px solid #1e293b;
          width: 200px;
          margin: 0 0 5px auto;
          padding-top: 5px;
          font-size: 10pt;
          color: #64748b;
        }
        
        .seal-area {
          margin-top: 30px;
          text-align: left;
        }
        
        .seal-placeholder {
          border: 1px dashed #94a3b8;
          width: 80mm;
          height: 40mm;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10pt;
          color: #94a3b8;
          font-style: italic;
        }
        
        /* Print-specific styles */
        @media print {
          body {
            padding: 0;
          }
          
          .certificate-container {
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="certificate-container">
        <!-- Header -->
        <div class="certificate-header">
          <img src="/assets/generated/parish-logo.dim_300x300.png" alt="Logo Parafii" class="parish-logo" />
          <div class="parish-name">Parafia Świętego Jana Chrzciciela</div>
          <div class="parish-locality">Zbroszą Duża</div>
          <h1 class="certificate-title">Świadectwo Chrztu Świętego</h1>
        </div>
        
        <!-- Content -->
        <div class="certificate-content">
          <!-- Act Data -->
          <div class="section">
            <div class="section-title">Dane aktu</div>
            ${record.actNumber ? `<div class="field"><span class="field-label">Numer aktu chrztu:</span> <span class="field-value">${escapeHtml(record.actNumber)}</span></div>` : ''}
            <div class="field"><span class="field-label">Data chrztu:</span> <span class="field-value">${formatDate(baptismDate)}</span></div>
            ${record.baptismPlace ? `<div class="field"><span class="field-label">Miejsce chrztu:</span> <span class="field-value">${escapeHtml(record.baptismPlace)}</span></div>` : ''}
          </div>
          
          <!-- Baptized Person Data -->
          <div class="section">
            <div class="section-title">Dane ochrzczonego</div>
            <div class="field"><span class="field-label">Imię i nazwisko:</span> <span class="field-value">${escapeHtml(record.personFullName)}</span></div>
            ${record.birthDate ? `<div class="field"><span class="field-label">Data urodzenia:</span> <span class="field-value">${escapeHtml(record.birthDate)}</span></div>` : ''}
            ${record.birthPlace ? `<div class="field"><span class="field-label">Miejsce urodzenia:</span> <span class="field-value">${escapeHtml(record.birthPlace)}</span></div>` : ''}
          </div>
          
          <!-- Natural Parents -->
          ${record.father.fullName || record.mother.fullName ? `
          <div class="section">
            <div class="section-title">Rodzice naturalni</div>
            ${record.father.fullName ? `<div class="field"><span class="field-label">Ojciec:</span> <span class="field-value">${escapeHtml(record.father.fullName)}</span></div>` : ''}
            ${record.mother.fullName ? `<div class="field"><span class="field-label">Matka:</span> <span class="field-value">${escapeHtml(record.mother.fullName)}</span></div>` : ''}
          </div>
          ` : ''}
          
          <!-- Later Annotations (only non-empty) -->
          ${(record.annotations.confirmation || record.annotations.marriage || record.annotations.ordination || record.annotations.profession || record.annotations.generalNotes) ? `
          <div class="section">
            <div class="section-title">Adnotacje późniejsze</div>
            ${record.annotations.confirmation ? `<div class="field"><span class="field-label">Bierzmowanie:</span> <span class="field-value">${escapeHtml(record.annotations.confirmation)}</span></div>` : ''}
            ${record.annotations.marriage ? `<div class="field"><span class="field-label">Małżeństwo:</span> <span class="field-value">${escapeHtml(record.annotations.marriage)}</span></div>` : ''}
            ${record.annotations.ordination ? `<div class="field"><span class="field-label">Święcenia:</span> <span class="field-value">${escapeHtml(record.annotations.ordination)}</span></div>` : ''}
            ${record.annotations.profession ? `<div class="field"><span class="field-label">Profesja zakonna:</span> <span class="field-value">${escapeHtml(record.annotations.profession)}</span></div>` : ''}
            ${record.annotations.generalNotes ? `<div class="field"><span class="field-label">Uwagi ogólne:</span> <span class="field-value">${escapeHtml(record.annotations.generalNotes)}</span></div>` : ''}
          </div>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div class="certificate-footer">
          <div class="issue-info">
            Wydano dnia: ${formatDate(today)}
          </div>
          
          <div class="signature-area">
            <div class="signature-line">Podpis proboszcza</div>
          </div>
          
          <div class="seal-area">
            <div class="seal-placeholder">Miejsce na pieczęć parafialną</div>
          </div>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

/**
 * Generates PDF list of all baptism records
 */
export function generateBaptismRegistryListPDF(records: BaptismRecord[]): void {
  let content = `KSIĘGA CHRZTÓW\n\n`;
  content += `Liczba aktów: ${records.length}\n\n`;
  content += '─'.repeat(90) + '\n\n';

  records.forEach((record, idx) => {
    const baptismDate = new Date(Number(record.baptismDate) / 1000000);
    const formattedDate = baptismDate.toLocaleDateString('pl-PL');
    
    content += `${(idx + 1).toString().padStart(3, ' ')}. ${record.personFullName}\n`;
    content += `     Akt nr: ${record.actNumber}\n`;
    content += `     Data chrztu: ${formattedDate}\n`;
    content += `     Miejsce chrztu: ${record.baptismPlace}\n`;
    if (record.birthDate) {
      content += `     Data urodzenia: ${record.birthDate}\n`;
    }
    if (record.father.fullName) {
      content += `     Ojciec: ${record.father.fullName}\n`;
    }
    if (record.mother.fullName) {
      content += `     Matka: ${record.mother.fullName}\n`;
    }
    content += '\n';
  });

  generateParishPDF({
    title: 'KSIĘGA CHRZTÓW',
    content,
    footer: 'Dokument wygenerowany automatycznie'
  });
}

/**
 * Generates PDF for a single parishioner
 */
export function generateSingleParishionerPDF(parishioner: Parishioner, offerings: IndividualOffering[]): void {
  let content = `KARTA PARAFIANINA\n\n`;
  content += `${parishioner.firstName} ${parishioner.lastName}\n\n`;
  content += '─'.repeat(90) + '\n\n';

  if (parishioner.birthYear) {
    content += `Rok urodzenia: ${Number(parishioner.birthYear)}\n`;
  }
  if (parishioner.address) {
    content += `Adres: ${parishioner.address}\n`;
  }
  if (parishioner.phone) {
    content += `Telefon: ${parishioner.phone}\n`;
  }
  if (parishioner.email) {
    content += `Email: ${parishioner.email}\n`;
  }
  if (parishioner.profession) {
    content += `Zawód: ${parishioner.profession}\n`;
  }

  content += '\n';

  // Sacraments
  content += 'SAKRAMENTY:\n';
  if (parishioner.sacraments.birthYear) {
    content += `  Rok urodzenia: ${Number(parishioner.sacraments.birthYear)}\n`;
  }
  if (parishioner.sacraments.baptismYear) {
    content += `  Rok chrztu: ${Number(parishioner.sacraments.baptismYear)}\n`;
  }
  if (parishioner.sacraments.communionYear) {
    content += `  Rok I Komunii: ${Number(parishioner.sacraments.communionYear)}\n`;
  }
  if (parishioner.sacraments.confirmationYear) {
    content += `  Rok bierzmowania: ${Number(parishioner.sacraments.confirmationYear)}\n`;
  }
  if (parishioner.sacraments.marriageYear) {
    content += `  Rok ślubu: ${Number(parishioner.sacraments.marriageYear)}\n`;
  }
  if (parishioner.sacraments.funeralYear) {
    content += `  Rok pogrzebu: ${Number(parishioner.sacraments.funeralYear)}\n`;
  }

  content += '\n';

  // Family
  if (parishioner.family.length > 0) {
    content += `RODZINA (${parishioner.family.length} osób):\n`;
    parishioner.family.forEach((member, idx) => {
      const relationType = member.relationType === 'spouse' ? 'Małżonek' :
                          member.relationType === 'child' ? 'Dziecko' : 'Inny';
      content += `  ${idx + 1}. ${member.name} (${relationType})\n`;
    });
    content += '\n';
  }

  // Offerings
  if (offerings.length > 0) {
    content += `OFIARY (${offerings.length}):\n`;
    offerings.forEach((offer) => {
      content += `  • ${Number(offer.year)}: ${Number(offer.amount)} zł - ${offer.description}\n`;
    });
    content += '\n';
  }

  // Pastoral notes
  if (parishioner.pastoralNotes) {
    content += `UWAGI DUSZPASTERSKIE:\n${parishioner.pastoralNotes}\n\n`;
  }

  generateParishPDF({
    title: 'KARTA PARAFIANINA',
    subtitle: `${parishioner.firstName} ${parishioner.lastName}`,
    content,
    footer: 'Dokument wygenerowany automatycznie'
  });
}

/**
 * Generates PDF for a single locality
 */
export function generateSingleLocalityPDF(locality: LocalityWithParishioners): void {
  let content = `MIEJSCOWOŚĆ: ${locality.name}\n\n`;
  content += '─'.repeat(90) + '\n\n';

  content += `Osoba kontaktowa: ${locality.contactPerson}\n`;
  content += `Telefon: ${locality.phone}\n`;
  content += `Liczba parafian: ${Number(locality.totalParishioners)}\n`;
  content += `Liczba mieszkańców (z rodziną): ${locality.residents.length}\n\n`;

  if (locality.tasks.length > 0) {
    content += `ZADANIA (${locality.tasks.length}):\n`;
    locality.tasks.forEach((task, idx) => {
      content += `  ${idx + 1}. ${task}\n`;
    });
    content += '\n';
  }

  if (locality.residents.length > 0) {
    content += `MIESZKAŃCY:\n`;
    locality.residents.forEach((resident, idx) => {
      const type = resident.isFamilyMember ? ' (członek rodziny)' : '';
      content += `  ${idx + 1}. ${resident.name}${type}\n`;
    });
  }

  generateParishPDF({
    title: 'MIEJSCOWOŚĆ',
    subtitle: locality.name,
    content,
    footer: 'Dokument wygenerowany automatycznie'
  });
}

/**
 * Generates PDF list of all localities
 */
export function generateLocalitiesListPDF(localities: LocalityWithParishioners[]): void {
  let content = `MIEJSCOWOŚCI\n\n`;
  content += `Liczba miejscowości: ${localities.length}\n\n`;
  content += '─'.repeat(90) + '\n\n';

  localities.forEach((locality, idx) => {
    content += `${(idx + 1).toString().padStart(3, ' ')}. ${locality.name}\n`;
    content += `     Osoba kontaktowa: ${locality.contactPerson}\n`;
    content += `     Telefon: ${locality.phone}\n`;
    content += `     Liczba parafian: ${Number(locality.totalParishioners)}\n`;
    content += `     Liczba mieszkańców (z rodziną): ${locality.residents.length}\n`;
    if (locality.tasks.length > 0) {
      content += `     Zadania: ${locality.tasks.length}\n`;
    }
    content += '\n';
  });

  generateParishPDF({
    title: 'MIEJSCOWOŚCI',
    content,
    footer: 'Dokument wygenerowany automatycznie'
  });
}

/**
 * Generates PDF for a single event
 */
export function generateSingleEventPDF(event: Event): void {
  const eventDate = new Date(Number(event.timestamp) / 1000000);
  const formattedDate = eventDate.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let content = `WYDARZENIE\n\n`;
  content += `${event.title}\n\n`;
  content += '─'.repeat(90) + '\n\n';

  content += `Data: ${formattedDate}\n\n`;
  content += `Opis:\n${event.description}\n\n`;

  if (event.tasks.length > 0) {
    content += `ZADANIA (${event.tasks.length}):\n`;
    event.tasks.forEach((task, idx) => {
      content += `  ${idx + 1}. ${task.description}\n`;
      if (task.assignedParishioners.length > 0) {
        content += `     Przypisani parafianie: ${task.assignedParishioners.length}\n`;
      }
    });
  }

  generateParishPDF({
    title: 'WYDARZENIE',
    subtitle: event.title,
    content,
    footer: 'Dokument wygenerowany automatycznie'
  });
}

/**
 * Generates PDF for a single parish note
 */
export function generateSingleParishNotePDF(note: ParishNote): void {
  const noteDate = new Date(Number(note.timestamp) / 1000000);
  const formattedDate = noteDate.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let content = `UWAGA\n\n`;
  content += `${note.title}\n\n`;
  content += '─'.repeat(90) + '\n\n';

  content += `Data: ${formattedDate}\n\n`;
  content += `Treść:\n${note.content}\n`;

  generateParishPDF({
    title: 'UWAGA PARAFIALNA',
    subtitle: note.title,
    content,
    footer: 'Dokument wygenerowany automatycznie'
  });
}

/**
 * Generates PDF for a single statistic entry
 */
export function generateSingleStatisticEntryPDF(entry: StatisticEntry): void {
  const entryDate = new Date(Number(entry.timestamp) / 1000000);
  const formattedDate = entryDate.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let content = `STATYSTYKA\n\n`;
  content += `Data: ${formattedDate}\n\n`;
  content += '─'.repeat(90) + '\n\n';

  content += `Frekwencja niedzielna: ${Number(entry.sundayAttendance)}\n`;
  content += `Liczba komunii: ${Number(entry.communionCount)}\n`;

  generateParishPDF({
    title: 'STATYSTYKA',
    subtitle: formattedDate,
    content,
    footer: 'Dokument wygenerowany automatycznie'
  });
}

/**
 * Generates PDF for a single parish function assignment
 */
export function generateSingleParishFunctionAssignmentPDF(assignment: ParishFunctionAssignment): void {
  let content = `FUNKCJA PARAFIALNA\n\n`;
  content += `${assignment.title}\n\n`;
  content += '─'.repeat(90) + '\n\n';

  content += `Opis: ${assignment.description}\n`;
  content += `Adres: ${assignment.address}\n`;
  content += `Przypisany parafianin ID: ${Number(assignment.assignedParishioner)}\n\n`;

  if (assignment.contacts.length > 0) {
    content += `KONTAKTY:\n`;
    assignment.contacts.forEach((contact, idx) => {
      content += `  ${idx + 1}. ${contact}\n`;
    });
  }

  generateParishPDF({
    title: 'FUNKCJA PARAFIALNA',
    subtitle: assignment.title,
    content,
    footer: 'Dokument wygenerowany automatycznie'
  });
}

/**
 * Generates PDF for a single parish function locality assignment
 */
export function generateSingleParishFunctionLocalityAssignmentPDF(assignment: ParishFunctionLocalityAssignment): void {
  let content = `FUNKCJA PARAFIALNA - MIEJSCOWOŚĆ\n\n`;
  content += `${assignment.localityName}\n\n`;
  content += '─'.repeat(90) + '\n\n';

  content += `Opis: ${assignment.description}\n`;
  content += `Przypisani parafianie: ${assignment.assignedParishioners.length}\n\n`;

  if (assignment.contacts.length > 0) {
    content += `KONTAKTY:\n`;
    assignment.contacts.forEach((contact, idx) => {
      content += `  ${idx + 1}. ${contact}\n`;
    });
  }

  generateParishPDF({
    title: 'FUNKCJA PARAFIALNA - MIEJSCOWOŚĆ',
    subtitle: assignment.localityName,
    content,
    footer: 'Dokument wygenerowany automatycznie'
  });
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
