// pages/api/echo.js
export default function handler(req, res) {
  // Checking if the incoming request method is POST
  if (req.method === "POST") {
    // Parsing the JSON data from the request body
    const data = JSON.parse(req.body);

    // Responding with the parsed data as a JSON object
    res.status(200).json(data);
  } else {
    // If the request method is not POST, return an error
    res.status(405).json({ error: "Method not allowed" });
  }
}
