const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

// donor details url
const donorDetail = "http://bloodhelpers.com/blood-donor-info.php?id=";

// blood helper
// a1 positive blood donors list
const a1_positive =
  "http://bloodhelpers.com/search-blood-donor.php?location=433&bloodGroup=9&pageNo=1";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(a1_positive);
  let src = await page.content();
  let $ = cheerio.load(src);
  var donor_list = [];
  let table = $(".tint-box");
  let row = table.find("tr");
  row.each(async (i, e) => {
    if (i != 0) {
      let cols = $(e).find("td");
      
      let link = cols[5].children[1].attribs.onclick;
      let detail = await getDonorDetail(getIdFromUrl(link));
      donor_list.push(detail)
      // console.log(donor_list)
    }
  })

    console.log(donor_list);

  await browser.close();
})();

output = async (row) => {};

convertToJson = (donor_list) => {};

getIdFromUrl = (url) => {
  let id = url.split("id=")[1];
  return id.substring(0, id.length - 3);
};

getTxtFromUrl = (url) => {
  let nil = "TmlsNzliZmJmNTRkNzU3ODYwZWVjMGQzNGFiMTMzOTQwZDg%3D"; // nil
  let tmp = "NzliZmJmNTRkNzU3ODYwZWVjMGQzNGFiMTMzOTQwZDg%3D"; // -
  let txt = url.split("txt=")[1];

  if (txt == tmp) {
    return "-";
  } else if (txt == nil) {
    return "Nil";
  } else {
    return txt;
  }
};

getPhoneNumberFromBase64 = (base64) => {
  let phn = Buffer.from(base64, "base64").toString();
  return phn.substring(0, 10);
};

getDonorDetail = async (id) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(donorDetail + id);
  let src = await page.content();
  let $ = cheerio.load(src);
  let donor_detail = [];
  let table = $("table");
  let row = table.find("tr");

  row.each((i, e) => {
    let val;
    let cols = $(e).find("td");
    if (i == 1) {
      val = "https://bloodhelpers.com/" + cols[1].children[0].attribs.src;
    } else if (i == 6) {
      var base64 = getTxtFromUrl(cols[1].children[0].attribs.src);
      val = getPhoneNumberFromBase64(base64);
    } else if (i == 7) {
      val = getTxtFromUrl(cols[1].children[0].attribs.src);
    } else {
      val = cols[1].children[0].data;
    }

    donor_detail.push(val);
  });

  await browser.close();
  return donor_detail;
};
