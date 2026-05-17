const { MongoClient } = require('mongodb')

class Database {

    constructor() {

        this.url =
            'mongodb://127.0.0.1:27017'

        this.client =
            new MongoClient(this.url)

        this.dbName =
            'perpustakaan'
    }

    async connect() {

        await this.client.connect()

        console.log('MongoDB Connected')

        global.db =
            this.client.db(this.dbName)
    }}

module.exports = Database