import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

puppeteer.use(StealthPlugin());

export async function searchKeywords(keywords) {
    const query = encodeURIComponent(keywords.join(' '));
    const url = `https://duckduckgo.com/html/?q=${query}`;

    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium',
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
        ],
        defaultViewport: { width: 1280, height: 720 },
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const results = await page.evaluate(() => {
        return [...document.querySelectorAll('.result')].slice(0, 10).map(el => ({
            title: el.querySelector('.result__title')?.innerText?.trim() || null,
            description: el.querySelector('.result__snippet')?.innerText?.trim() || null,
            url: el.querySelector('.result__url')?.innerText?.trim() || null,
        })).filter(r => r.url);
    });

    let formattedResults = results.map((r, i) => {
        return {
            title: r.title, url: r.url, description: r.description, id: `${i + 1}`
        }
    });

    await browser.close();

    return formattedResults;
}

export async function scrape(url) {
    if (!url.includes('https://')) url = `https://${url}`;

    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium',
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
        ],
        defaultViewport: { width: 1280, height: 720 },
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const html = await page.content();
    await browser.close();

    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();

    if (!article) return 'Readability could not extract content';

    return `${article.title} ${article.textContent.trim()}`;
}