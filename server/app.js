var express = require('express');
var app = express();
var urllib = require('urllib');
var md5 = require('md5')

var getDownloadLink = function(fwInfo, type){
    const fileType = {
    	"trx": "un.zip", 
        "rsa": "rsa.zip",
        "note": "US_note.zip"
    };

	const downloadPath = {
	    "official": "wireless/ASUSWRT/",
	    "official_v30": "wireless/ASUSWRT/",
	    "sq": "LiveUpdate/Release/Wireless_SQ/",
	    "mr": "LiveUpdate/Release/Wireless_SQ/MR1/",
	    "test_viz": "wireless/ASUSWRT/" 
	}

    var downloadLink = "https://dlcdnets.asus.com/pub/ASUS/"
    downloadLink += (fwInfo.PATH) ? downloadPath[fwInfo.PATH] : "wireless/ASUSWRT/";
    downloadLink += fwInfo.MODEL;
    downloadLink += "_";
    downloadLink += fwInfo.FW.replace("004", "004_");
    downloadLink += "_";
    downloadLink += fwInfo.EXT;
    downloadLink += "_";
    downloadLink += fileType[type];

    return downloadLink;
}

app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

app.get('/updateMD5.cgi', function (req, res) {
	urllib.request(getDownloadLink(req.query, "trx"), function (errTrx, dataTrx, resTrx) {
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

	console.log(getDownloadLink(req.query, "rsa"))
	console.log(getDownloadLink(req.query, "note"))
	console.log(getDownloadLink(req.query, "trx"))

	urllib.request(getDownloadLink(req.query, "rsa"), function (errRsa, dataRsa, resRsa) {
		if(resRsa.statusCode.toString() === "404") err.push("No RSA");

		urllib.request(getDownloadLink(req.query, "note"), function (errNote, dataNote, resNote) {
			if(resNote.statusCode.toString() === "404") err.push("No Note");
	
			urllib.request(getDownloadLink(req.query, "trx"), function (errTrx, dataTrx, resTrx) {
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
	console.log('LiveUpdate proxy listening on port 3000!');
});