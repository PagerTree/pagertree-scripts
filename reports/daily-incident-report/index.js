require('dotenv').config();

const moment = require('moment');
const rp = require('request-promise');
const Json2csvParser = require('json2csv').Parser;
const debug = require('debug')('pagertree:reports:daily-incident-report');
const fs = require('fs');


const USERNAME = process.env.PAGERTREE_USERNAME;
const PASSWORD = process.env.PAGERTREE_PASSWORD;
var AUTH_TOKEN = null;

const login = async function(){
  try{
    var login_result = await rp({
      uri: 'https://api.pagertree.com/public/login',
      method: "POST",
      body: {
        username: USERNAME,
        password: PASSWORD
      },
      headers: {
        "Content-Type": "application/json"
      },
      json: true
    });
    AUTH_TOKEN = login_result.token;
    debug(`successful login ${AUTH_TOKEN}`);
  } catch (e){
    debug(`error login`, e);
  }
}

const get_incidents = async function(){
  try{
    var one_day_ago = moment().add(-1, 'day').unix();
    var incidents = [];
    var page = 1;
    var response = null;

    do {
      response = await rp({
        uri: `https://api.pagertree.com/incident?sort=created&sortdirection=DESC&created=${one_day_ago}&ops=created:gte&page=${page}`,
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${AUTH_TOKEN}`,
          "Content-Type": "application/json"
        },
        json: true
      });
      debug(`succesful incident request %O`, response.data);
      incidents = incidents.concat(response.data);
      page += 1;
    } while (response.has_more)

    debug(`incidents %O`, incidents);
    return incidents;
  } catch (e){
    debug(`error get_incident`, e)
  }
}

const create_csv_report = async function (incidents){
  const fields = ['id', 'title', 'urgency', 'status', 'created', 'acknowledged', 'resolved']

  var json2csvParser = new Json2csvParser({ fields });
  var csv = json2csvParser.parse(incidents);

  console.log(csv);
  fs.writeFileSync(`./${moment().unix()}_incidents.csv`, csv);
  return csv;
}

const run = async function(){
  await login();
  var incidents = await get_incidents();
  await create_csv_report(incidents);
}

run();
