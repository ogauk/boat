const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require("node-fetch");
const {Base64} = require('js-base64');
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit();

async function fetchGraphQL(operationsDoc, operationName, variables) {
  const result = await fetch(
    "https://api-oga.herokuapp.com/v1/graphql",
    {
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName
      })
    }
  );
  const d = await result.json();
  return d.data.boat[0];
}

const operationsDoc = `
  query MyQuery($oga_no: Int!) {
    boat(where: {oga_no: {_eq: $oga_no}}) {
      id name previous_names year year_is_approximate public place_built home_port home_country ssr
      sail_number nhsr nsbr oga_no fishing_number callsign mssi full_description image_key uk_part1
      spar_material
      constructionMaterialByConstructionMaterial { name }
      constructionMethodByConstructionMethod { name }
      construction_details
      designClassByDesignClass { name }
      designerByDesigner { name }
      draft
      generic_type
      handicap_data
      hull_form
      keel_laid
      launched
      length_on_deck
      mainsail_type
      rigTypeByRigType { name }
      sail_type { name }
      short_description
      updated_at
      website
      genericTypeByGenericType { name }
      builderByBuilder { name notes }
      beam
      air_draft
      reference
      for_sale_state { text }
      for_sales(limit: 1, order_by: {updated_at: desc}) {
        asking_price
        flexibility
        offered
        price_flexibility { text }
        reduced
        sales_text
        sold
        summary
        updated_at
      }
      engine_installations { engine installed removed }
    }
  }
`;

function fetchMyQuery(oga_no) {
  return fetchGraphQL(
    operationsDoc,
    "MyQuery",
    {"oga_no": oga_no}
  );
}

const template = {
  staticQueryHashes: [],
  componentChunkName: "component---src-templates-boattemplate-jsx",
  path: "/boat/$1",
  result: {
    pageContext: {
      pathSlug: "/boat/$1",
      home: "/",
      absolute: "https://oga.org.uk",
      boat: {}
    }
  }
}

function makedoc(boat) {
  const doc = {...template};
  doc.path = `/boat/${boat.oga_no}`;
  doc.result.pageContext.pathSlug = doc.path;
  doc.result.pageContext.boat = boat;
  return doc;
}

async function create_or_update_boat(oga_no) {
  const path = oga_no;
  const url = `/repos/ogauk/boat/contents/${path}`;
  const p = { owner: 'ogauk', repo: 'boat', path };
  try {
    const r = await octokit.request(`GET ${url}`, p);
    p.sha = r.data.sha;
    console.log('got boat from repo with sha', p.sha);
  } catch(e) {
    console.log('new boat', oga_no);
  }
  p.message = 'update from postgreSQL';
  const boat = await fetchMyQuery(oga_no);
  console.log('got boat from database');
  p.content = Base64.encode(JSON.stringify(makedoc(boat)));
  console.log('before put', p);
  try {
    const r = await octokit.request(`PUT ${url}`, p);
    console.log('put boat from database to repo');
    console.log('r', r);
  } catch(e) {
    console.log('put error', e);
  }
  return boat;
}

try {
  const ogaNo = core.getInput('oga-no');
  create_or_update_boat(ogaNo).then((data) => {
    core.setOutput("boat", JSON.stringify(data));
  }).catch(error => {
    console.log('handled promise error on create_or_update_boat', error);
    core.setFailed(error.message);
  });
} catch (error) {
  console.log('exception in create_or_update_boat');
  core.setFailed(error.message);
}

