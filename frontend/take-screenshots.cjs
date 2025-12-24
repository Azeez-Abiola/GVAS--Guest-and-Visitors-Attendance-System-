const puppeteer = require('puppeteer');
const path = require('path');

async function takeScreenshots() {
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const baseUrl = 'http://localhost:5173';
    const screenshotsDir = path.join(__dirname, 'public', 'images', 'manual');

    const fs = require('fs');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const credentials = [
        { role: 'admin', email: 'admin@uachouse.com', password: 'Admin123!', route: '/admin' },
        { role: 'reception', email: 'reception1@uachouse.com', password: 'Reception123!', route: '/reception' },
        { role: 'host', email: 'host.floor1@uachouse.com', password: 'Host123!', route: '/approvals' },
        { role: 'security', email: 'security@uachouse.com', password: 'Security123!', route: '/security' }
    ];

    for (const cred of credentials) {
        console.log(`Taking screenshot for ${cred.role}...`);
        await page.goto(`${baseUrl}/login`);
        await page.waitForSelector('input[type="email"]');

        await page.type('input[type="email"]', cred.email);
        await page.type('input[type="password"]', cred.password);
        await page.click('button[type="submit"]');

        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        // Wait a bit more for animations to finish
        await new Promise(r => setTimeout(r, 2000));

        await page.screenshot({ path: path.join(screenshotsDir, `${cred.role}_dashboard.png`) });

        // Logout for next user
        await page.evaluate(() => sessionStorage.clear());
        await page.evaluate(() => localStorage.clear());
    }

    // Also take login page screenshot
    await page.goto(`${baseUrl}/login`);
    await page.waitForSelector('h1');
    await page.screenshot({ path: path.join(screenshotsDir, `login_page.png`) });

    await browser.close();
    console.log('Screenshots taken successfully!');
}

takeScreenshots().catch(err => {
    console.error('Error taking screenshots:', err);
    process.exit(1);
});
