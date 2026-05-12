import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import handlebars from 'handlebars';

export async function generateInvoice(data: any) {

    const templateHtml = await fs.readFile('./templates/invoice.html', 'utf8');

    const template = handlebars.compile(templateHtml);

    const finalHtml = template(data);

    const browser = await puppeteer.launch({
        headless: true
    });

    const page = await browser.newPage();

    await page.setContent(finalHtml, {
        waitUntil: 'networkidle0'
    });

    await page.pdf({
        path: `./output/${data.invoice.number}.pdf`,
        format: 'A4',
        printBackground: true
    });

    await browser.close();
}
