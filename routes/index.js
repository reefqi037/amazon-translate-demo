const createError = require('http-errors');
const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');

const region = 'us-east-1';
AWS.config.region = region;
AWS.config.apiVersions = {
  translate: '2017-07-01',
  comprehend: '2017-11-27'
};

const comprehend = new AWS.Comprehend();
const translate = new AWS.Translate();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Amazon Translate Demo' });
});

/* POST translate text. */
router.post('/translate', async (req, res, next) => {
  try {
    const { inputText: Text } = req.body;
    const comprehendResult = await comprehend.detectDominantLanguage({ Text }).promise();
    const { LanguageCode: SourceLanguageCode = 'ja' } = comprehendResult.Languages[0];
    const TargetLanguageCode = SourceLanguageCode === 'en' ? 'ja' : 'en';
    const translateResult = await translate.translateText({ SourceLanguageCode, TargetLanguageCode, Text }).promise();
    res.send(translateResult);
  } catch (err) {
    res.status(err.statusCode || 500);
    res.send(createError(err.status, err));
  }
});

module.exports = router;
