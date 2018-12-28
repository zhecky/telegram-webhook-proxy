const request = require("request");
const yaml = require('js-yaml');
const fs   = require('fs');

const doc = yaml.safeLoad(fs.readFileSync('params.yml', 'utf8'));

const BOT_TOKEN = doc['source']['botToken'];
const BOT_BASE = 'https://api.telegram.org/bot' + BOT_TOKEN + '/';
const WEBHOOK_URL = doc['destination']['webhookUrl'];
const APPLICATION_JSON_HEADER = { 'Content-type': 'application/json' };

var offset = 0;

function webHook(data) {
    request({
        method: 'POST',
        url: WEBHOOK_URL,
        headers: APPLICATION_JSON_HEADER,
        body: JSON.stringify(data, null, 2)
    }, function (err, res, body) {
        if (err){
            console.error(err);
            if(!doc['destination']['retryOnError']) {
                // not need to retry, just skip
                pollingAgainAsync(data['update_id'] + 1, doc['destination']['nextUpdateTimeout']);
            } else {
                // honor retry timeout
                pollingAgainAsync(data['update_id'], doc['destination']['retryOnErrorTimeout']);
            }
        } else {
            if (doc['destination']['printWebhookResponse']) {
                console.log("Webhook response:\n" + body)
            }

            if (doc['destination']['apiCallAfterWebhook']) {
                try {
                    var echoMethodObj = JSON.parse(body);
                    if (echoMethodObj && echoMethodObj['method']) {

                        var methodName = echoMethodObj['method'];
                        delete echoMethodObj['method'];

                        request({
                            method: 'POST',
                            url: BOT_BASE + methodName,
                            headers: APPLICATION_JSON_HEADER,
                            body: JSON.stringify(echoMethodObj)
                        }, function (err, resp, body) {
                            if (err) {
                                console.error("Error making request when getting update: " + err);
                            } else {
                                if (doc['destination']['printAPIResultAfterWebhook']){
                                    console.log("API response while making request after webhook:\n" + JSON.stringify(JSON.parse(body), null, 2));
                                }
                            }
                            pollingAgainAsync(data['update_id'] + 1, doc['destination']['nextUpdateTimeout']);
                        });
                    } else {
                        pollingAgainAsync(data['update_id'] + 1, doc['destination']['nextUpdateTimeout']);
                    }
                } catch (err) {
                    console.error(err);
                    pollingAgainAsync(data['update_id'] + 1, doc['destination']['nextUpdateTimeout']);
                }
            } else {
                pollingAgainAsync(data['update_id'] + 1, doc['destination']['nextUpdateTimeout']);
            }
        }
    })
}

function pollingAgainAsync(newOffset, timeout) {
    offset = newOffset;
    setTimeout(function () {
        polling();
    }, doc['destination']['nextUpdateTimeout']);
}

function polling() {
    request({
        method: 'GET',
        url: BOT_BASE + 'getUpdates',
        qs: {
            'timeout': doc['source']['pollingTimeout'],
            'limit': 1,
            'offset': offset
        }
    }, pollingHandler)
}

function pollingHandler(error, response, body) {

    var updatesResultObj = JSON.parse(body);
    if(updatesResultObj['ok'] == 'false') {
        console.error(updatesResultObj['error']);
    } else if(updatesResultObj['result'].length == 1) {
        var updateItem = updatesResultObj['result'][0];
        if(doc['source']['printReceivedUpdates']) {
            console.log("Registered update from source:\n" + JSON.stringify(updateItem, null, 2));
        }
        webHook(updateItem);
    } else {
        pollingAgainAsync(offset, doc['destination']['nextUpdateTimeout']);
    }
}

polling();
