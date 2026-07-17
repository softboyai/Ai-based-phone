/**
 * Report Routes
 * 
 * Generates PDF reports using PDFKit for the admin panel.
 * - GET /api/report/phones - PDF report of all phones
 * - GET /api/report/recommendations - PDF report of all recommendations
 * - GET /api/report/full - Full system report (phones + users + recommendations)
 */

const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Phone = require('../models/Phone');
const User = require('../models/User');
const Recommendation = require('../models/Recommendation');
const { isAdmin } = require('../middleware/auth');

// Inline isAdmin removed — using shared middleware above

// ============================================================
// HELPER: Draw table header
// ============================================================
function drawTableHeader(doc, headers, startX, startY, colWidths) {
    doc.fontSize(9).font('Helvetica-Bold');
    doc.fillColor('#ffffff');
    doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), 20).fill('#1a237e');
    doc.fillColor('#ffffff');
    let x = startX;
    headers.forEach((header, i) => {
        doc.text(header, x + 4, startY + 5, { width: colWidths[i] - 8, align: 'left' });
        x += colWidths[i];
    });
    doc.fillColor('#333333');
    return startY + 20;
}

// ============================================================
// HELPER: Draw table row
// ============================================================
function drawTableRow(doc, cells, startX, startY, colWidths, isEven) {
    doc.fontSize(8).font('Helvetica');
    if (isEven) {
        doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), 18).fill('#f5f5f5');
    }
    doc.fillColor('#333333');
    let x = startX;
    cells.forEach((cell, i) => {
        doc.text(String(cell), x + 4, startY + 4, { width: colWidths[i] - 8, align: 'left' });
        x += colWidths[i];
    });
    return startY + 18;
}

// ============================================================
// HELPER: Format price
// ============================================================
function fmtPrice(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ============================================================
// HELPER: Add report header
// ============================================================
function addReportHeader(doc, title) {
    // Header background
    doc.rect(0, 0, 612, 80).fill('#1a237e');
    
    // Title
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#ffffff');
    doc.text('KT Phones', 50, 20);
    doc.fontSize(10).font('Helvetica').fillColor('#ff6f00');
    doc.text('AI-Based Mobile Phone Recommendation MIS', 50, 45);
    
    // Report title
    doc.fontSize(9).fillColor('#ffffff');
    doc.text(title, 50, 62);
    
    // Date
    doc.fontSize(8).fillColor('#ffffff');
    doc.text('Generated: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(), 400, 30);
    
    doc.fillColor('#333333');
    doc.moveDown(3);
}

// ============================================================
// GET /api/report/phones - Phone Inventory Report
// ============================================================
router.get('/phones', isAdmin, async (req, res) => {
    try {
        const phones = await Phone.find().sort({ brand: 1, name: 1 });
        
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=KT_Phones_Inventory_Report.pdf');
        doc.pipe(res);
        
        // Header
        addReportHeader(doc, 'Phone Inventory Report');
        
        // Summary
        doc.y = 100;
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a237e');
        doc.text('Summary', 50);
        doc.moveDown(0.5);
        doc.fontSize(9).font('Helvetica').fillColor('#333333');
        doc.text(`Total Phones: ${phones.length}`);
        doc.text(`In Stock: ${phones.filter(p => p.inStock).length}`);
        doc.text(`Out of Stock: ${phones.filter(p => !p.inStock).length}`);
        doc.text(`Featured: ${phones.filter(p => p.featured).length}`);
        
        if (phones.length > 0) {
            const avg = Math.round(phones.reduce((s, p) => s + p.price, 0) / phones.length);
            doc.text(`Average Price: ${fmtPrice(avg)} RWF`);
        }
        
        doc.moveDown(1);
        
        // Phone table
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a237e');
        doc.text('Phone Details', 50);
        doc.moveDown(0.5);
        
        const headers = ['Name', 'Brand', 'Price (RWF)', 'RAM', 'Storage', 'Battery', 'Camera', 'Status'];
        const colWidths = [110, 60, 75, 40, 50, 55, 50, 55];
        let y = doc.y;
        
        y = drawTableHeader(doc, headers, 40, y, colWidths);
        
        phones.forEach((phone, i) => {
            if (y > 750) {
                doc.addPage();
                y = 50;
                y = drawTableHeader(doc, headers, 40, y, colWidths);
            }
            y = drawTableRow(doc, [
                phone.name,
                phone.brand,
                fmtPrice(phone.price),
                phone.ram + 'GB',
                phone.storage + 'GB',
                phone.battery + 'mAh',
                phone.camera + 'MP',
                phone.inStock ? 'In Stock' : 'Out'
            ], 40, y, colWidths, i % 2 === 0);
        });
        
        // Footer
        doc.moveDown(2);
        doc.fontSize(8).fillColor('#999999');
        doc.text('© KT Phones - AI-Based Mobile Phone Recommendation MIS', 50, 770, { align: 'center' });
        
        doc.end();
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ message: 'Error generating report' });
    }
});

