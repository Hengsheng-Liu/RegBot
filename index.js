const puppeteer = require('puppeteer');
const fs = require('fs');
const credentials = loadCredentials();

(async () => {
  const email = credentials.username;
  const password = credentials.password;
  const planner_option = "reg%2Fadd%2Fbrowse_schedule.pl&SearchOptionDesc=Planner&SearchOptionCd=P&ViewSem=Fall+2023&KeySem=20243&AddPlannerInd="
  if (!email || !password) {
    console.error('Username or password not provided in secrets.json');
    process.exit(1);
  }
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://student.bu.edu');
  await page.waitForNavigation({ waitUntil: 'networkidle0' }),
    await login(page, email, password);
  await GoToRegPage(page, planner_option);
  await signUp(page);
})();
function loadCredentials() {
  const data = fs.readFileSync('secrets.json', 'utf8');
  return JSON.parse(data);
}
function getCurrentTimestamp() {
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();
  return date + ' ' + time;
}
function printClass(td){
  const class_code = tdArray[2].textContent.trim();
  const seat = tdArray[5].textContent.trim();
  const class_with_professor = tdArray[3].innerText;
  const [class_name, class_professor] = class_with_professor.split("\n");
  const class_type = tdArray[7].textContent.trim();
  const class_building = tdArray[8].textContent.trim();
  const class_room = tdArray[9].textContent.trim();
  const class_date = tdArray[10].textContent.trim();
  const class_start_time = tdArray[11].textContent.trim();
  const class_end_time = tdArray[12].textContent.trim();
  console.log("Class: " + class_code + " " + class_name + " " + class_type + " " + class_professor
    + " " + class_date + " " + class_building + " " + class_room + " " + class_start_time + " " + class_end_time + " " + seat + " seats open" + "at " + getCurrentTimestamp());
}
async function login(page, email, password) {
  page.waitForNavigation(),
    await page.type('#j_username', email);
  await page.type('#j_password', password);
  await Promise.all([
    page.waitForNavigation(),
    page.keyboard.press('Enter'),
  ]);
}
async function GoToRegPage(page, planner_option) {
  await page.waitForNavigation({ waitUntil: 'networkidle0' }),
    await page.waitForSelector('.community_navigation-tileMenuItemBanner_tileMenuItemBanner.comm-tile-menu__item-title.vertical-padding.slds-text-align_center');
  const planner = await page.waitForSelector('.community_navigation-tileMenuItemBanner_tileMenuItemBanner.comm-tile-menu__item-title.vertical-padding.slds-text-align_center');
  await Promise.all([
    planner.click(),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  await page.waitForTimeout(1000);
  const base_url = page.url();
  const planner_Url = base_url.split('?')[0] + '?ModuleName=' + planner_option;
  await page.goto(planner_Url);
}

async function signUpOnce(page) {
  const checkboxExists = await page.$('input[type="checkbox"]');
  if (!checkboxExists) {
    console.log(getCurrentTimestamp()+ " " +"No classes available");
    return;
  }
  await page.$$eval('tr[align="center"]', (trElements) => {
    const trArray = [];
    trElements.forEach((trElement) => {
      trArray.push(trElement);
    });
    trArray.forEach((trElement) => {
      const tdArray = Array.from(trElement.querySelectorAll('td'));
      const checkbox = trElement.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.click();
        printClass(tdArray);
      }
    });;
  },printClass);
  ;
  const submitElement = await page.$('[value="Add Classes to Schedule"]');
  await submitElement.click();
  /*
  page.on('dialog', async dialog => {
    await dialog.accept();
  });
  */
}

async function signUp(page) {
  while (true) {
    const waitTime = credentials.waitTimeInSeconds * 1000; 
    await signUpOnce(page);
    await page.waitForTimeout(waitTime); // Replace 10000 with the desired waiting time in milliseconds
    await page.reload({ waitUntil: 'networkidle0' }); // Refresh the page
  }
}



