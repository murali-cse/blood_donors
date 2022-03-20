const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const file = require("fs");
const { Console } = require("console");

// donor details url
const donorDetail = "http://bloodhelpers.com/blood-donor-info.php?id=";

// blood helper
// a1+ blood donors list
const a1_positive =
  "http://bloodhelpers.com/search-blood-donor.php?location=433&bloodGroup=9&pageNo=";
// a+ blood donors list
const a_positivie =
  "http://bloodhelpers.com/search-blood-donor.php?location=433&bloodGroup=1&pageNo=";
// a- blood donors list
const a_negative =
  "http://bloodhelpers.com/search-blood-donor.php?location=433&bloodGroup=2&pageNo=";
// b+ blood donors list
const b_positivie =
  "http://bloodhelpers.com/search-blood-donor.php?location=433&bloodGroup=4&pageNo=";
// b- blood donors list
const b_negative =
  "http://bloodhelpers.com/search-blood-donor.php?location=433&bloodGroup=3&pageNo=";
// o+ blood donors list
const o_positivie =
  "http://bloodhelpers.com/search-blood-donor.php?location=433&bloodGroup=5&pageNo=";
// o- blood donors list
const o_negative =
  "http://bloodhelpers.com/search-blood-donor.php?location=433&bloodGroup=6&pageNo=";
// ab+ blood donors list
const ab_positivie =
  "http://bloodhelpers.com/search-blood-donor.php?location=433&bloodGroup=7&pageNo=";
// ab- blood donors list
const ab_negative =
  "http://bloodhelpers.com/search-blood-donor.php?location=433&bloodGroup=8&pageNo=";
// a1- blood donors list
const a1_negative =
  "http://bloodhelpers.com/search-blood-donor.php?location=433&bloodGroup=10&pageNo=";
// a2+ blood donors list
const a2_positive =
  "http://bloodhelpers.com/search-blood-donor.php?location=433&bloodGroup=11&pageNo=";
// a2- blood donors list
const a2_negative =
  "http://bloodhelpers.com/search-blood-donor.php?location=433&bloodGroup=12&pageNo=";
// a1b+ blood donors list
const a1b_positive =
  "http://bloodhelpers.com/search-blood-donor.php?location=433&bloodGroup=13&pageNo=";
// a1b- blood donors list
const a1b_negative =
  "http://bloodhelpers.com/search-blood-donor.php?location=433&bloodGroup=14&pageNo=";

const donorsList = [
  a1_positive,
  a_positivie,
  a_negative,
  b_positivie,
  b_negative,
  o_positivie,
  o_negative,
  ab_positivie,
  ab_negative,
  a1_negative,
  a2_positive,
  a2_negative,
  a1b_positive,
  a1b_negative,
];

// const donorsList = [b_positivie];

function forEachWithCallback(callback) {
  const arrayCopy = this;
  let index = 0;
  const next = () => {
    index++;
    if (arrayCopy.length > 0) {
      callback(arrayCopy.shift(), index, next);
    }
  };
  next();
}

Array.prototype.forEachWithCallback = forEachWithCallback;



donorsList.forEachWithCallback((element, i, next) => {
  initiate(element, next);
});

process.setMaxListeners(0);

async function initiate(group, next) {
  console.log("initiating...");
  console.log("..................................");
  console.log("group: " + group);
  console.log("..................................");
  var pageCount = 1;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0)
  await page.setDefaultTimeout(0)
  for (var itr = 1; itr <= pageCount; itr++) {
    await page.goto(group + "" + itr,{
      timeout:0,
      waitUntil: 'load'
    });

    let src = await page.content();
    let $ = cheerio.load(src);

    let pageCounts = $(".pages").children();
    pageCount = $(pageCounts[pageCounts.length - 2]).text();
    if (itr == 1) console.log("Total Pages: " + pageCount);

    console.log("Scrapped Pages: " + itr + "/" + pageCount);

    let table = $(".tint-box");
    let row = table.find("tr");
    // var i=0
    // for (var e of row) {
    //   if (i != 0) {
    //     let cols = $(e).find("td");

    //     let link = cols[5].children[1].attribs.onclick;
    //     getDonorDetail(getIdFromUrl(link)).then((detail) =>
          
    //       {
    //         console.log(detail);
    //         detail.map((val, i) => {
    //         if (detail.length - 1 == i)
    //           file.writeFileSync("donors_list.csv", val + "\n", { flag: "a" });
    //         else
    //           file.writeFileSync("donors_list.csv", val + ",", { flag: "a" });
    //       })}
    //     );
    //   }
    //   i++
    // }

    row.each(async (i,e) => {
      if (i != 0) {
        let cols = $(e).find("td");

        let link = cols[5].children[1].attribs.onclick;
        let detail = await getDonorDetail(getIdFromUrl(link));
      
        detail.map((val, i) => {
          if (detail.length - 1 == i)
            file.writeFileSync("donors_list.csv", val + "\n", { flag: "a" });
          else file.writeFileSync("donors_list.csv", val + ",", { flag: "a" });
        });
      }
    });
  }

  await browser.close();
  next();
}

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

async function getDonorDetail(id) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0)
  page.setDefaultTimeout(0)
  await page.goto(donorDetail + id,{
    timeout:0,
    waitUntil: 'load'
  });
  let src = await page.content();
  let $ = cheerio.load(src);
  let donor_detail = [];
  let table = $("table");
  let row = table.find("tr");
  let i = 0;
  for (let e of row) {
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
    i++;
  }

  await browser.close();
  return donor_detail;
}
