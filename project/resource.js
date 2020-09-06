const fs = require("fs");
const resource = {
  getAll: (res) => {
    fs.readFile("db.json", "utf8", function (err, data) {
      if (err) throw err;
      if (data !== "") {
        let resources = JSON.parse(data).resources;
        resources.map((r) => {
          res.write(`
        <div 
          style="
          display:block; 
          margin:auto; 
          border: 2px solid #ccc; 
          text-align:center; 
          width:30rem; 
          margin-bottom:1rem; 
          border-radius:10px;"
        >
        <p>Resource: ${r.text}</p>
        <p>ID: ${r.id} </p>
        <p>Date submitted: ${r.date} </p>
        </div>
      `);
        });
      } else {
        res.write(`
          <div 
            style="display:block; 
            margin:auto; 
            border: 2px solid #ccc; 
            text-align:center; 
            width:30rem; 
            margin-bottom:1rem; 
            border-radius:10px;"
          >
          <p>No current resources</p>
          </div>
        `);
      }
      res.end();
    });
  },

  addResource: (req, res) => {
    const body = [];
    req.on("data", (chunk) => {
      body.push(chunk);
    });

    req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      let rawData = parsedBody.split("&").map((item) => {
        return item.split("=")[1];
      });

      let dataObj = {};

      dataObj.text = rawData[0].split("+").join(" ");
      dataObj.id = rawData[1];
      dataObj.date = rawData[2];

      fs.readFile("./db.json", "utf8", (err, data) => {
        if (err) {
          throw err;
        }

        let resources;
        let objToWrite = {};
        if (data !== "") {
          let resources = JSON.parse(data).resources;
          let ids = [];
          resources.map((r) => {
            ids.push(r.id.toString());
          });

          if (ids.includes(dataObj.id)) {
            res.write("ID MUST BE UNIQUE");
            //stop execution here
            return res.end();
          } else {
            objToWrite = {
              resources,
            };
            objToWrite.resources.push(dataObj);
          }
        } else {
          resources = [];
          resources.push(dataObj);
          objToWrite.resources = resources;
        }

        fs.writeFile("db.json", JSON.stringify(objToWrite), (err) => {});

        res.write("Resource added successfully");
        res.end();
      });
    });
  },

  searchEditOrDeleteResource: (req, res) => {
    let url = req.url;
    let method = req.method;
    //split url to check params
    let params = url.split("/");
    let id = params[2];
    //make sure the value after /resource/ is a number
    if (id !== undefined && !isNaN(id)) {
      fs.readFile("db.json", "utf8", function (err, data) {
        if (err) throw err;
        if (data !== "") {
          let resources = JSON.parse(data).resources;
          let IDs = [];
          let resourceToEdit;
          resources.map((r) => {
            IDs.push(r.id);
            if (r.id === id) {
              resourceToEdit = r;
            }
          });
          if (IDs.includes(id)) {
            res.write(`
      <h1 style="text-align:center; 
      display:block; 
      margin:auto; 
      width:30rem; 
      margin-top:5rem; 
      border:5px solid #ccc; 
      border-radius:10px; 
      padding:3rem;" 
    >  
        Edit/Delete resource with
          id <span 
          style="border-bottom:5px solid #000;"
          >
          ${id}
        </span>
    </h1>
        <button 
          style="display:block; 
          margin:auto; width:20rem; 
          height:3rem; 
          font-size:1.5rem; 
          margin-top:2rem;"
        >
        <a 
          target="_blank" 
  href="http://localhost:5000/edit/resource/${id}">
          Edit resource with id ${id}
        </a>
            </button>
  
            <div style="display:block;
                  margin:auto;
                  width:20rem;
                  font-size:1.5rem;
                  text-align:center;
                  margin-top:1rem;
                  background:#ggg;
                  border:2px solid #ccc;
                  border-radius:15px;"
            >
                
            text:${resourceToEdit.text}
            <br>
            id: ${resourceToEdit.id}
            <br>
            last edit: ${resourceToEdit.date}
            </div>
            <button 
              style="display:block; 
              margin:auto; 
              width:20rem; 
              height:3rem; 
              font-size:1.5rem; 
              margin-top:2rem;"
            >
              <a 
                target="_blank" 
  href="http://localhost:5000/delete/resource/${id}"
              >
                Delete resource with id ${id}
              </a>
            </button>
          `);
          } else {
            res.write(`
          <h1 
            style="text-align:center; 
            display:block; 
            margin:auto; 
            width:30rem; 
            margin-top:5rem; 
            border:5px solid #ccc; 
            border-radius:10px; 
            padding:3rem;"
          >
            There is currently no available 
      resource with the id ${id} to delete/update.
            Add it by going to 
            <a 
        href="http://localhost:5000/resource/add" 
              target="_blank">
          http://localhost:5000/resource/add
            </a> 
          </h1>
          `);
          }
          res.end();
        } else {
          res.write(`
          <h1 
            style="text-align:center; 
            display:block; 
            margin:auto; 
            width:30rem; 
            margin-top:5rem; 
            border:5px solid #ccc; 
            border-radius:10px; 
            padding:3rem;"
          >
            There are currently no available 
            resources to delete/update.
            Add some by going to 
              <a 
          href="http://localhost:5000/resource/add" 
                target="_blank">
              http://localhost:5000/resource/add
              </a> 
          </h1>
        `);
        }
      });
    } else if (params[1] === "edit") {
      let tempId = params[3];
      res.write(`
      <h1 
        style="text-align:center; 
        margin:3rem;">
          EDIT resource with id ${tempId}
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
  
      action="/resource/edit" method="POST"  
      >
        <label for="text">Resource Text</label>
        <input name="text" type="text"/>
        <br> <br> 
        <label for="id">Resource id</label>
  <input name="id" type="number" value='${tempId}'/>
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
          value="Edit Resource"> 
      </form>
      `);
      res.end();
    } else if (params[1] === "delete") {
      let tempId = params[3];

      fs.readFile("db.json", "utf8", function (err, data) {
        if (err) throw err;
        if (data !== "") {
          let resources = JSON.parse(data).resources;
          let IDs = [];
          resources.map((r) => {
            IDs.push(r.id);
          });
          if (IDs.includes(tempId)) {
            res.write(`
            <h1 
              style="text-align:center; 
              margin:3rem;">
                Delete resource with id ${tempId}
            </h1>
            <form 
              action="/resource/delete" 
              method="POST" 
              style="display:block; 
              margin:auto; border: 2px solid #ccc; 
              text-align:center; width:30rem; 
              margin-bottom:1rem; 
              padding:2rem!important; 
              font-size:1.5rem!important;" 
            >
              <input  
                type="hidden" 
                value=${tempId} 
                name="id">
                <br><br>
                <input 
                  style="display:block; 
                  margin:auto!important; 
                  width:20rem; 
                  font-size:2rem;" 
                  
                  type="submit" 
                  
                  value="Delete Resource"> 
           
            </form>
            `);

            res.end();
          } else {
            res.write(`
            <h1 
              style="text-align:center; 
              display:block; 
              margin:auto; 
              width:30rem; 
              margin-top:5rem; 
              border:5px solid #ccc; 
              border-radius:10px; 
              padding:3rem;"
            >
        There is currently no available 
      resource with the id ${tempId} to delete/update.
              Add it by going to 
              <a 
              href="http://localhost:5000/resource/add" 
                target="_blank">
                  http://localhost:5000/resource/add
              </a> 
            </h1>
          `);
            res.end();
          }
        }
      });
    } else {
      res.write("404 error page not found");
      res.end();
    }
  },

  editResource: (req, res) => {
    const body = [];
    req.on("data", (chunk) => {
      body.push(chunk);
    });
    req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      let idToUpdate = parsedBody.split("&")[1].split("=")[1];
      let textToUpdate = parsedBody.split("&")[0].split("=")[1];
      let dateToUpdate = parsedBody.split("&")[2].split("=")[1];

      fs.readFile("db.json", "utf8", function (err, data) {
        if (err) throw err;
        if (data !== "") {
          let resources = JSON.parse(data).resources;
          resources.map((r, index) => {
            if (r.id === idToUpdate) {
              r.text = textToUpdate.split("+").join(" ");
              r.id = idToUpdate;
              r.date = dateToUpdate;
            }
          });

          let obj = {};
          obj.resources = resources;
          fs.writeFile("db.json", JSON.stringify(obj), (err) => {});
        }
      });
      res.write(`
       
        RESOURCE with the id 
        ${idToUpdate} was edited successfully
      `);
      res.end();
    });
  },

  deleteResource: (req, res) => {
    const method = req.method;
    if (method === "POST") {
      const body = [];
      req.on("data", (chunk) => {
        body.push(chunk);
      });
      req.on("end", () => {
        const parsedBody = Buffer.concat(body).toString();
        let idToDelete = parsedBody.split("=")[1];

        fs.readFile("db.json", "utf8", function (err, data) {
          if (err) throw err;
          if (data !== "") {
            let resources = JSON.parse(data).resources;
            resources.map((r, index) => {
              if (r.id === idToDelete) {
                resources.splice(index, 1);
              }
            });
            let obj = {};
            obj.resources = resources;
            fs.writeFile("db.json", JSON.stringify(obj), (err) => {});
          }
        });

        res.write(`RESOURCE with the id 
          ${idToDelete} deleted successfully`);
        res.end();
      });
    } else {
      res.write("404 error page not found!");
      res.end();
    }
  },
  getJson: (res) => {
    fs.readFile("db.json", "utf8", function (err, data) {
      if (err) throw err;
      if (data !== "") {
        let resources = JSON.parse(data).resources;
        res.write(`
          <h1 style="
            width:40rem; 
            display:block; 
            margin:auto; 
            margin-top:2rem; 
            margin-bottom:2rem; 
            text-align:center;">
              Here is the raw data formatted 
              as JSON if you need it for your app =)
          </h1>
          <div 
            style="display:block; 
            padding:2rem; 
            margin:auto; 
            border: 2px solid #ccc; 
            text-align:center; 
            width:80vw; 
            margin-bottom:1rem; 
            border-radius:10px; 
            word-wrap: break-word!important;">
            { "resources":${JSON.stringify(resources)}}
          </div>
          `);
      } else {
        res.write(`
        <div 
          style="display:block; 
          margin:auto; border: 2px solid #ccc; 
          text-align:center; 
          width:30rem; 
          margin-bottom:1rem; 
          border-radius:10px;">
          <p>No current resources</p>
        </div>
          
      `);
      }
      res.end();
    });
  },
};

module.exports = resource;
