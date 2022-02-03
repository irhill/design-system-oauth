const fastify = require('fastify')({ logger: true })
const tiny = require('tiny-json-http')

const client_id = 'dummy_client_id'
const client_secret = 'dummy_client_secret'
const authUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`
const tokenUrl = 'https://github.com/login/oauth/access_token'

fastify.get('/', _ => {
  console.log('FASTIFY: "/" Request accepted')
  return {
    message: 'Response from server 👌'
  }
})

fastify.get('/auth', (_, reply) => reply.redirect(authUrl))

fastify.get('/callback', async (request, reply) => {
  const data = {
    code: request.query.code,
    client_id,
    client_secret
  }

  try {
    const body = await tiny.post({
      url: tokenUrl,
      data,
      headers: {
        // GitHub returns a string by default, ask for JSON to make the response easier to parse
        "Accept": "application/json" 
      }
    })

    const postMsgContent = {
      token: body.access_token,
      provider: 'github'
    }

    // This is what talks to the NetlifyCMS page. Using window.postMessage we give it the
    // token details in a format it's expecting
    const script = `
      <script>
        (function() {
          function receiveMessage(e) {
            console.log("receiveMessage %o", e)
            
            // send message to main window with the app
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify(postMsgContent)}', 
              e.origin
            )
          }
          window.addEventListener("message", receiveMessage, false)
          window.opener.postMessage("authorizing:github", "*")
        })()
      </script>`
    
    reply.send(script)
  } catch (err) {
    console.error(err)
    reply.redirect('/?error=😡')
  }
})

const port = process.env.PORT || 3000
fastify.listen(port, '0.0.0.0', err => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
