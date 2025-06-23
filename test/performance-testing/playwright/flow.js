const { expect } = require('@playwright/test');

module.exports = { homePage };

async function homePage(page) {
   // Page 1
   await page.goto("https://mudblazor.com/");
   await expect(page.getByText('Star on GitHub', { exact: true })).toBeVisible({ timeout: 5000 });
   
   // Page 2
   await page.getByRole('link', { name: 'Get started' }).nth(2).click();
   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible({ timeout: 5000 });
   
   // Page 3
   await page.getByText('Explore').click();
   await expect(page.getByText('Explore MudBlazor')).toBeVisible({ timeout: 5000 });
   
   // Page 4
   await page. getByRole('link', { name: 'Reporting Bugs' }).click();
}