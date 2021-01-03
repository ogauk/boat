# Get Boat javascript action

This action gets a boat record using graphql

## Inputs

### `oga-no`

**Required** The OGA Number of the boat to get. Default `"315"`.

## Outputs

### `boat`

JSON string of the boat data

## Example usage

uses: actions/boat@v1.1
with:
  oga-no: '2244'
