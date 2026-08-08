const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log('Launching browser to capture proposal screenshots...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

    const outDir = path.join(__dirname, 'public/images/proposal');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    try {
        console.log('Logging in to localhost:8000...');
        await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle2' });
        
        await page.type('input[type="email"], input[name="email"]', 'admin@rt.com');
        await page.type('input[type="password"], input[name="password"]', 'password');
        
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            page.click('button[type="submit"]')
        ]);

        console.log('Successfully logged in!');

        // 1. Dashboard Admin
        console.log('Capturing Dashboard...');
        await page.goto('http://localhost:8000/dashboard', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(outDir, 'screenshot_dashboard.png') });

        // 2. Master Data Rumah (Correct route: /admin/rumah)
        console.log('Capturing Master Data Rumah (/admin/rumah)...');
        await page.goto('http://localhost:8000/admin/rumah', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(outDir, 'screenshot_rumah.png') });

        // 3. Mapping Satelit GIS (/admin/mapping-blok)
        console.log('Capturing Mapping Satelit GIS (/admin/mapping-blok)...');
        await page.goto('http://localhost:8000/admin/mapping-blok', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(outDir, 'screenshot_gis.png') });

        // 4. Audit Trail Activity Logs (/admin/activity-logs)
        console.log('Capturing Audit Trail Activity Logs...');
        await page.goto('http://localhost:8000/admin/activity-logs', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(outDir, 'screenshot_audit.png') });

        // 5. Pengaduan Warga (/admin/pengaduan)
        console.log('Capturing Pengaduan Warga...');
        await page.goto('http://localhost:8000/admin/pengaduan', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(outDir, 'screenshot_pengaduan.png') });

        // 6. Kas & Keuangan RT (/admin/kas)
        console.log('Capturing Kas & Keuangan RT...');
        await page.goto('http://localhost:8000/admin/kas', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(outDir, 'screenshot_kas.png') });

        // 7. Data KK (/admin/keluarga)
        console.log('Capturing Data KK...');
        await page.goto('http://localhost:8000/admin/keluarga', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(outDir, 'screenshot_kk.png') });

        console.log('All screenshots captured successfully!');
    } catch (err) {
        console.error('Error during screenshot capture:', err);
    } finally {
        await browser.close();
    }
})();
