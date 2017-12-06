var express = require("express");
var app = express();
var fs = require('fs');
var request = require('request');
var FB = require('fb');
var count = 1;
app.set("view engine","ejs");
app.set("vỉews","./views");
const bodyParser = require('body-parser');

app.use(bodyParser.json({ extend: true }));
app.use(bodyParser.urlencoded({ extend: true }));
var token;
var danhsach ="";
var arr = new Array;
var id;
app.get('/',(req,res) =>{
	res.render("trangchu.ejs");
})

app.post("/senUrl",(req,res) =>{
	id = req.body.group;
	token = req.body.token;
	FB.setAccessToken(token);
	res.redirect("/result");
})

app.get("/result", (req,res) => {
	var run = true;
	res.send("Check file: danhsachid.txt");
	getId();
})

function getId(){
	FB.api(
		id,
		'GET',
		{"fields":"members.limit(1000){id}"},
		function(response) {
			response.members.data.forEach(function(data) {
				arr.push(data.id);
			});
			after = response.members.paging.after;
			request(response.members.paging.next,(error, response, body)=>{
				var	obj = JSON.parse(body);
				var next = obj.paging.next;
				console.log("request: "+count +" times");
				count++;
				obj.data.forEach(function(data) {
					arr.push(data.id);
				});
				var run = true;
				if(next !== undefined){
					getIdByLink(next);
				}
			})
		}
	  );
}

function getIdByLink(next){
	request(next,(err, res, body)=>{
		var	obj = JSON.parse(body);
		if(obj.paging.next !== undefined){
			next = obj.paging.next;
		}
		console.log("request: "+count +" times");
		count++;
		obj.data.forEach(function(data) {
			arr.push(data.id);
		});
		if(obj.paging.next !== undefined){
			setTimeout(()=>{
				getIdByLink(next)
			}, 2);
		}
		if(obj.paging.next == undefined){
			arr.forEach((data) =>{
				danhsach = danhsach + data;
				danhsach = danhsach + "   ";
			})
			fs.writeFile("danhsachid.txt",danhsach,() =>{
				console.log("so id: " + arr.length);
			});
		}
	}
	)
}

function auto(cb){
	getId();
	cb();
}

app.listen(3000,() => {
	console.log("server start ");
});