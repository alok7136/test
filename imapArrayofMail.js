import Imap from "imap";
import util from "util";
const inspect = util.inspect();
import base64 from "base64-stream";
import fs from "fs";

var imap = new Imap({
  user: "testingimap606@gmail.com", // This is Connection Mail-Id;
  password: "indian@296",
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false,
  },
  authTimeout: 15000,
});

imap.once("ready", function () {
  var FROM_MAIL = ["alok.webvillee@gmail.com","rahulchoudhary.webvillee@gmail.com","prince.webvillee@gmail.com","shubhamsawant.webvillee@gmail.com"]
  var MAIL= FROM_MAIL.values();
  var dir;
  for(let MAILFINAL of MAIL){
  imap.openBox("INBOX", false, function (err, box) {
    function toUpper(thing) {
      return thing && thing.toUpperCase ? thing.toUpperCase() : thing;
    }
        function findAttachmentParts(struct, attachments) {
          attachments = attachments || [];
          for (var i = 0, len = struct.length, r; i < len; ++i) {
            if (Array.isArray(struct[i])) {
              findAttachmentParts(struct[i], attachments);
            } else {
              if (
                struct[i].disposition &&
                ["INLINE", "ATTACHMENT"].indexOf(toUpper(struct[i].disposition.type)) >
                  -1
              ) {
                attachments.push(struct[i]);
              }
            }
          }
          return attachments;
        }
      function buildAttMessageFunction(attachment) {
        var filename = attachment.params.name;
        var encoding = attachment.encoding;
        var name = filename.split(" ").join("").split(' ').join("").split(".")[1];
        // var name = filename.split(".")[1];
      
        return function (msg, seqno) {
          if (
            name == "pdf" ||
            name == "docx" ||
            name == "xlsx" ||
            name == "xls" ||
            name == "doc"
          ) {
            var prefix = "(#" + seqno + ")";
            msg.on("body", function (stream, info) {
              console.log(
                prefix + "Streaming this attachment to file",
                filename,
                info
              );
              var foldername = MAILFINAL;
              var extname = name;
              var folder = `${foldername}`;
              var extname1 = `${extname}`;
              var test = `${folder}/${extname1}`;
              dir = `./upload/${test}`;
              fs.mkdir(dir, { recursive: true }, (err) => {
                if (err) {
                  throw err;
                }
              });
              var writeStream = fs.createWriteStream(`${dir}/${filename}`);
              writeStream.on("finish", function () {
                console.log(prefix + "Done writing to file %s", filename);
              });
              if (toUpper(encoding) === "BASE64") {
                console.log(writeStream);
                if (encoding === "BASE64")
                  stream.pipe(new base64.Base64Decode()).pipe(writeStream);
              }
            });
            msg.once("end", function () {
              console.log(prefix + "Finished attachment %s", filename);
            });
          } else {
            return { msg: "No Pdf excel found in mail" };
          }
        };
      }
    var folder = `${MAILFINAL}`;
    var test = `${folder}`;
    dir = `./upload/${test}`;
    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) {
        throw err;
      }
    });
    if (err) throw err;
    try {
      imap.search([["FROM",MAILFINAL], ["UNSEEN"]], function (err, results) {
        if (!results || !results.length) {
          console.log("No unread mails");
          imap.end();
          return;
        }
        if (err) throw err;
        try {
          imap.setFlags(results, ["\\SEEN"], function (err) {
            if (!err) {
              console.log("marked as read");
            } else {
              console.log(JSON.stringify(err, null, 2));
            }
          });

          var f = imap.seq.fetch(results, {
            bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)"],
            struct: true,
          });
          f.on("message", function (msg, seqno) {
            var prefix = "(#" + seqno + ") ";
            msg.on("body", function (stream, info) {
              var buffer = "";
              stream.on("data", function (chunk) {
                buffer += chunk.toString("utf8");
              });
              stream.once("end", function () {
                console.log(
                  prefix + "Parsed header: %s",
                  Imap.parseHeader(buffer)
                );
              });
            });
            msg.once("attributes", function (attrs) {
              console.log("test", attrs);
              var attachments = findAttachmentParts(attrs.struct);
              console.log("Attachments", attachments);
  
              for (var i = 0, len = attachments.length; i < len; ++i) {
                var attachment = attachments[i];

                var f = imap.fetch(attrs.uid, {
                  bodies: [attachment.partID],
                  struct: true,
                });
                f.on("message", buildAttMessageFunction(attachment));
              }
            });
            msg.once("end", function () {
              console.log(prefix + "Finished email");
            });
            f.once("error", function (err) {
              console.log("Fetch error: " + err);
            });
            f.once("end", function () {
              console.log("Done fetching all messages!");
            });
          });
        } catch (e) {
          console.log("err", e);
        }
      });
    } catch (error) {
      console.log(`${error}`);
    }
  })};
});

export default imap.once("error", function (err) {
  console.log(err);
});
imap.once("end", function () {
  console.log("Connection ended");
  imap.end();
});
imap.connect();