// ============================================================
// GET /api/report/recommendations - Recommendations Report
// ============================================================
router.get('/recommendations', isAdmin, async (req, res) => {
    try {
        const recs = await Recommendation.find()
            .populate('userId', 'fullName email')
            .populate('recommendedPhones.phone')
            .sort({ createdAt: -1 });
        
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=KT_Phones_Recommendations_Report.pdf');
        doc.pipe(res);
        
        addReportHeader(doc, 'AI Recommendations Report');
        
        doc.y = 100;
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a237e');
        doc.text('AI Recommendation History', 50);
        doc.moveDown(0.5);
        doc.fontSize(9).font('Helvetica').fillColor('#333333');
        doc.text(`Total Recommendations: ${recs.length}`);
        doc.moveDown(1);
        
        const headers = ['User', 'Budget', 'Brand', 'Recommended Phones', 'Date'];
        const colWidths = [100, 80, 70, 170, 70];
        let y = doc.y;
        
        y = drawTableHeader(doc, headers, 40, y, colWidths);
        
        recs.forEach((rec, i) => {
            if (y > 750) {
                doc.addPage();
                y = 50;
                y = drawTableHeader(doc, headers, 40, y, colWidths);
            }
            const phones = rec.recommendedPhones.map(rp => rp.phone ? rp.phone.name : 'N/A').join(', ');
            y = drawTableRow(doc, [
                rec.userId ? rec.userId.fullName : 'Unknown',
                rec.preferences.budget,
                rec.preferences.brand,
                phones,
                new Date(rec.createdAt).toLocaleDateString()
            ], 40, y, colWidths, i % 2 === 0);
        });
        
        doc.moveDown(2);
        doc.fontSize(8).fillColor('#999999');
        doc.text('© KT Phones - AI-Based Mobile Phone Recommendation MIS', 50, 770, { align: 'center' });
        
        doc.end();
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ message: 'Error generating report' });
    }
});

