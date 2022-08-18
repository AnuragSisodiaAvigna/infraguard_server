const express = require("express");
const winston = require("winston");
const app = express();
const http = require("http");
const port = 53;
const bodyparser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
app.use(cors());
const server = http.createServer(app);

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//Cross origin resolved
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

//Server
server.listen(port);
server.on("listening", () => {
  console.log(`The server has started on port: ${port}`);
});

// Loggers
const transports = [];
if (process.env.NODE_ENV != "dev" && process.env.NODE_ENV != "staging") {
  transports.push(
    new winston.transports.File({
      filename: "infos.log",
      level: "info",
    }),
    new winston.transports.File({
      filename: "errors.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "warnings.log",
      level: "warn",
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.cli(),
        winston.format.splat()
      ),
    })
  );
}
const loggerInstance = winston.createLogger({
  level: "",
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.simple({
      format: "abc",
    }),
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.json()
  ),
  transports,
});
//Routes
app.get("/send-mail", (req, res, next) => {
  try {
    const { first_name, last_name, company, message, email, phone_no } =
      req.body;
    loggerInstance.info(
      "First Name:  " +
        first_name +
        ", Last Name: " +
        last_name +
        ", Company Name:  " +
        company +
        ", Email: " +
        email +
        ", Contact No:  " +
        phone_no +
        ", Message: " +
        message
    );
    var nodemailer = require("nodemailer");
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "campaign@infraguard.io",
        pass: "kftxagitnvxouzbz",
      },
    });
    var mailOptions = {
      from: "campaign@infraguard.io",
      to: "sales@infraguard.io",
      subject: "Schedule Demo",
      html: `
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>index</title>
            <!-- CSS only -->
            <link
              href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css"
              rel="stylesheet"
              integrity="sha384-gH2yIJqKdNHPEq0n4Mqa/HGKIhSkIHeL5AyhkYV8i59U5AR6csBvApHHNl/vI1Bx"
              crossorigin="anonymous"
            />
            <!-- JavaScript Bundle with Popper -->
            <script
              src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js"
              integrity="sha384-A3rJD856KowSb7dwlZdYEkO39Gagi7vIsF0jrRAoQmDKKtQBHUuLZ9AsSv4jD4Xa"
              crossorigin="anonymous"
            ></script>
        </head>
        <body>
          <div style="display: flex">
            <div class="card" style="width: 18rem; height: 18rem">
              <div class="card-body">
                <p class="card-text">
                  First Name: ${first_name},<br />
                  Last Name:${last_name}, <br />
                  Company Name: ${company}, <br />
                  Email:${email}, <br />
                  Contact Number: ${phone_no},<br /> 
                  Message: ${message}.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return res
      .status(200)
      .send(`The mail has been succefully sent to ${email}`);
  } catch (error) {
    console.log(error);
  }
});
