const fetch = require("node-fetch");
const fs = require('fs');

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
      id name previous_names year year_is_approximate place_built home_port home_country ssr
      sail_number nhsr nsbr oga_no fishing_number callsign mssi full_description image_key uk_part1
      rig_type construction_material construction_method
      spar_material
      construction_details
      draft
      generic_type
      handicap_data
      hull_form
      keel_laid
      launched
      length_on_deck
      mainsail_type
      sail_type { name }
      short_description
      updated_at
      website
      beam
      air_draft
      reference
      builder designer design_class
      constructionMaterialByConstructionMaterial { name }
      constructionMethodByConstructionMethod { name }
      designClassByDesignClass { name }
      designerByDesigner { name }
      rigTypeByRigType { name }
      genericTypeByGenericType { name }
      builderByBuilder { name notes }
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
  const path = `/page-data/boat/${oga_no}/page-data.json`;
  console.log('create_or_update_boat', oga_no);
  const boat = await fetchMyQuery(oga_no);
  fs.writeFileSync(`.${path}`, JSON.stringify(makedoc(boat)));
  console.log('got boat from database');
}

try {
  create_or_update_boat(process.argv[2])
  .then((data) => {
  	console.log('success');
  })
  .catch(error => {
    console.log('handled promise error on create_or_update_boat', error);
  });
} catch (error) {
  console.log('exception in create_or_update_boat');
}

