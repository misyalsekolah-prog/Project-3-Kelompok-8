class BookModel {

    constructor() {

        this.books_collection = global.db.collection('books')
        this.borrower_collection = global.db.collection('borrower')
        this.borrowing_collection = global.db.collection('borrowing')
        this.officers_collection = global.db.collection('officers')
        this.return_collection = global.db.collection('return')
    }

    async show_books() {

        const books =
            await this.books_collection.find().toArray()

        console.log('\n===BOOK LIST===')

        if (books.length == 0) {
            console.log('No books found')
            return
        }

        books.forEach((b, i) => {

            console.log(`${i + 1}. ${b.judul}`)
            console.log(`ISBN: ${b.isbn}`)
            console.log(`Author: ${b.penulis.join(', ')}`)
            console.log(`Category: ${b.kategori}`)
            console.log(`Year: ${b.tahun}`)
            console.log(`Rating: ${b.rating}`)
            console.log(`Stock: ${b.stock}\n`)
        })
    }

    async search_book(judul) {

        const books =
            await this.books_collection.find({
                judul: {
                    $regex: judul,
                    $options: 'i'
                }
            }).toArray()

        console.log('\n=== SEARCH RESULT ===')

        if (books.length == 0) {
            console.log('Book not found')
            return
        }

        books.forEach((b, i) => {

            console.log(`${i + 1}. ${b.judul}`)
            console.log(`ISBN: ${b.isbn}`)
            console.log(`Penulis: ${b.penulis.join(', ')}`)
            console.log(`Rating: ${b.rating}`)
            console.log(`Stock: ${b.stock}\n`)
        })
    }

    async borrow_book(name, id, phone, book_isbn, day, date) {

        const book =
            await this.books_collection.findOne({ isbn: book_isbn })

        if (!book) {
            console.log('Book not found')
            return
        }

        const officer = await this.officers_collection.findOne({work_time: day})

        if (book.stock <= 0) {
            console.log('Out of stock')
            return
        }

        await this.borrowing_collection.insertOne({
            borrower_id : id,
            book_isbn,
            day,
            date,
            officer_id: officer.officer_id,
            status: 'Borrowed'
        })

        const borrower = await this.borrower_collection.findOne({
            borrower_id: id
        })

        if (!borrower){
            await this.borrower_collection.insertOne({
                borrower_id: id,
                borrower_name: name,
                phone_number: phone
            })
        }

        await this.books_collection.updateOne(
            { isbn: book_isbn },
            { $inc: { stock: -1 } }
        )

        console.log('Book borrowed successfully')
        console.log(`Remaining stock: ${book.stock - 1}`)
    }

    async return_book(borrower_id, book_isbn, day, date) {

        const borrow_r =
            await this.borrowing_collection.findOne({
                borrower_id,
                book_isbn,
                status: 'Borrowed'
            })

        if (!borrow_r) {
            console.log(' Data not found')
            return
        }

        const officer = await this.officers_collection.findOne({
            work_time: day
        })

        await this.return_collection.insertOne({
            borrower_id,
            book_isbn,
            day,
            date,
            officer_id: officer.officer_id,
            status: 'Returned'
        })

        await this.borrowing_collection.deleteOne({
            borrower_id,
            book_isbn
        })

        await this.books_collection.updateOne(
            { isbn: book_isbn},
            { $inc: { stock: 1 } }
        )

        console.log('Book returned successfully')
    }

    async book_category_statistics() {

        const statistic =
            await this.books_collection.aggregate([

                {
                    $group: {
                        _id: '$kategori',
                        total: { $sum: 1 }
                    }
                }

            ]).toArray()

        statistic.forEach((r) => {
            console.log(`${r._id}: ${r.total}`)
        })
    }


    async high_rate_book (){
        const  rate_high = await this.books_collection.aggregate([
            {$sort: {
                rating: -1
            }}, 
            {
                $limit: 20
        }]).toArray()

        console.log('=== 20 Book Based on High Rate ===\n')

        rate_high.forEach((r, i) =>{
            console.log(`${i + 1}. ${r.judul}`)
            console.log(`ISBN: ${r.isbn}`)
            console.log(`Rating: ${r.rating}\n`)
        })
    }
}
module.exports = BookModel