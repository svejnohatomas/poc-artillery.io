# Proof of Concept - Artillery

## Introduction
A Proof of Concept for using [Artillery](https://artillery.io/) for backend performance testing, publishing metrics to [InfluxDB 2.0](https://docs.influxdata.com/influxdb/v2.0/get-started/) through [Telegraf](https://www.influxdata.com/time-series-platform/telegraf/), and displaying them using [Grafana](https://grafana.com/).

![Grafana dashboard](./docs/img/GrafanaDashboard.png)

## Prerequisite
- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/en/) (tested with Node.js 20 LTS)

## Run and setup testing infrastructure
1. Run Docker Compose: ```docker-compose up -d```
   - This will run [InfluxDB 2.0](http://localhost:8086), Telegraf, [Grafana](http://localhost:3000/) and a [Weather Forecast API](http://localhost:5000/weatherForecast)

1. Go to your [Grafana](http://localhost:3000/) and log in
   - username: `admin`
   - password: `admin`

1. Connect Grafana to Influx DB
   - Go to [Add data source](http://localhost:3000/datasources/new), select InfluxDB and configure the following

      ```yaml
      Query Language: Flux # InfluxDB 2.0
      HTTP:
        URL: http://influxdb2:8086 # InfluxDB address inside Docker
      Auth:
        Basic auth: false # Turn off Basic Auth
      InfluxDB Details:
        Organization: poc-organization
        Token: my-super-secret-auth-token # You should issue a new Read-Only access token for Grafana in your InfluxDB
        Default Bucket: poc-artillery.io
      ```

1. Create a new Grafana Dashboard (_you can find the finished dashboard [here](./templates/grafana/dashboard-weather-forecast.json)_)
    - Go to [Dashboards](http://localhost:3000/dashboards) and click [New Dashboard](http://localhost:3000/dashboard/new)
    - Click `Add an empty panel`
      - **Responses**
        - Panel (Settings)
          - Panel title: `Responses`
        - Query

          ```
          from(bucket: "poc-artillery.io")
            |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
            |> filter(fn: (r) =>
                  r["_measurement"] =~ /artillery_http_codes_1[0-9]{2}/ or
                  r["_measurement"] =~ /artillery_http_codes_2[0-9]{2}/ or
                  r["_measurement"] =~ /artillery_http_codes_3[0-9]{2}/ or
                  r["_measurement"] =~ /artillery_http_codes_4[0-9]{2}/ or
                  r["_measurement"] =~ /artillery_http_codes_5[0-9]{2}/)
            |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
            |> yield(name: "mean")
          ```

        - Overrides (Fields with name matching regex)
          - 200 Responses
            - RegEx: `artillery_http_codes_200.+`
            - Display name: `200`
          - 400 Responses
            - RegEx: `artillery_http_codes_400.+`
            - Display name: `400`
          - 404 Responses
            - RegEx: `artillery_http_codes_404.+`
            - Display name: `404`

      - **HTTP Response Time (Latency)**
        - Panel (Settings)
          - Panel title: `HTTP Response Time (Latency)`
        - Field (Standard options)
          - Unit: `milliseconds (ms)` (under _Time_)
        - Query

          ```
          from(bucket: "poc-artillery.io")
            |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
            |> filter(fn: (r) =>
                  r["_measurement"] == "artillery_http_response_time_max" or
                  r["_measurement"] == "artillery_http_response_time_median" or
                  r["_measurement"] == "artillery_http_response_time_min" or
                  r["_measurement"] == "artillery_http_response_time_p95" or
                  r["_measurement"] == "artillery_http_response_time_p99")
            |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
            |> yield(name: "mean")
          ```

        - Overrides (Fields with name matching regex)
          - Maximum latency
            - RegEx: `artillery_http_response_time_max.+`
            - Display name: `Maximum`
          - Median latency
            - RegEx: `artillery_http_response_time_median.+`
            - Display name: `Median`
          - Minimum latency
            - RegEx: `artillery_http_response_time_min.+`
            - Display name: `Minimum`
          - 95th percentile latency
            - RegEx: `artillery_http_response_time_p95.+`
            - Display name: `95th percentile latency`
          - 99th percentile latency
            - RegEx: `artillery_http_response_time_p99.+`
            - Display name: `99th percentile latency`

      - **Traffic**
        - Panel (Settings)
          - Panel title: `Traffic`
        - Field (Standard options)
          - Unit: `requests/sec (rps)` (under _Throughput_)
        - Query

          ```
          from(bucket: "poc-artillery.io")
            |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
            |> filter(fn: (r) => r["_measurement"] == "artillery_http_request_rate")
            |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
            |> yield(name: "mean")
          ```

        - Overrides (Fields with name matching regex)
          - Maximum latency
            - RegEx: `value.+`
            - Display name: `Number of requests`

## Run Tests
1. Go to test folder: ```cd .\test\performance-testing\```
1. Install dependencies: ```npm install```
1. Run tests: ```npm run weather-forecast```

> You should now see your [Artillery output in Grafana](http://localhost:3000/).  
> If you can't see anything in Grafana, [check InfluxDB](http://localhost:8086/) bucket (Data/Buckets/poc-artillery.io).

# Authors
- Tomas Svejnoha
  - GitHub: [svejnohatomas](https://github.com/svejnohatomas)
  - LinkedIn: [Tomáš Švejnoha](https://www.linkedin.com/in/tomas-svejnoha/)
