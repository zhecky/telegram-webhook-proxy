# telegram-webhook-proxy
Telegrap bot proxy for local webhook.

Useful for local bot developing when need to use [webhooks](https://core.telegram.org/bots/api#setwebhook). But it's just a little difficult when IP is not public accessable or Firewall is so angry. Here is a way to use [getUpdates](https://core.telegram.org/bots/api#getupdates), but it's also bad show (try to realise it on PHP or when [request-on-response](https://core.telegram.org/bots/api#making-requests-when-getting-updates) are used).

This tiny programm will helps You. It just getting update using [getUpdates](https://core.telegram.org/bots/api#getupdates) method (don't panic: [long poll](https://www.pubnub.com/blog/2014-12-01-http-long-polling/) is used) and sends it to hebhook You're specified. Error retrying and [request-on-response](https://core.telegram.org/bots/api#making-requests-when-getting-updates) are honored.

## Steps to run:

1. Create dir
```bash
mkdir webhookproxy && cd "$_"
```

2. Clone repo
```bash
git clone https://github.com/zhecky/telegram-webhook-proxy.git .
```

3. Load dependencies
```bash
npm install
```

4. Configure your bot api and callback
```bash
nano params.yml
```

5. Run
```bash
node main.js
```

## params.yml description

### source

#### botToken
Current telegram bot token

#### pollingTimeout
Telegram long polling timeout

#### printReceivedUpdates
Pretty print received update's json to stdout

### destination

#### webhookUrl
Local or another webhook url to post received updates

#### retryOnError
If webhook invoke fails, that update will not be "acknowledged", and retried again

#### retryOnErrorTimeout
Sleep time before retry after error (if retryOnError enabled)

#### nextUpdateTimeout
Interval between webhook invoged for each update. Useful when event queue is large and webhook backend is weak/slow etc

#### printWebhookResponse
Print webhook raw body to stdout

#### apiCallAfterWebhook
If enabled, [request-on-response](https://core.telegram.org/bots/api#making-requests-when-getting-updates) will be executed. Non-json ansver or error during API call is not reason for retry (just like telegram do)

#### printAPIResultAfterWebhook
Print [request-on-response](https://core.telegram.org/bots/api#making-requests-when-getting-updates) api call result to stdout