// ============================================================
// GET /api/report/full - Full System Report
// ============================================================
router.get('/full', isAdmin, async (req, res) => {
    try {
        const phones = await Phone.find().sort({ brand: 1 });
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        const recs = await Recommendation.find()
            .populate('userId', 'fullName email')
            .populate('recommendedPhones.phone')
            .sort({ createdAt: -1 });
        
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=KT_Phones_Full_System_Report.pdf');
        doc.pipe(res);
        
        // Page 1: Header and Summary
        addReportHeader(doc, 'Full System Report');
        
        doc.y = 100;
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a237e');
        doc.text('System Overview', 50);
        doc.moveDown(0.5);
        
        doc.fontSize(10).font('Helvetica').fillColor('#333333');
        doc.text(`Report Date: ${new Date().toLocaleDateString()}`);
        doc.text(`System: KT Phones - AI-Based Mobile Phone Recommendation MIS`);
        doc.moveDown(1);
        
        // Stats box
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a237e');
        doc.text('Key Statistics', 50);
        doc.moveDown(0.5);
        doc.fontSize(9).font('Helvetica').fillColor('#333333');
        
        const inStock = phones.filter(p => p.inStock).length;
        const featured = phones.filter(p => p.featured).length;
        const avgPrice = phones.length > 0 ? Math.round(phones.reduce((s, p) => s + p.price, 0) / phones.length) : 0;
        const brands = {};
        phones.forEach(p => { brands[p.brand] = (brands[p.brand] || 0) + 1; });
        const topBrand = Object.entries(brands).sort((a, b) => b[1] - a[1])[0];
        
        doc.text(`• Total Phones: ${phones.length}`);
        doc.text(`• Phones In Stock: ${inStock}`);
        doc.text(`• Phones Out of Stock: ${phones.length - inStock}`);
        doc.text(`• Featured Phones: ${featured}`);
        doc.text(`• Total Users: ${users.length}`);
        doc.text(`• Admin Users: ${users.filter(u => u.role === 'admin').length}`);
        doc.text(`• Seller Users: ${users.filter(u => u.role === 'seller').length}`);
        doc.text(`• Customer Users: ${users.filter(u => u.role === 'customer').length}`);
        doc.text(`• Total AI Recommendations: ${recs.length}`);
        doc.text(`• Average Phone Price: ${fmtPrice(avgPrice)} RWF`);
        doc.text(`• Most Popular Brand: ${topBrand ? topBrand[0] + ' (' + topBrand[1] + ' phones)' : 'N/A'}`);
        
        // Page 2: Phone Inventory
        doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a237e');
        doc.text('Phone Inventory', 50, 50);
        doc.moveDown(0.5);
        
        const phoneHeaders = ['Name', 'Brand', 'Price (RWF)', 'RAM', 'Storage', 'Battery', 'Camera', 'Status'];
        const phoneColWidths = [110, 60, 75, 40, 50, 55, 50, 55];
        let y = doc.y;
        
        y = drawTableHeader(doc, phoneHeaders, 40, y, phoneColWidths);
        
        phones.forEach((phone, i) => {
            if (y > 750) {
                doc.addPage();
                y = 50;
                y = drawTableHeader(doc, phoneHeaders, 40, y, phoneColWidths);
            }
            y = drawTableRow(doc, [
                phone.name, phone.brand, fmtPrice(phone.price),
                phone.ram + 'GB', phone.storage + 'GB', phone.battery + 'mAh',
                phone.camera + 'MP', phone.inStock ? 'In Stock' : 'Out'
            ], 40, y, phoneColWidths, i % 2 === 0);
        });
        
        // Page 3: Users
        doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a237e');
        doc.text('Registered Users', 50, 50);
        doc.moveDown(0.5);
        
        const userHeaders = ['Full Name', 'Email', 'Role', 'Registered Date'];
        const userColWidths = [140, 180, 70, 100];
        y = doc.y;
        
        y = drawTableHeader(doc, userHeaders, 40, y, userColWidths);
        
        users.forEach((user, i) => {
            if (y > 750) {
                doc.addPage();
                y = 50;
                y = drawTableHeader(doc, userHeaders, 40, y, userColWidths);
            }
            y = drawTableRow(doc, [
                user.fullName, user.email, user.role,
                new Date(user.createdAt).toLocaleDateString()
            ], 40, y, userColWidths, i % 2 === 0);
        });
        
        // Page 4: Recommendations
        if (recs.length > 0) {
            doc.addPage();
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a237e');
            doc.text('AI Recommendation History', 50, 50);
            doc.moveDown(0.5);
            
            const recHeaders = ['User', 'Budget', 'Brand', 'Recommended', 'Date'];
            const recColWidths = [100, 80, 70, 170, 70];
            y = doc.y;
            
            y = drawTableHeader(doc, recHeaders, 40, y, recColWidths);
            
            recs.forEach((rec, i) => {
                if (y > 750) {
                    doc.addPage();
                    y = 50;
                    y = drawTableHeader(doc, recHeaders, 40, y, recColWidths);
                }
                const recPhones = rec.recommendedPhones.map(rp => rp.phone ? rp.phone.name : 'N/A').join(', ');
                y = drawTableRow(doc, [
                    rec.userId ? rec.userId.fullName : 'Unknown',
                    rec.preferences.budget, rec.preferences.brand,
                    recPhones, new Date(rec.createdAt).toLocaleDateString()
                ], 40, y, recColWidths, i % 2 === 0);
            });
        }
        
        // Final footer on last page
        doc.fontSize(8).fillColor('#999999');
        doc.text('© KT Phones - AI-Based Mobile Phone Recommendation MIS | Auto-generated report', 50, 770, { align: 'center' });
        
        doc.end();
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ message: 'Error generating report' });
    }
});

module.exports = router;
