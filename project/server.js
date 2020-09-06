//import http module for our server
const http = require("http");
const resource = require("./resource");

//define port for our server to listen to
const PORT = process.env.port || 5000;

//create server
const server = http.createServer((req, res) => {
  //define url
  const url = req.url;
  //define request
  const method = req.method;
  //set content type header
  res.setHeader("Content-Type", "text/html");

  switch (url) {
    case "/":
      //write client response
      res.write(`
<h2 
  style="font-size: 2rem; 
  text-align:center; 
  display:block; 
  margin:auto; 
  width:30rem; 
  margin-top:5rem; 
  border:5px solid #ccc; 
  border-radius:10px; 
  padding:3rem;">
  Welcome to our API   
</h2>
<h2 
  style="font-size: 2rem; 
  text-align:center; 
  display:block; 
  margin:auto; 
  width:30rem; 
  margin-top:5rem; 
  border:5px solid #ccc; 
  border-radius:10px; 
  padding:3rem;">
  Go to to <a 
            href="http://localhost:5000/resources" 
            target="_blank">
              http://localhost:5000/resources
          </a>  
          to view all current
  resources in a pretty format
</h2>
<h2 
  style="font-size: 2rem; 
  text-align:center; 
  display:block; 
  margin:auto; 
  width:30rem; 
  margin-top:5rem; 
  border:5px solid #ccc; 
  border-radius:10px; 
  padding:3rem;"
>
  Go to to <a 
            href="http://localhost:5000/resources/json" 
            target="_blank">
              http://localhost:5000/resources/json
            </a>  to view all current
  resources in a JSON-like format
</h2>

<h2 
  style="font-size: 2rem; 
  text-align:center; 
  display:block; 
  margin:auto; 
  width:30rem; 
  margin-top:5rem; 
  border:5px solid #ccc; 
  border-radius:10px; padding:3rem;"
>
  Go to to <a 
            href="http://localhost:5000/resource/add" 
            target="_blank">
              http://localhost:5000/resource/add
            </a>  to add
  a new resource. Be careful! The ID you submit must 
  not already exist, or the API won't let you add 
  the resource.
</h2>

<h2 
  style="font-size: 2rem; 
  text-align:center; 
  display:block; 
  margin:auto; 
  width:30rem; 
  margin-top:5rem; 
  border:5px solid #ccc; 
  border-radius:10px; 
  padding:3rem;">
  Go to to <a 
      href="#">http://localhost:5000/resource/:id
    </a>  (e.g. <a 
          href="#">http://localhost:5000/resource/5
      </a> to access the resource with id 5)
  to edit or delete a specific resource. Be careful! 
  The id you 
  access via the url must exist.
</h2>

<h2 
  style="font-size: 2rem; 
        text-align:center; 
        display:block; 
        margin:auto; 
        width:30rem; 
        margin-top:5rem; 
        border:5px solid #ccc; 
        border-radius:10px; 
        padding:3rem;"
      >
  Your 'database' is <a href="#">db.json</a>
  that's where all your resources 
  data is being persisted so the API 'remembers' it.
</h2>
`);
      //send client response
      res.end();
      break;
    case "/resources/json":
      resource.getJson(res);
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
          <br> <sbr> 
          <label for="id">Resource id</label>
          <input name="id" type="number"/>
          <br> <sbr>
          <label for="date">Submission Date</label>
          <input name="date" type="date"/>
          <br> <sbr>
          <input 
            style="display:block; 
            margin:auto!important; 
            width:20rem; 
            font-size:2rem;" 
            
            type="submit" 
            
            value="Add Resource"
          > 
        </form>
        `);
        res.end();
      } else if (method === "POST") {
        resource.addResource(req, res);
      }
      break;
    case "/resource/edit":
      if (method === "POST") {
        resource.editResource(req, res);
      } else if (method === "GET") {
        res.write("404 error page not found!");
        res.end();
      }
      break;
    case "/resource/delete":
      resource.deleteResource(req, res);
      break;
    default:
      resource.searchEditOrDeleteResource(req, res);
      break;
  }
});

//log some output to see everything's ok
console.log(`
  Server is running on port: 
  ${PORT} so our API is alive =)
`);

//start the server
server.listen(PORT);
