const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require("node-fetch");

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
  return result.json();
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

try {
  const ogaNo = core.getInput('oga-no');
  console.log(`want${ogaNo}`);
  // const { errors, data } = await fetchMyQuery(oga_no);
  fetchMyQuery(ogaNo).then((data) => {
    core.setOutput("boat", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
  }).catch(error => {
    core.setFailed(error.message);
  });
} catch (error) {
  core.setFailed(error.message);
}
