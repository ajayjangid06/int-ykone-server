const axios = require("axios");
const cheerio = require("cheerio");
const { Client } = require("./models/client");

const { Client: esClientt } = require("@elastic/elasticsearch");
const esClient = new esClientt({
  node: "http://localhost:9200",
  auth: {
    username: "elastic",
    password: "Ajay@123",
  },
});

// const baseURL = 'https://bit.ly/3lmNMTA';
const urlCompanyDetails = "https://www.companydetails.in";
const baseURL = "https://www.companydetails.in/latest-registered-company-mca";

const validateFields = (cin, pin, email) => {
  const isCINValid = /^\w{21}$/.test(cin);
  const isPINValid = /^\d{6}$/.test(pin);
  const isEmailValid = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  return isCINValid && isPINValid && isEmailValid;
};

const fetchPage = async (url) => {
  try {
    const { data } = await axios.get(url);
    return cheerio.load(data);
  } catch (error) {
    console.error(`Error fetching page: ${error}`);
    return null;
  }
};

const extractClientDetails = async (link) => {
  try {
    const { data } = await axios.get(urlCompanyDetails + link);
    const $ = cheerio.load(data);
    const cin = $("#basicdetails")
      .find('a:contains(" CIN")')
      .closest("div")
      .next()
      .find("h6")
      .text()
      .trim();
    const pin = $("#CONTACT-DETAILS")
      .find('a:contains(" PIN Code")')
      .closest("div")
      .next()
      .find("h6")
      .text()
      .trim();
    const email = $("#CONTACT-DETAILS")
      .find('a:contains(" Email")')
      .closest("div")
      .next()
      .find("h6")
      .text()
      .trim();
    return { cin, pin, email };
  } catch (error) {
    console.error(`Error fetching client details: ${error}`);
    return null;
  }
};

const extractClients = async ($) => {
  const clients = [];
  const elements = $(".col-md-4", ".banklisting");

  for (const element of elements) {
    const link = $(element).find("a").attr("href");
    const name = $(element).find("a").text().trim();
    let data = { name };

    if (link) {
      const { cin, pin, email } = await extractClientDetails(link);
      if (validateFields(cin, pin, email)) {
        data = { ...data, cin, pin, email };
        clients.push(data);
      }
    }
  }

  return clients;
};

const getAllClients = async (req, res) => {
  let url = baseURL;
  // const clients = [
  // {cin:'123456788765432176533', pin:'123454', name: 'test3', email: 'email3@email3.com'},
  // {cin:'123456788765432176546', pin:'123452', name: 'test2', email: 'email3@email3.com'}
  // ];
  const clients = [];

  const $ = await fetchPage(url);
  const pageClients = await extractClients($);
  clients.push(...pageClients);
  await Client.bulkCreate(clients);
  for (const client of clients) {
    await esClient.index({
      index: "clients",
      id: client.cin.toString(),
      body: {
        name: client.name,
        cin: client.cin,
        email: client.email,
      },
    });
  }
  res.json({ data: clients });
};

// const searchClients = async (req, res) => {
//   const {hits} = await esClient.search({
//     index: 'clients',
//     body: {
//       query: {
//         match: { cin: 'U011' }
//       }
//     }
//   });
//   console.log(hits.hits);
//   res.json({data: hits.hits})
// }

module.exports = { fetchClients: getAllClients, validateFields };
