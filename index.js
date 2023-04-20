const puppeteer = require('puppeteer');
(async () => {
  const email = process.argv[2];
  const password = process.argv[3];
  const planner_option = "reg%2Fadd%2Fbrowse_schedule.pl&SearchOptionDesc=Planner&SearchOptionCd=P&ViewSem=Fall+2023&KeySem=20243&AddPlannerInd="
  if (!email || !password) {
    console.error('Usage: node index.js [email] [password]');
    process.exit(1);
  }

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  // row-label push-label 
  // Navigate to Boston University login page
  await page.goto('https://student.bu.edu');
  await page.waitForNavigation({ waitUntil: 'networkidle0' }),
  await login(page, email, password);
  await page.waitForNavigation({ waitUntil: 'networkidle0' }),
  // Navigate to the course registration page
  await page.waitForSelector('.community_navigation-tileMenuItemBanner_tileMenuItemBanner.comm-tile-menu__item-title.vertical-padding.slds-text-align_center');

  // Click on the planner element and wait for navigation
  const planner = await page.waitForSelector('.community_navigation-tileMenuItemBanner_tileMenuItemBanner.comm-tile-menu__item-title.vertical-padding.slds-text-align_center');
  //await planner.click();
  //await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await Promise.all([
     // After clicking the submit
    planner.click(),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  await page.waitForTimeout(1000);
  const base_url = page.url();
  const planner_Url = base_url.split('?')[0] + '?ModuleName='+planner_option ;
  await page.goto(planner_Url);
  await page.$$eval('tr[align="center"]', (elements) => {
    elements.forEach((element) => {
      const checkbox = element.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.click(); 
      }
    });
  });
  const submitElement = await page.$('[value="Add Classes to Schedule"]');
  /*
  page.on('dialog', async dialog => {
    await dialog.accept();
  });
  */ 
  await submitElement.click();
  //console.log('tr elements with align="center" containing a checkbox:', trElementsWithCheckbox);
  // Close the browser
  //await browser.close();
})();

async function login(page, email, password) {
  page.waitForNavigation(),
  await page.type('#j_username', email);
  await page.type('#j_password', password); 
  await Promise.all([
    page.waitForNavigation(),
    page.keyboard.press('Enter'),
  ]);
}
async function registerCourses(page) {
  // Implement course registration logic
}
