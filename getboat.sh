#!/bin/sh
Q='query MyQuery($oga_no: Int!) {boat(where: {oga_no: {_eq: $oga_no}}) {id name previous_names year year_is_approximate public place_built home_port home_country ssr sail_number nhsr nsbr oga_no fishing_number callsign mssi full_description image_key uk_part1 spar_material constructionMaterialByConstructionMaterial {name} constructionMethodByConstructionMethod {name} construction_details designClassByDesignClass {name} designerByDesigner {name} draft generic_type handicap_data hull_form keel_laid launched length_on_deck mainsail_type rigTypeByRigType {name} sail_type {name} short_description updated_at website genericTypeByGenericType {name} builderByBuilder {name notes} beam air_draft reference for_sale_state {text} for_sales(limit: 1, order_by: {updated_at: desc}) {asking_price flexibility offered price_flexibility {text} reduced sales_text sold summary updated_at} engine_installations {engine installed removed}}}'
curl 'https://api-oga.herokuapp.com/v1/graphql' \
-X 'POST' \
-H 'Content-Type: application/json' \
-H 'Pragma: no-cache' \
-H 'Accept: application/json' \
-H 'Accept-Language: en-gb' \
-H 'Accept-Encoding: gzip, deflate, br' \
-H 'Cache-Control: no-cache' \
-H 'Connection: keep-alive' \
--output $1.json.gz \
--data-binary "{\"query\": \"$Q\",\"variables\":{\"oga_no\":$1},\"operationName\":\"MyQuery\"}"
gunzip $1.json.gz
cat >$1 <<EOF
{
  "staticQueryHashes": [],
  "componentChunkName": "component---src-templates-boattemplate-jsx",
  "path": "/boat/$1",
  "result": {
    "pageContext": {
      "pathSlug": "/boat/$1",
      "home": "/",
      "absolute": "https://oga.org.uk",
      "boat": `cat $1.json`
    }
  }
}
EOF
