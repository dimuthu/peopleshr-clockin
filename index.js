const puppeteer = require('puppeteer');
const cron = require('node-cron');

domain = "https://ismapac.peopleshr.com";
loginUrl = `${domain}/security/login`;
widgetUrl = `${domain}/widgets/home/index`;

const location = {
  'coords': {
    accuracy: 21,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: 6.9358082,
    longitude: 8365654,
    speed: null
  }
};

const userName = "";
const password = "";

const punchIn = async () => {
  const browser = await puppeteer.launch({headless: true});

  //first login to the HR system
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(loginUrl, { waitUntil: ['networkidle2'] });

  await page.type('[name="UserName"]', userName);
  await page.type('[name="Password"]', password);
  await page.click('[name="btnsubmit"]');
  await page.waitForNavigation();

  const context = browser.defaultBrowserContext();
  await context.overridePermissions(domain, ['geolocation']);
  
  await page.evaluateOnNewDocument(function () {
		navigator.geolocation.getCurrentPosition = function (cb) {
			setTimeout(() => {
				cb(location)
			}, 1000)
		}
	});

  await page.goto(widgetUrl,{waitUntil:'networkidle2'});
  await page.click('.ManSwipe');
  await page.waitFor(10000);
  await browser.close();
};

//punch in at 8.30
cron.schedule('30 8 * * mon,tue,wed,thu,fri', () =>{
  console.log('clock in at 8.30AM');
  punchIn();
});

//punch out at 5.30
cron.schedule('30 17 * * mon,tue,wed,thu,fri', () =>{
  console.log('clock out at 5.30AM');
  punchIn();
});
