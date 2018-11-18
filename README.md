# Wunderpong player ladder for wunderdog ping pong games 🏓

![Table Tennis Smashdown](https://i.imgur.com/fEtlmrI.png)

Optimized for fullhd display.

### AWS deployment

On the first time:
1. Login to AWS CLI with `aws configure`

Then:
1. Login to Docker registry with `$(aws ecr get-login --no-include-email --region eu-west-1)`. The login stays valid for 12 hours.
2. Package with `docker build . -t 766261213300.dkr.ecr.eu-west-1.amazonaws.com/wunderpong:latest`
3. Push container with `docker push 766261213300.dkr.ecr.eu-west-1.amazonaws.com/wunderpong:latest`
4. Delete old pod with `kubectl delete pods -l app=wunderpong-app`. A new pod with the new image will be automatically created. The command takes a while to finish since it waits for the pod to be completely deleted.

If you need to change the deployment configuration, apply changes with `kubectl apply -f deploy/wunderpong.yaml`.

### url
[wunderpong.lab.wunder.dog](https://wunderpong.lab.wunder.dog/)

### slack commands

`/pingpongmatch <winner> <loser>` -  adds new match record

`/pingpongundo <playername>` -  Undos player's latest match

`/pingpongladder` - displays current player ladder



### Dev setup

1. Setup postgres database
2. Add `DATABASE_URL` to `.env` file
3. [optional] Set `DEVELOPMENT_API_URL` in `.env` if other than localhost:3000
4. `npm i` or `yarn`
5. `npm run dev` or `yarn dev`
6. Go to [localhost:1234](http://localhost:1234)

### Todo

* nothing here

### .env
```
DATABASE_URL=<postgres url>
PRODUCTION_API_URL=https://wunderpong.lab.wunder.dog/api
DEVELOPMENT_API_URL=< optional url for api, defaults to localhost:3000>
SLACK_WEBHOOK_URL=<slack webhook url>
```
