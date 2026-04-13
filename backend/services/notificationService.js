let clients = []

const addClient = (res) => {
    clients.push(res)
}

const removeClient = (res) => {
    clients = clients.filter(c => c !== res)
}

const sendNotification = (data) => {
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(data)}\n\n`)
    })
}

const sseHandler = (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    addClient(res)

    req.on('close', () => removeClient(res))
}

export { sseHandler, sendNotification }
