var express = require('express');
var app = express();
var urllib = require('urllib');
var md5 = require('md5')
 
app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

app.get('/updateMD5.cgi', function (req, res) {
    var err = [];

    var fileType = {
    	"trx": "_un.zip", 
        "rsa": "_rsa.zip",
        "note": "_US_note.zip"
    };

    var downloadLink = "https://dlcdnets.asus.com/pub/ASUS/"
    downloadLink += (req.query.PATH) ? req.query.PATH : "Wireless/ASUSWRT/";
    downloadLink += req.query.MODEL;
    downloadLink += "_";
    downloadLink += req.query.FW.replace("004", "004_");
    downloadLink += "_";
    downloadLink += req.query.EXT;

	urllib.request(downloadLink + fileType.trx, function (errTrx, dataTrx, resTrx) {
		if(resTrx.statusCode.toString() === "404"){
			res.send("No Firmware");
		}
		else{
			res.send(resTrx.headers.etag.split(":")[0].replace('"', ''));
		}
	});
});

app.get('/liveUpdateTest.cgi', function (req, res) {
    var err = [];

    var fileType = {
    	"trx": "_un.zip", 
        "rsa": "_rsa.zip",
        "note": "_US_note.zip"
    };

    var downloadLink = "https://dlcdnets.asus.com/pub/ASUS/"
    downloadLink += (req.query.PATH) ? req.query.PATH : "Wireless/ASUSWRT/";
    downloadLink += req.query.MODEL;
    downloadLink += "_";
    downloadLink += req.query.FW.replace("004", "004_");
    downloadLink += "_";
    downloadLink += req.query.EXT;

	urllib.request(downloadLink + fileType.rsa, function (errRsa, dataRsa, resRsa) {
		if(resRsa.statusCode.toString() === "404") err.push("No RSA");

		urllib.request(downloadLink + fileType.note, function (errNote, dataNote, resNote) {
			if(resNote.statusCode.toString() === "404") err.push("No Note");
	
			urllib.request(downloadLink + fileType.trx, function (errTrx, dataTrx, resTrx) {
				if(resTrx.statusCode.toString() === "404"){
					err.push("No FW")
				}
				else{
					if(resTrx.headers.etag.indexOf(req.query.MD5) === -1) err.push("MD5 Mismatch!")
				}

				res.send((err.length > 0) ? err.join(", ") : "Pass");
			});
		});
	});
});

app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});