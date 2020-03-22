"use strict"

require("dotenv").config()

const Koa = require("koa")
const path = require("path")
const serve = require("koa-static")
const bodyParser = require("koa-bodyparser")
const koaBody = require("koa-body")
const helmet = require("koa-helmet")
const morgan = require("./logger")
const compress = require("koa-compress")
const session = require("koa-session")
const redisStore = require("koa-redis")
const passport = require("koa-passport")
const connections = require("./connections")
const OAuth2Server = require("oauth2-server")
const mount = require("koa-mount")
const line = require("./lib/line")
// routes
const autoRoutes = require("./utils/auto-routes")
const koaSwagger = require("koa2-swagger-ui")

// app configs
const { accessLogStream } = require("./rotating")
const { appLogger } = require("./stream")
let { corsOptions, sessionOptions, socketOptions } = require("./configs")
sessionOptions = Object.assign(sessionOptions, {
  store: redisStore({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: process.env.REDIS_DB
  })
})
const host = process.env.HOST || "localhost"
const port = process.env.PORT || 3000

// init app
const app = new Koa({ proxy: true, keys: ["29c147ab05b8fb57ed6213e6abcc2fe9324224fa"] })
const oauth = new OAuth2Server({
  model: require("./models/oauth-model"),
  accessTokenLifetime: 60 * 60 * 24, // 24hours
  allowBearerTokensInQueryString: true
})

const http = require("http").createServer(app.callback())
const io = require("socket.io")(http, socketOptions)

// middlewares
const { responseTime, logger, cors, errorHandler, rateLimiter } = require("./middlewares")

const publicFiles = serve(path.join(__dirname, "public"))
publicFiles._name = "static/public"

// context
app.context.mysql = connections.mysql
app.context.db_api_udh = connections.db_api_udh
app.context.db_queue = connections.db_queue
app.context.mssql = connections.mssql
app.context.mongoose = connections.mongoose
app.context.redis = connections.redis
app.context.oauth = oauth
app.context.line = line
app.context.soapClient = connections.soapClient
app.context.log = appLogger

// logger
app.use(logger)
app.use(morgan("combined", { stream: accessLogStream }))
// x-response-time
app.use(responseTime)
// cors
app.use(async (ctx, next) => {
  ctx.set("Server", "nginx")
  await next()
})
app.use(cors(corsOptions))
app.use(koaBody({ multipart: true, parsedMethods: ["POST", "PUT", "PATCH", "DELETE"] }))
app.use(
  bodyParser({
    enableTypes: ["json", "form"],
    jsonLimit: "10mb"
  })
)

app.use(helmet())
app.use(compress())
app.use(session(sessionOptions, app))
// authentication
require("./passport/auth")(app.context.db_queue)
app.use(passport.initialize())
app.use(passport.session())
app.use(rateLimiter)
require("./socket.io")(io)
// static
app.use(mount("/public", publicFiles))
// app.use(publicFiles)
// error handler
app.use(errorHandler)
// routes
autoRoutes(app, path.join(__dirname, "routes"))
app.use(
  koaSwagger({
    routePrefix: "/docs", // host at /swagger instead of default /docs
    swaggerOptions: {
      url: "https://petstore.swagger.io/v2/swagger.json" // example path to json
    }
  })
)

app.use((ctx, next) => {
  ctx.throw(404, "Not Found.")
})

http.listen(port, host, err => {
  if (err) console.log(err)
  console.log(`app listening on http://${host}:${port}`)
})
