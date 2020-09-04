const fs = require("fs");

const resource = {
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
          var isUnique = true;
          let ids = [];
          resources.map((r) => {
            ids.push(r.id.toString());
          });

          if (ids.includes(dataObj.id)) {
            res.write("ID MUST BE UNIQUE");
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

  getAll: (res) => {
    fs.readFile("db.json", "utf8", function (err, data) {
      if (err) throw err;
      if (data !== "") {
        let resources = JSON.parse(data).resources;

        resources.map((r) => {
          res.write(`
            <div style="display:block; margin:auto; border: 2px solid #ccc; text-align:center; width:30rem; margin-bottom:1rem; border-radius:10px;">
              <p>Resource: ${r.text}</p>
              <p>ID: ${r.id} </p>
              <p>Date submitted: ${r.date} </p>
            </div>
          `);
        });
      } else {
        res.write(`
        <div style="display:block; margin:auto; border: 2px solid #ccc; text-align:center; width:30rem; margin-bottom:1rem; border-radius:10px;">
          <p>No current resources</p>
        </div>
      `);
      }

      res.end();
    });
  },

  getJson: (res) => {
    fs.readFile("db.json", "utf8", function (err, data) {
      if (err) throw err;
      if (data !== "") {
        let resources = JSON.parse(data).resources;
        res.write(`
          <h1 style=" width:40rem; display:block; margin:auto; margin-top:2rem; margin-bottom:2rem; text-align:center;">Here is the raw data formatted as JSON if you need it for your app =)</h1>
          <div style="display:block; padding:2rem; margin:auto; border: 2px solid #ccc; text-align:center; width:80vw; margin-bottom:1rem; border-radius:10px; word-wrap: break-word!important;">
            { "resources":${JSON.stringify(resources)}}
          </div>
          `);
      } else {
        res.write(`
        <div style="display:block; margin:auto; border: 2px solid #ccc; text-align:center; width:30rem; margin-bottom:1rem; border-radius:10px;">
          <p>No current resources</p>
        </div>
         
      `);
      }
      res.end();
    });
  },
};

module.exports = resource;
