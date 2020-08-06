//import http module for our server
const http = require("http");
//import file system module
const fs = require("fs");

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

  if (url === "/") {
    //write client response
    res.write(`
            <h1>Welcome to our nodeJS API project</h1>
            <p>This is your first endpoint =)</p>
        `);
    //send client response
    res.end();
  } else if (url === "/resources") {
    //read db.json Asynchronously
    fs.readFile("./db.json", "utf8", (err, data) => {
      //perform logic while in the callback of readFile
      if (err) {
        throw err;
      }

      //check if db.json is not empty
      if (data !== "") {
        //parse data
        const JSONdata = JSON.parse(data).data;
        //convert to object
        let output = Object.values(JSONdata);
        //map and display in html response
        res.write(`
            Welcome to the resources page:  
            <ul style="list-style:none;">
            
                ${output.map((item) => `<li>${item}</li>`)}
            </ul>
            
            `);
        //if db.json empty return this view
      } else {
        res.write(
          "Welcome to the resources page, there is nothing to display so far.."
        );
      }

      res.end();
    });
  } else if (url === `/resource/add`) {
    res.write(`
      <h1>Add a new resource</h1>
      <form action="/add-resource" method="POST">
        <label for="text">Resource Text</label>
        <input name="text" type="text"/>
        <br> <br> 
        <label for="id">Resource id</label>
        <input name="id" type="number"/>
        <br> <br>
        <label for="date">Submission Date</label>
        <input name="date" type="date"/>
        <br> <br>
        <button>Add resource</button>
      </form>
    `);
    res.end();
  } else if (url === `/add-resource` && method === "POST") {
    //register event listener for capturing data
    const body = [];
    req.on("data", (chunk) => {
      // grab the data chunks from the buffer stream
      body.push(chunk);
    });
    //use the data once all has been captured
    req.on("end", () => {
      //all chunks are in body now
      const parsedBody = Buffer.concat(body) //concat chunks
        .toString(); //parse as text

      let rawData = parsedBody.split("&").map((item) => {
        return item.split("=")[1];
      });

      //process data as object
      let processedData = {};
      processedData.text = rawData[0];
      processedData.id = rawData[1];
      processedData.date = rawData[2];
      processedData = JSON.stringify(processedData);

      //validate if ID unique
      fs.readFile("./ids.json", "utf8", (err, data) => {
        if (err) {
          throw err;
        }
        let IDs = data.split("\r\n");
        //check if our id exists in the current ids
        let IdNotUnique = IDs.includes(rawData[1].toString());
        if (IdNotUnique) {
          //force user to enter a unique id
          res.write("Cannot enter duplicate ID...");
          res.end();
        } else {
          //write ID to ids.json
          let id = rawData[1].concat("\r\n");
          //write new resource to db file
          fs.readFile("./db.json", "utf8", (err, data) => {
            if (err) {
              throw err;
            }
            let currentData = data;
            if (currentData === "") {
              //if no previous id just write one
              fs.writeFile("ids.json", id, (err) => {});
              let obj = {};
              obj.data = [];
              obj.data.push(processedData);
              //if no other resource just write the first one
              fs.writeFile("db.json", JSON.stringify(obj), (err) => {});
            } else {
              //if resources already there
              let obj = JSON.parse(currentData);
              //push new resource onto data
              obj.data.push(processedData);
              //append id
              fs.appendFile("ids.json", id, (err) => {});
              //write all resources
              fs.writeFile("db.json", JSON.stringify(obj), (err) => {});
            }

            let refinedData;

            fs.readFile("./db.json", "utf8", (err, data) => {
              if (err) {
                throw err;
              }
              currentData = data;
              refinedData = JSON.parse(currentData).data;
              refinedData = Object.values(refinedData);

              res.write(`
              Welcome to the resources page:
              <ul style="list-style:none;">
                ${refinedData.map((item) => `<li>${item}</li>`)}
              </ul>
              `);

              res.end();
            });
          });
        }
      });
    });
  } else if (url === "/edit/resource") {
    fs.readFile("./idToEdit.json", "utf8", (err, data) => {
      if (err) {
        throw err;
      }
      let idToEdit = data;
      console.log(idToEdit);
      res.write(`
      <h1>Edit the resource with the ID: ${idToEdit}</h1>
      <form action="/edit-resource" method="POST">
        <label for="text">Resource Text</label>
        <input name="text" type="text"/>
        <br> <br> 
        <label for="id">Resource id</label>
        <input name="id" value=${idToEdit} type="number" disabled="true"/>
        <br> <br>
        <label for="date">Submission Date</label>
        <input name="date" type="date"/>
        <br> <br>
        <button>Edit resource</button>
      </form>
      `);
      res.end();
    });
  } else if (url === "/delete/resource") {
    fs.readFile("./idToDelete.json", "utf8", (err, data) => {
      if (err) {
        throw err;
      }
      let idToDelete = data;
      console.log(idToDelete);
      res.write(`
      <h1>Delete the resource with the ID: ${idToDelete}</h1>
      <form action="/delete-resource" method="POST">
        <label for="id">Resource id</label>
        <input name="id" value=${idToDelete} disabled="true" type="number"/>
        <br> <br>
        <br> <br>
        <button>Delete resource</button>
      </form>
      `);
      res.end();
    });
  } else {
    //parse the url to grab the id
    let id = url.split("/")[2];
    if (id !== undefined) {
      id.toString();

      //read file async to check for id
      fs.readFile("./ids.json", "utf8", (err, data) => {
        if (err) {
          throw err;
        }
        let RawIDs = data.split("\r\n");
        //check if we have the id or not
        let isUnique = true;
        RawIDs.map((rawId) => {
          if (rawId === id.toString()) {
            isUnique = false;
          }
        });

        //return view if new id
        if (isUnique === true) {
          res.write(
            `<br>please insert a new component with the id ${id} as it currently does not exist in our DB`
          );
          res.write(`
          <h1>Add a new resource as it currently does not exist</h1>
          <form action="/add-resource" method="POST">
            <label for="text">Resource Text</label>
            <input name="text" type="text"/>
            <br> <br> 
            <label for="id">Resource id</label>
            <input name="id" type="number"/>
            <br> <br>
            <label for="date">Submission Date</label>
            <input name="date" type="date"/>
            <br> <br>
            <button>Add resource</button>
          </form>
        `);
          //return view if id already exists
        } else {
          res.write(`<br>please edit/delete the item with the id ${id}`);
          fs.writeFile("idToEdit.json", id, (err) => {});
          fs.writeFile("idToDelete.json", id, (err) => {});
          res.write(`
            <br><br><button><a href="http://localhost:5000/edit/resource" target="_blank">Edit</a></button>
          `);
          res.write(`
          <br><br><button><a href="http://localhost:5000/delete/resource" target="_blank">Delete<a/></button>
        
        `);
        }

        res.end();
      });
    }
  }
});

//log some output to see everything's ok
console.log(`Server is running on port: ${PORT} so our API is alive =)`);

//start the server
server.listen(PORT);
