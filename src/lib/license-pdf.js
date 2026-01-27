// License PDF Generator using PDFKit
// This creates a professional license agreement PDF

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
  // Dynamic import for server-side only
  const PDFDocument = (await import('pdfkit')).default

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `License Agreement - ${beatTitle}`,
          Author: 'TR Productions',
          Subject: 'Beat License Agreement',
          Keywords: 'license, beat, music, agreement'
        }
      })

      const chunks = []
      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const purple = '#8B5CF6'
      const dark = '#1a1a1a'
      const gray = '#666666'

      // Header
      doc
        .fontSize(28)
        .fillColor(purple)
        .text('TR', 50, 50, { continued: true })
        .fillColor(dark)
        .text(' Productions')

      doc
        .fontSize(10)
        .fillColor(gray)
        .text('Music Production & Licensing', 50, 85)

      doc.moveDown(2)

      // Title
      doc
        .fontSize(20)
        .fillColor(dark)
        .text('BEAT LICENSE AGREEMENT', { align: 'center' })

      doc.moveDown(0.5)

      doc
        .fontSize(12)
        .fillColor(purple)
        .text(licenseType.toUpperCase(), { align: 'center' })

      doc.moveDown(2)

      // Order Details Box
      const boxTop = doc.y
      doc
        .rect(50, boxTop, 495, 120)
        .fillAndStroke('#f8f8f8', '#e0e0e0')

      doc.fillColor(dark)
      doc.fontSize(10)

      const col1 = 70
      const col2 = 300

      doc.text('Order ID:', col1, boxTop + 20)
      doc.font('Helvetica-Bold').text(orderId, col2, boxTop + 20)

      doc.font('Helvetica').text('Beat Title:', col1, boxTop + 40)
      doc.font('Helvetica-Bold').text(beatTitle, col2, boxTop + 40)

      doc.font('Helvetica').text('Licensee:', col1, boxTop + 60)
      doc.font('Helvetica-Bold').text(customerEmail, col2, boxTop + 60)

      doc.font('Helvetica').text('Purchase Date:', col1, boxTop + 80)
      doc.font('Helvetica-Bold').text(purchaseDate, col2, boxTop + 80)

      doc.font('Helvetica').text('License Type:', col1, boxTop + 100)
      doc.font('Helvetica-Bold').fillColor(purple).text(licenseType, col2, boxTop + 100)

      doc.y = boxTop + 140

      // License Terms
      doc.moveDown(1)
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor(dark)
        .text('LICENSE TERMS & CONDITIONS')

      doc.moveDown(0.5)
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .strokeColor(purple)
        .stroke()

      doc.moveDown(1)
      doc.font('Helvetica').fontSize(10).fillColor(dark)

      // Rights Granted
      doc.font('Helvetica-Bold').text('1. RIGHTS GRANTED')
      doc.moveDown(0.3)
      doc.font('Helvetica')

      if (exclusive) {
        doc.text('The Licensor grants to the Licensee EXCLUSIVE rights to use the beat. Upon purchase, this beat will be removed from sale and will not be licensed to any other party.')
      } else {
        doc.text('The Licensor grants to the Licensee NON-EXCLUSIVE rights to use the beat. The Licensor retains the right to license this beat to other parties.')
      }

      doc.moveDown(1)

      // Usage Rights
      doc.font('Helvetica-Bold').text('2. USAGE RIGHTS')
      doc.moveDown(0.3)
      doc.font('Helvetica')

      const usageRights = [
        `• Streaming Limit: ${streams} streams across all platforms`,
        `• Music Videos: ${exclusive || licenseType.includes('Unlimited') ? 'Unlimited' : 'Up to 1'} music video(s)`,
        `• Radio Broadcasting: ${exclusive ? 'Unlimited' : 'Non-commercial only'}`,
        `• Live Performances: ${exclusive ? 'Unlimited' : 'Permitted with credit'}`
      ]

      usageRights.forEach(right => {
        doc.text(right)
        doc.moveDown(0.2)
      })

      doc.moveDown(0.8)

      // Credit Requirements
      doc.font('Helvetica-Bold').text('3. CREDIT REQUIREMENTS')
      doc.moveDown(0.3)
      doc.font('Helvetica')

      if (creditRequired) {
        doc.text('The Licensee MUST credit "TR Productions" or "Prod. by TR" in the song title, description, and any official credits. Example: "Song Title (Prod. by TR)"')
      } else {
        doc.text('No credit is required for this license, although credit is always appreciated.')
      }

      doc.moveDown(1)

      // Included Files
      doc.font('Helvetica-Bold').text('4. INCLUDED FILES')
      doc.moveDown(0.3)
      doc.font('Helvetica')

      const fileDescriptions = {
        mp3: '• MP3 File (320kbps) - Ready for streaming',
        wav: '• WAV File (24-bit) - High quality for mixing',
        stems: '• Stems Package - Individual tracks for full control'
      }

      files.forEach(file => {
        if (fileDescriptions[file]) {
          doc.text(fileDescriptions[file])
          doc.moveDown(0.2)
        }
      })

      doc.moveDown(0.8)

      // Restrictions
      doc.font('Helvetica-Bold').text('5. RESTRICTIONS')
      doc.moveDown(0.3)
      doc.font('Helvetica')

      const restrictions = [
        '• The beat cannot be resold, transferred, or sub-licensed',
        '• The beat cannot be used in content that promotes hate or violence',
        '• The beat cannot be registered with a content ID service without permission',
        exclusive ? '• No restrictions on commercial use with this license' : '• This beat cannot be used for commercial advertisements without additional licensing'
      ]

      restrictions.forEach(restriction => {
        doc.text(restriction)
        doc.moveDown(0.2)
      })

      // Footer
      doc.moveDown(2)
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .strokeColor('#e0e0e0')
        .stroke()

      doc.moveDown(1)
      doc.fontSize(9).fillColor(gray)
      doc.text('This license agreement is legally binding upon purchase. By using this beat, you agree to all terms and conditions stated above.', { align: 'center' })

      doc.moveDown(1)
      doc.fontSize(8)
      doc.text(`Generated: ${new Date().toISOString()} | © ${new Date().getFullYear()} TR Productions`, { align: 'center' })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
