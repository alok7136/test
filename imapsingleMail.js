import Imap from "imap";
import util from 'util';
const inspect = util.inspect();
import  base64 from "base64-stream";
import fs from "fs";

var FROM_MAIL = "alok.webvillee@gmail.com"; // Read Mail Id Put Here !!!
var dir;

var imap = new Imap({
  user: "testingimap606@gmail.com",   // This is Connection Mail-Id;
    password: "indian@296",
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false,
  },
  authTimeout: 3000,
});

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
  console.log(attachment);
  var filename = attachment.params.name;
  var encoding = attachment.encoding;
  console.log(attachment);
  var name = filename.split(" ").join('').split('.')[1];
//   var name = filename.split(".")[1];
  console.log("log", name);

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
        console.log(info);
        console.log(
          prefix + "Streaming this attachment to file",
          filename,
          info
        );

        var foldername = FROM_MAIL;
        var extname = name;
                var folder = `${foldername}`;
                var extname1 = `${extname}`;
                var test = `${folder}/${extname1}`;
            
                const dir = `./upload/${test}`;
                fs.mkdir(dir,{recursive:true},(err)=>{
                    if(err){
                        throw err
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
      console.log("No Pdf excel found in mail");
      return { msg: "No Pdf excel found in mail" };
    }
  };
}
imap.once("ready", function () {
  // FROM_MAIL;
  imap.openBox("INBOX", false, function (err, box) {

    var foldername = FROM_MAIL;
            var folder = `${foldername}`;
            // var extname1 = `${extname}`;
            var test = `${folder}`;
            dir = `./upload/${test}`;
            fs.mkdir(dir,{recursive:true},(err)=>{
                if(err){
                    throw err
                }
            });


    if (err) throw err;
    try {
      imap.search([["FROM", FROM_MAIL], ["UNSEEN"]], function (err, results) {
        console.log(results);
        if (!results || !results.length) {
          console.log("No unread mails");
          imap.end();
          return;
        }
        imap.setFlags(results, ["\\SEEN"], function (err) {
          if (!err) {
            console.log("marked as read");
          } else {
            console.log(JSON.stringify(err, null, 2));
          }
        });
        if (err) throw err;
        try {
          var f = imap.fetch(results, {
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
          });
          f.once("error", function (err) {
            console.log("Fetch error: " + err);
          });
          f.once("end", function () {
            console.log("Done fetching all messages!");
            imap.end();
          });
        } catch (e) {
          console.log("err", e);
        }
      });
    } catch (e) {
      console.log("log", e);
    }
  });
});

export default imap.once("error", function (err) {
  console.log(err);
});

imap.once("end", function () {
  console.log("Connection ended");
});
imap.connect();
