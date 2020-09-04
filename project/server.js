//import http module for our server
const http = require("http");
//import file system module
const fs = require("fs");
const resource = require("./resource");

//define port for our server to listen to
const PORT = process.env.port || 5000;

//create server
const server = http.createServer((req, res) => {
  //define url
  const url = req.url;
  //define method
  const method = req.method;
  //set content type header
  res.setHeader("Content-Type", "text/html");

  switch (url) {
    case "/":
      //write client response
      res.write(`
        <h1>Welcome to our nodeJS API</h1>
        <p>This is your first endpoint =)</p>
            `);
      //send client response
      res.end();
      break;
    case "/resources":
      resource.getAll(res);
      break;
    case "/resource/add":
      if (method === "GET") {
        res.write(`
        <h1 
          style="text-align:center; 
          margin:3rem;"
        >
          Add a new resource
        </h1>
        <form 
          style="display:block; 
          margin:auto; 
          border: 2px solid #ccc; 
          text-align:center; 
          width:30rem; 
          margin-bottom:1rem; 
          padding:2rem!important; 
          font-size:1.5rem!important;" 
          
          action="/resource/add"
          
          method="POST"
        >
          <label for="text">Resource Text</label>
          <input name="text" type="text"/>
          <br> <br> 
          <label for="id">Resource id</label>
          <input name="id" type="number"/>
          <br> <br>
          <label for="date">Submission Date</label>
          <input name="date" type="date"/>
          <br> <br>
          <input 
            style="display:block; 
            margin:auto!important; 
            width:20rem; 
            font-size:2rem;" 
            type="submit" 
            
            value="Add Resource"> 
        </form>
        `);
        res.end();
      } else if (method === "POST") {
        resource.addResource(req, res);
      }

      break;
  }
});

//log some output to see everything's ok
console.log(`
    Server is running on port: 
    ${PORT} so our API is alive =)`);

//start the server
server.listen(PORT);
