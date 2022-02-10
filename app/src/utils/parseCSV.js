/*
    Credits
    https://sebhastian.com/javascript-csv-to-array/
*/

/** Function to convert a CSV string to array of objects where each object represents a row in the CSV */
function csvToArray(str) {
  // To remove issues caused when last row is an empty row caused by terminating newlines
  str = str.trim();

  // Slice from \n index + 1 aka after header to end of the text
  // To create an array of each csv value row with split
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  // @todo Limit number of users they can add based on their plan
  // @todo Limit number of users they can add at a single point in time to prevent crashing the app
  // @todo And also since email invites will be sent, dont want to allow malicious users to use us for spam delivery
  console.log("rows.length", rows.length);

  // Return an array of objects with each object representing a row
  return rows.map((row) => {
    const values = row.split(",");

    return {
      // Email must be lowercase as the email in tokens are all lower cased by default
      email: values[0].toLowerCase(),
      admin: values[1].replace(/(\r\n|\n|\r|\s)/gm, "") === "y",
    };
  });
}

/** Read CSV file object and parses it to an array of objects */
export default (input) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(csvToArray(e.target.result));
    reader.onerror = reject;
    reader.readAsText(input);
  });
