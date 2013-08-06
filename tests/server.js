var http    = require('http'),
    express = require('express'),
    app     = express();

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.static(__dirname + '/..'));

app.post('/upload', function(req, res) {
  var file = req.files.file;
  if (file) return res.send(200);
  res.send(400);
});

module.exports = http.createServer(app);
