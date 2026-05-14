class BookModel {

    constructor() {

        this.books_collection = global.db.collection('book')
        this.borrower_collection = global.db.collection('borrower')
        this.borrowing_collection = global.db.collection('borrowing')
        this.officers_collection = global.db.collection('officer')
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
            console.log(`Page: ${b.halaman}`)
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
            console.log(`Page: ${b.halaman}`)
            console.log(`Rating: ${b.rating}`)
            console.log(`Synopsis: ${b.sinopsis}`)
            console.log(`Cover: ${b.cover}`)
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

        if (book)

        const officer = await this.officers_collection.findOne({work_time: day})

        if (book.stock <= 0) {
            console.log('Out of stock')
            return
        }

        const borrowing_exist = await this.borrowing_collection.findOne({
            borrower_id: id,
            book_isbn: book_isbn
        })

        if (borrowing_exist){
            console.log('You are still borrowing this book')
        }
        return

        const borrow_date = new Date(date)
        const due_date = new Date(borrow_date)

        due_date.setDate(due_date.getDate() + 14)

        await this.borrowing_collection.insertOne({
            borrower_id : id,
            book_isbn,
            day,
            borrow_date,
            due_date,
            officer_id: officer.officer_id,
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
        console.log(`Due Date: ${due_date.toDateString()}`)
    }

    async return_book(borrower_id, book_isbn, day, date) {

        const borrow_r =
            await this.borrowing_collection.findOne({
                borrower_id,
                book_isbn,
            })

        if (!borrow_r) {
            console.log(' Data not found')
            return
        }

        const officer = await this.officers_collection.findOne({
            work_time: day
        })

        const return_date = new Date(date)

        let fine = 0
        let late_days = 0

        if (return_date > borrow_r.due_date){
            const late_time = return_date - borrow_r.due_date
            late_days = Math.ceil(late_time / (1000 * 60 * 60 * 24))
            fine = late_days * 5000
        }

        await this.return_collection.insertOne({
            borrower_id,
            book_isbn,
            day,
            return_date,
            due_date: borrow_r.due_date,
            fine,
            officer_id: officer.officer_id,
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
        if(fine > 0){
            console.log(`Your fine during ${late_days} day: ${fine}`)
        }
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

        console.log('=== 20 Book Based on Highest Rate ===\n')

        rate_high.forEach((r, i) =>{
            console.log(`${i + 1}. ${r.judul}`)
            console.log(`ISBN: ${r.isbn}`)
            console.log(`Rating: ${r.rating}\n`)
        })
    }
}
module.exports = BookModel