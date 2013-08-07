var http    = require('http'),
    express = require('express'),
    crypto  = require('crypto'),
    app     = express();

// app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.static(__dirname + '/..'));

app.get('/signed-url', function(req, res) {
  var s3Bucket = process.env.AWS_BUCKET;
  var s3Id     = process.env.AWS_ACCESS_KEY_ID;
  var s3Secret = process.env.AWS_SECRET;
  var filename = req.query.name;
  var name     = "uploads/test/" + filename;
  var expires  = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  var policy = Buffer(JSON.stringify({
    "expiration": expires,
    "conditions": [
      {"bucket": s3Bucket},
      ["starts-with", "$key", ""],
      {"acl": "private"},
      {"expires": expires},
      {"success_action_status": "200"},
      ["starts-with", "$Content-Type", ""],
      ["content-length-range", 0, 524288000]
    ]
  })).toString('base64');

  var signature = crypto
    .createHmac('sha1', s3Secret)
    .update(policy)
    .digest('base64');

  res.send({
    bucket: s3Bucket,
    expires: expires,
    awsaccesskeyid: s3Id,
    signature: signature,
    key: name,
    acl: 'private',
    'Content-Type': '$Content-Type',
    success_action_status: '200',
    policy: policy
  });
});

app.post('/upload', function(req, res) {
  var file = req.files.file;
  if (file) return res.send(200);
  res.send(400);
});

module.exports = http.createServer(app);
