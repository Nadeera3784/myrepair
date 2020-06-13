const path = require("path");
const ejs = require("ejs");
const pdf = require('html-pdf');

async function generate_pdf(request, response, template, invoice, type) {
    //"views/agent/invo.ejs"
    const html = await ejs.renderFile(template, {
        invoice: invoice
    }).then(function (output) {
        return output;
    });

    if(type == "stream"){
        pdf.create(html, {
            format: "A4"
        }).toStream(function (err, stream) {
            if (err) return response.end(err.stack);
            response.setHeader('Content-type', 'application/pdf');
            stream.pipe(response);
        });
    }else{
        pdf.create(html, {
            format: "Letter",
            directory : "views/agent/tmp",
        }).toBuffer(function(err, buffers){
            response.writeHead(200, {
              'Content-Length': Buffer.byteLength(buffers),
              'Content-Type': 'application/pdf',
              'Content-disposition': 'attachment;filename=test.pdf'
            }).end(buffers);
        });
    }
}


module.exports = {
    generate_pdf
};
  