# octopod
Octopod automatically extracts highlights from podcast-like audio files.

## usage

```bash
$ curl -s https://octopod.kevz.app/api/v1/submit -F "file=@prototype/content/browser.mp3"
{"id":"YOUR_SUBMISSION_ID"}

curl -s https://octopod.kevz.app/api/v1/submission/{YOUR_SUBMISSION_ID}
{"highlights":[...]}
```
