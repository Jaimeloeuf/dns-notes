/**
 * Script to generate AJV schema using typescript definition files in shared-types/
 */

const TJS = require("typescript-json-schema");
const { resolve } = require("path");

const conversions = {
  note: ["Note"],
  user: ["UserInvite"],
  event: ["AddEvent", "DelEvent", "EditEvent", "SyncEvent"],
};

const generator = TJS.buildGenerator(
  TJS.getProgramFromFiles(
    // Generate the file paths using the file names
    Object.keys(conversions).map((fileName) =>
      resolve("../shared-types/", `${fileName}.d.ts`)
    ),

    // @todo Use tsconfig
    // Optionally pass TS compiler options
    { strictNullChecks: true }
  ),

  // Optional settings
  {
    // All fields are required
    required: true,

    // No extra properties is allowed on the request body
    noExtraProps: true,
  }
);

const file_comment = `/**
 * DO NOT EDIT THIS FILE MANUALLY
 * This file is generated using \`npm run ajv:schema\`
 * Edit the script instead to generate this file
 * 
 * This file contains schema for AJV to validate JSONs specifically for validating request bodies.
 */

`;

/*
  1. Get all the symbols to extract and flatten them into an array of strings
  2. For each symbol, get its schema, and create a TS string for it.
  3. Reduce the array of strings into a single string
  4. Write the schema to a TS src file
*/
require("fs").writeFileSync(
  resolve("./src/routes/ajv_schema.ts"),
  file_comment +
    Object.values(conversions)
      .flat()
      .reduce(
        (acc, symbol) =>
          acc +
          `export const ${symbol}_schema = ${JSON.stringify(
            generator.getSchemaForSymbol(symbol)
          )} as const;\n`,
        ""
      )
);
