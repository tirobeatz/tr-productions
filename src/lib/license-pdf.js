// License PDF Generator using jsPDF (browser & server compatible)
// Generates a professional license agreement PDF

export async function generateLicensePDF({
  orderId,
  beatTitle,
  licenseType,
  customerEmail,
  purchaseDate,
  streams,
  creditRequired,
  exclusive,
  files
}) {
  // Use dynamic import for jsPDF
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let y = margin

  // Colors
  const purple = [139, 92, 246]
  const dark = [26, 26, 26]
  const gray = [102, 102, 102]

  // Helper function
  const addText = (text, x, fontSize, color, style = 'normal') => {
    doc.setFontSize(fontSize)
    doc.setTextColor(...color)
    doc.setFont('helvetica', style)
    doc.text(text, x, y)
  }

  // Header
  doc.setFontSize(24)
  doc.setTextColor(...purple)
  doc.setFont('helvetica', 'bold')
  doc.text('TR', margin, y)
  doc.setTextColor(...dark)
  doc.text(' Productions', margin + 14, y)

  y += 6
  doc.setFontSize(9)
  doc.setTextColor(...gray)
  doc.setFont('helvetica', 'normal')
  doc.text('Music Production & Licensing', margin, y)

  y += 20

  // Title
  doc.setFontSize(18)
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.text('BEAT LICENSE AGREEMENT', pageWidth / 2, y, { align: 'center' })

  y += 8
  doc.setFontSize(11)
  doc.setTextColor(...purple)
  doc.text(licenseType.toUpperCase(), pageWidth / 2, y, { align: 'center' })

  y += 15

  // Order Details Box
  doc.setFillColor(248, 248, 248)
  doc.setDrawColor(224, 224, 224)
  doc.roundedRect(margin, y, contentWidth, 45, 3, 3, 'FD')

  y += 10
  const col1 = margin + 10
  const col2 = margin + 60

  doc.setFontSize(9)
  doc.setTextColor(...gray)
  doc.setFont('helvetica', 'normal')
  doc.text('Order ID:', col1, y)
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.text(orderId, col2, y)

  y += 8
  doc.setTextColor(...gray)
  doc.setFont('helvetica', 'normal')
  doc.text('Beat Title:', col1, y)
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.text(beatTitle, col2, y)

  y += 8
  doc.setTextColor(...gray)
  doc.setFont('helvetica', 'normal')
  doc.text('Licensee:', col1, y)
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.text(customerEmail, col2, y)

  y += 8
  doc.setTextColor(...gray)
  doc.setFont('helvetica', 'normal')
  doc.text('Purchase Date:', col1, y)
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.text(purchaseDate, col2, y)

  y += 8
  doc.setTextColor(...gray)
  doc.setFont('helvetica', 'normal')
  doc.text('License Type:', col1, y)
  doc.setTextColor(...purple)
  doc.setFont('helvetica', 'bold')
  doc.text(licenseType, col2, y)

  y += 20

  // License Terms Header
  doc.setFontSize(12)
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.text('LICENSE TERMS & CONDITIONS', margin, y)

  y += 3
  doc.setDrawColor(...purple)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)

  y += 10

  // Section 1: Rights Granted
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('1. RIGHTS GRANTED', margin, y)

  y += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...dark)

  const rightsText = exclusive
    ? 'The Licensor grants to the Licensee EXCLUSIVE rights to use the beat. Upon purchase, this beat will be removed from sale and will not be licensed to any other party.'
    : 'The Licensor grants to the Licensee NON-EXCLUSIVE rights to use the beat. The Licensor retains the right to license this beat to other parties.'

  const rightsLines = doc.splitTextToSize(rightsText, contentWidth)
  doc.text(rightsLines, margin, y)
  y += rightsLines.length * 4 + 8

  // Section 2: Usage Rights
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...dark)
  doc.text('2. USAGE RIGHTS', margin, y)

  y += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  const usageRights = [
    `• Streaming Limit: ${streams} streams across all platforms`,
    `• Music Videos: ${exclusive || licenseType.includes('Unlimited') ? 'Unlimited' : 'Up to 1'} music video(s)`,
    `• Radio Broadcasting: ${exclusive ? 'Unlimited' : 'Non-commercial only'}`,
    `• Live Performances: ${exclusive ? 'Unlimited' : 'Permitted with credit'}`
  ]

  usageRights.forEach(right => {
    doc.text(right, margin, y)
    y += 5
  })

  y += 5

  // Section 3: Credit Requirements
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('3. CREDIT REQUIREMENTS', margin, y)

  y += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  const creditText = creditRequired
    ? 'The Licensee MUST credit "TR Productions" or "Prod. by TR" in the song title, description, and any official credits. Example: "Song Title (Prod. by TR)"'
    : 'No credit is required for this license, although credit is always appreciated.'

  const creditLines = doc.splitTextToSize(creditText, contentWidth)
  doc.text(creditLines, margin, y)
  y += creditLines.length * 4 + 8

  // Section 4: Included Files
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('4. INCLUDED FILES', margin, y)

  y += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  const fileDescriptions = {
    mp3: '• MP3 File (320kbps) - Ready for streaming',
    wav: '• WAV File (24-bit) - High quality for mixing',
    stems: '• Stems Package - Individual tracks for full control'
  }

  files.forEach(file => {
    if (fileDescriptions[file]) {
      doc.text(fileDescriptions[file], margin, y)
      y += 5
    }
  })

  y += 5

  // Section 5: Publishing Rights & Royalty Splits
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('5. PUBLISHING RIGHTS & ROYALTY SPLITS', margin, y)

  y += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  const pubText = 'This license includes a 20% publishing split. The Producer (TR Productions / Timo Romeo) retains 20% of the publishing/composition rights. The Licensee receives 80% of the publishing rights' + (exclusive ? ' and full ownership of the master recording.' : '.')
  const pubLines = doc.splitTextToSize(pubText, contentWidth)
  doc.text(pubLines, margin, y)
  y += pubLines.length * 4 + 2

  doc.setTextColor(...purple)
  doc.setFont('helvetica', 'bold')
  doc.text('• Producer Publishing Share: 20%', margin, y)
  y += 5
  doc.text('• Licensee Publishing Share: 80%', margin, y)
  y += 5
  if (exclusive) {
    doc.text('• Master Ownership: 100% Licensee', margin, y)
  } else {
    doc.text('• License Type: Non-Exclusive', margin, y)
  }
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'normal')

  y += 10

  // Section 6: Restrictions
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('6. RESTRICTIONS', margin, y)

  y += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  const restrictions = [
    '• The beat cannot be resold, transferred, or sub-licensed',
    '• The beat cannot be used in content that promotes hate or violence',
    '• The beat cannot be registered with a content ID service without permission',
    '• The beat cannot be used for NFTs or AI training purposes',
    exclusive ? '• No restrictions on commercial use with this license' : '• Cannot be used for commercial advertisements without additional licensing'
  ]

  restrictions.forEach(restriction => {
    const lines = doc.splitTextToSize(restriction, contentWidth)
    doc.text(lines, margin, y)
    y += lines.length * 4 + 1
  })

  y += 10

  // Footer
  doc.setDrawColor(224, 224, 224)
  doc.line(margin, y, pageWidth - margin, y)

  y += 8
  doc.setFontSize(8)
  doc.setTextColor(...gray)
  const footerText = 'This license agreement is legally binding upon purchase. By using this beat, you agree to all terms and conditions stated above.'
  const footerLines = doc.splitTextToSize(footerText, contentWidth)
  doc.text(footerLines, pageWidth / 2, y, { align: 'center' })

  y += 10
  doc.setFontSize(7)
  doc.text(`Generated: ${new Date().toISOString()} | © ${new Date().getFullYear()} TR Productions`, pageWidth / 2, y, { align: 'center' })

  // Return as buffer for email attachment
  const pdfOutput = doc.output('arraybuffer')
  return Buffer.from(pdfOutput)
}
