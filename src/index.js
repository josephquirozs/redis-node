import express from 'express'
import axios from 'axios'
import responseTime from 'response-time'
import redis from 'redis'

const app = express()

const client = redis.createClient({
    host: 'localhost',
    port: 6379
})

app.use(responseTime())

app.get('/', async (req, res) => {
    res.json('Welcome to REST API')
})

app.get('/characters', async (req, res) => {
    const dataKey = req.originalUrl
    await client.connect()
    const cachedData = await client.get(dataKey)
    if (cachedData) {
        await client.disconnect()
        return res.json(JSON.parse(cachedData))
    }
    const response = await axios.get('https://rickandmortyapi.com/api/character')
    await client.set(dataKey, JSON.stringify(response.data))
    await client.disconnect()
    res.json(response.data)
})

app.listen(3000)

console.log('Server running on port 3000')