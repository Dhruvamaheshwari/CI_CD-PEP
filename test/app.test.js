const request = require('supertest')

// import the inde.js
const app = require('../index')

describe('test the index file' , () => {

    test('get / api test ' , async() => {
        // app provide kr rha h port no.
        const res = await request(app).get('/')
        expect(res.statusCode).toBe(200)
        expect(res.text).toBe('hello jee kya haal h')
    })

    test('post /mul api test' , async()=>{
        const res = await request(app).post('/mul').send({a:2 , b:3})
        expect(res.statusCode).toBe(200)
        expect(res.body.result).toBe(6)
    })
    test('post /mul api test' , async()=>{
        const res = await request(app).post('/mul').send({a:5 , b:2})
        expect(res.statusCode).toBe(200)
        expect(res.body.result).toBe(10)
    })
    test('post /mul api test' , async()=>{
        const res = await request(app).post('/mul').send({a:5 , b:"2"})
        expect(res.statusCode).toBe(200)
        expect(res.body.result).toBe("error")
    })

})
